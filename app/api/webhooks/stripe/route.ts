import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

async function getOrCreateCustomer(userId: string, email: string) {
  const supabase = await createClient()
  
  // Check if customer already exists
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existingCustomer?.stripe_customer_id) {
    return existingCustomer.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      user_id: userId
    }
  })

  // Save to database
  await supabase
    .from('customers')
    .insert({
      user_id: userId,
      stripe_customer_id: customer.id
    })

  return customer.id
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Get user ID from customer metadata
        const customer = await stripe.customers.retrieve(customerId)
        if (customer.deleted) {
          throw new Error('Customer was deleted')
        }
        
        const userId = customer.metadata.user_id
        if (!userId) {
          throw new Error('No user_id in customer metadata')
        }

        // Determine tier from price ID
        let tier: 'starter' | 'pro' | 'enterprise' = 'starter'
        const priceId = subscription.items.data[0]?.price.id
        
        // You'll need to update these with your actual price IDs
        if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
          tier = 'starter'
        } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          tier = 'pro'
        } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
          tier = 'enterprise'
        }

        // Upsert subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            status: subscription.status,
            tier,
            stripe_price_id: priceId,
            quantity: subscription.items.data[0]?.quantity || 1,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          }, {
            onConflict: 'stripe_subscription_id'
          })

        if (subError) throw subError

        // Upsert subscription items
        for (const item of subscription.items.data) {
          const { error: itemError } = await supabase
            .from('subscription_items')
            .upsert({
              subscription_id: subscription.id,
              stripe_subscription_item_id: item.id,
              stripe_price_id: item.price.id,
              quantity: item.quantity || 1
            }, {
              onConflict: 'stripe_subscription_item_id'
            })

          if (itemError) throw itemError
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) throw error
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        
        // Get user ID from customer
        const customer = await stripe.customers.retrieve(customerId)
        if (customer.deleted) {
          throw new Error('Customer was deleted')
        }
        
        const userId = customer.metadata.user_id
        if (!userId) {
          throw new Error('No user_id in customer metadata')
        }

        // Get subscription ID from our database
        let subscriptionId = null
        if (invoice.subscription) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single()
          
          subscriptionId = sub?.id
        }

        const { error } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            stripe_invoice_id: invoice.id,
            stripe_customer_id: customerId,
            subscription_id: subscriptionId,
            amount_paid: invoice.amount_paid,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            status: invoice.status || 'paid'
          })

        if (error) throw error
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)

          if (error) throw error
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}