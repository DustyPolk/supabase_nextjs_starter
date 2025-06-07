'use client'

import { useState } from 'react'
import { PRICING_PLANS } from '@/utils/stripe/config'

interface Subscription {
  id: string
  stripe_subscription_id: string
  status: string
  tier: 'starter' | 'pro' | 'enterprise'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  trial_end?: string
}

interface SubscriptionCardProps {
  subscription: Subscription | null
  userId: string
}

export default function SubscriptionCard({ subscription, userId }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'trialing':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'past_due':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'canceled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPlanDetails = (tier: string) => {
    return PRICING_PLANS.find(plan => plan.name.toLowerCase() === tier)
  }

  if (!subscription) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Subscription</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">You don&apos;t have an active subscription.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Choose a plan to get started with premium features.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View pricing plans
            </a>
          </div>
        </div>
      </div>
    )
  }

  const planDetails = getPlanDetails(subscription.tier)
  const isTrialing = subscription.status === 'trialing'
  const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end) : null

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Subscription</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Current subscription details and billing information.</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Plan</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <span className="font-medium capitalize">{subscription.tier}</span>
                {planDetails && (
                  <span className="ml-2 text-gray-600">- {planDetails.price}/month</span>
                )}
              </div>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <span className={getStatusBadge(subscription.status)}>
                {subscription.status.replace('_', ' ')}
              </span>
            </dd>
          </div>
          {isTrialing && trialEndsAt && (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Trial ends</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(subscription.trial_end!)}
              </dd>
            </div>
          )}
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Current period</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </dd>
          </div>
          {subscription.cancel_at_period_end && (
            <div className="bg-red-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-red-500">Cancellation</dt>
              <dd className="mt-1 text-sm text-red-900 sm:mt-0 sm:col-span-2">
                Your subscription will cancel at the end of the current period on {formatDate(subscription.current_period_end)}.
              </dd>
            </div>
          )}
        </dl>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Manage billing'}
        </button>
      </div>
    </div>
  )
}