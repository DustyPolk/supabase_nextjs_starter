import { createClient } from '@/utils/supabase/server'
import { stripe } from './config'
import { redirect } from 'next/navigation'

export async function getOrCreateCustomer(userId: string, email: string) {
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

export async function createCheckoutSession(priceId: string, userId: string, email: string) {
  const customerId = await getOrCreateCustomer(userId, email)
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    metadata: {
      user_id: userId,
    },
  })

  return session
}

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
  })

  return session
}

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()
  
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .single()

  return { subscription, error }
}

export async function checkSubscriptionAccess(userId: string, requiredTiers: string[] = []) {
  const { subscription } = await getUserSubscription(userId)
  
  if (!subscription) {
    return false
  }

  if (requiredTiers.length === 0) {
    return true
  }

  return requiredTiers.includes(subscription.tier)
}