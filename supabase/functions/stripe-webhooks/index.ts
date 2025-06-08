// @deno-types="npm:@types/stripe"
import Stripe from 'npm:stripe';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient, PostgrestError } from 'https://esm.sh/@supabase/supabase-js@2';

console.log(`Function "stripe-webhooks" initializing...`);

// NOTE TO REVIEWER/USER:
// This implementation assumes a `stripe_customer_id` TEXT column exists on `public.profiles`.
// It ALSO crucially assumes a `stripe_subscription_id` TEXT UNIQUE column exists on `public.subscriptions`.
// The original migration for `subscriptions` used a UUID `id` as PK.
// For this webhook logic to correctly upsert/update subscriptions based on Stripe's subscription ID,
// the `subscriptions` table needs a unique way to reference Stripe's ID.

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2024-04-10',
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const relevantEvents = new Set([
  'invoice.payment_succeeded',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  // 'checkout.session.completed', // Consider this for robust initial subscription creation
]);

const toDateTime = (secs: number | null | undefined): string | null => {
  if (secs === null || secs === undefined) return null;
  try {
    return new Date(secs * 1000).toISOString();
  } catch (e) {
    console.warn(`Invalid timestamp: ${secs}`);
    return null;
  }
};

async function getUserIdFromStripeCustomerId(db: SupabaseClient, customerId: string): Promise<string | null> {
  if (!customerId) {
    console.error('Stripe customer ID is null or undefined for getUserIdFromStripeCustomerId.');
    return null;
  }
  const { data, error } = await db
    .from('profiles')
    .select('id') // Assuming 'id' is the user_id (UUID) in your profiles table
    .eq('stripe_customer_id', customerId) // Assuming 'stripe_customer_id' column exists
    .single();

  if (error) {
    console.error(`Error fetching user_id for Stripe customer ID ${customerId}:`, error.message);
    return null;
  }
  return data ? data.id : null;
}

serve(async (req: Request) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error('Stripe-Signature header is missing.');
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables.');
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed or other constructEvent error: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}, ID: ${event.id}`);

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const subId = typeof invoice.subscription === 'string' ? invoice.subscription : (invoice.subscription as Stripe.Subscription)?.id;
          if (!subId) {
            console.warn(`Invoice ${invoice.id} does not have a usable subscription ID. Skipping.`);
            return new Response(JSON.stringify({ received: true, message: "Ignoring invoice without subscription ID." }), { status: 200 });
          }
          const subscriptionDetails = await stripe.subscriptions.retrieve(subId);
          await handleInvoicePaymentSucceeded(supabaseAdmin, invoice, subscriptionDetails);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(supabaseAdmin, subscription);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(supabaseAdmin, subscription);
          break;
        }
        default:
          console.log(`Unhandled relevant event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`Error processing event ${event.type} (ID: ${event.id}): ${err.message}`, err.stack);
      return new Response(JSON.stringify({ error: `Server error processing event: ${err.message}` }), { status: 200 }); // Acknowledge receipt
    }
  } else {
    console.log(`Ignoring irrelevant event type: ${event.type}`);
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});

async function handleInvoicePaymentSucceeded(db: SupabaseClient, invoice: Stripe.Invoice, subscription: Stripe.Subscription) {
  console.log(`Processing invoice.payment_succeeded for invoice ID: ${invoice.id}, subscription ID: ${subscription.id}`);
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  if (!customerId) {
    console.error(`Stripe customer ID is missing on subscription ${subscription.id}.`);
    return;
  }
  const userId = await getUserIdFromStripeCustomerId(db, customerId);

  if (!userId) {
    console.error(`User ID not found for Stripe customer ID: ${customerId}. Subscription ${subscription.id} will not be processed.`);
    return;
  }

  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: subscription.id, // Crucial: map to this new column
    status: subscription.status as any, // Cast to 'any' to match Supabase enum type if Stripe's type is too broad
    product_id: typeof subscription.items.data[0].price.product === 'string' ? subscription.items.data[0].price.product : subscription.items.data[0].price.product?.id!,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    created_at: toDateTime(subscription.created)!,
    current_period_start_at: toDateTime(subscription.current_period_start)!,
    current_period_end_at: toDateTime(subscription.current_period_end)!,
    ended_at: toDateTime(subscription.ended_at),
    cancel_at: toDateTime(subscription.cancel_at),
    canceled_at: toDateTime(subscription.canceled_at),
    trial_start_at: toDateTime(subscription.trial_start),
    trial_end_at: toDateTime(subscription.trial_end),
    metadata: subscription.metadata,
  };

  const { error } = await db.from('subscriptions').upsert(subscriptionData, {
    onConflict: 'stripe_subscription_id', // Requires `stripe_subscription_id` to be UNIQUE
  });

  if (error) {
    console.error(`Error upserting subscription ${subscription.id} for user ${userId}:`, error.message, error);
    throw error;
  }
  console.log(`Subscription ${subscription.id} for user ${userId} (local UUID for subscription might differ) successfully upserted.`);
}

