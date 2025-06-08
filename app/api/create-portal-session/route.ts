import { NextResponse } from 'next/server';
import Stripe from 'stripe'; // Standard Next.js import

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Fetch the user's stripe_customer_id from their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      console.error('Error fetching profile or stripe_customer_id missing:', profileError);
      return new NextResponse(JSON.stringify({ error: 'Stripe customer ID not found for this user.' }), {
        status: 400, // Or 404 if preferred
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stripeCustomerId = profile.stripe_customer_id;
    const returnUrl = `${getURL()}dashboard`; // URL to return to after portal session

    // Create a Stripe Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    if (!portalSession.url) {
        throw new Error('Failed to create Stripe Customer Portal session: No URL returned.');
    }

    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error('Error creating Stripe Customer Portal session:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Failed to create customer portal session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
