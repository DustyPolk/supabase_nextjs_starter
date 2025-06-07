import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Standard Next.js import

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const priceId = body.priceId;
    const quantity = body.quantity || 1;

    if (!priceId) {
      return new NextResponse(JSON.stringify({ error: 'priceId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user's profile to retrieve or store stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching profile:', profileError);
      return new NextResponse(JSON.stringify({ error: 'Error fetching user profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id, // Link Stripe customer to Supabase user ID
        },
      });
      stripeCustomerId = customer.id;

      // Store the new stripe_customer_id in the user's profile
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);

      if (updateProfileError) {
        console.error('Error updating profile with Stripe Customer ID:', updateProfileError);
        // Non-fatal for checkout creation, but should be logged
      }
    }

    const successUrl = `${getURL()}dashboard?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${getURL()}pricing`;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Optionally, pass metadata to the subscription
      subscription_data: {
        metadata: {
          user_id: user.id, // Store Supabase user ID for easier mapping in webhooks
          // Add any other relevant metadata here
        },
      },
    });

    if (!session.id) {
      throw new Error('Failed to create Stripe Checkout session: No session ID returned.');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