async function handleSubscriptionUpdated(db: SupabaseClient, subscription: Stripe.Subscription) {
  console.log(`Processing customer.subscription.updated for subscription ID: ${subscription.id}`);
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
   if (!customerId) {
    console.error(`Stripe customer ID is missing on subscription ${subscription.id}.`);
    return;
  }
  const userId = await getUserIdFromStripeCustomerId(db, customerId);

  if (!userId) {
    console.error(`User ID not found for Stripe customer ID: ${customerId}. Subscription update ${subscription.id} will not be processed.`);
    return;
  }

  const subscriptionData = {
    status: subscription.status as any,
    product_id: typeof subscription.items.data[0].price.product === 'string' ? subscription.items.data[0].price.product : subscription.items.data[0].price.product?.id!,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start_at: toDateTime(subscription.current_period_start)!,
    current_period_end_at: toDateTime(subscription.current_period_end)!,
    ended_at: toDateTime(subscription.ended_at),
    cancel_at: toDateTime(subscription.cancel_at),
    canceled_at: toDateTime(subscription.canceled_at),
    trial_start_at: toDateTime(subscription.trial_start),
    trial_end_at: toDateTime(subscription.trial_end),
    metadata: subscription.metadata,
    // user_id is not updated here as it's fixed for a subscription
  };

  const { error } = await db.from('subscriptions')
    .update(subscriptionData)
    .eq('stripe_subscription_id', subscription.id); // Match on stripe_subscription_id

  if (error) {
    console.error(`Error updating subscription ${subscription.id} for user ${userId}:`, error.message, error);
    throw error;
  }
  console.log(`Subscription ${subscription.id} for user ${userId} successfully updated.`);
}

async function handleSubscriptionDeleted(db: SupabaseClient, subscription: Stripe.Subscription) {
  console.log(`Processing customer.subscription.deleted for subscription ID: ${subscription.id}`);
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  if (!customerId) {
    console.error(`Stripe customer ID is missing on subscription ${subscription.id}.`);
    return;
  }
  const userId = await getUserIdFromStripeCustomerId(db, customerId);

  if (!userId) {
    console.error(`User ID not found for Stripe customer ID: ${customerId}. Subscription deletion ${subscription.id} will not be processed.`);
    return;
  }

  const subscriptionData = {
    status: subscription.status as any, // Should be 'canceled' or similar
    ended_at: toDateTime(subscription.ended_at) || new Date().toISOString(),
    canceled_at: toDateTime(subscription.canceled_at) || new Date().toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  const { error } = await db
    .from('subscriptions')
    .update(subscriptionData)
    .eq('stripe_subscription_id', subscription.id); // Match on stripe_subscription_id

  if (error) {
    console.error(`Error marking subscription ${subscription.id} as deleted for user ${userId}:`, error.message, error);
    throw error;
  }
  console.log(`Subscription ${subscription.id} for user ${userId} successfully marked as deleted/ended.`);
}

console.log('Function "stripe-webhooks" is ready to serve requests with implemented DB handlers.');
/*
To deploy: supabase functions deploy stripe-webhooks --project-ref <your-project-ref> --no-verify-jwt
*/
