import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }
  
  return user
}

export async function requireSubscription(allowedTiers: string[] = []) {
  const user = await requireAuth()
  const supabase = await createClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['trialing', 'active'])
    .single()
  
  if (!subscription) {
    redirect('/pricing')
  }
  
  if (allowedTiers.length > 0 && !allowedTiers.includes(subscription.tier)) {
    redirect('/pricing')
  }
  
  return { user, subscription }
}

export async function getSubscriptionStatus(userId: string) {
  const supabase = await createClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .single()
  
  return subscription
}