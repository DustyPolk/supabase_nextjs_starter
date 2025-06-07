import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PRICING_PLANS } from '@/utils/stripe/config'
import { CheckIcon } from '@heroicons/react/24/solid'
import SubscribeButton from './SubscribeButton'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get current subscription if user is logged in
  let currentSubscription = null
  if (user) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['trialing', 'active'])
      .single()
    
    currentSubscription = data
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = currentSubscription?.tier === plan.name.toLowerCase()
            
            return (
              <div
                key={plan.name}
                className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                  plan.popular
                    ? 'border-2 border-indigo-500 relative'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                    <div className="rounded-full bg-indigo-500 px-3 py-1 text-white text-sm font-semibold text-center">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    {plan.description}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      /month
                    </span>
                  </p>
                  
                  <div className="mt-8">
                    {isCurrentPlan ? (
                      <div className="block w-full bg-gray-100 border border-gray-300 rounded-md py-2 text-sm font-semibold text-gray-600 text-center cursor-not-allowed">
                        Current Plan
                      </div>
                    ) : (
                      <SubscribeButton
                        priceId={plan.priceId}
                        userId={user?.id}
                        userEmail={user?.email}
                        disabled={!user}
                      />
                    )}
                  </div>
                  
                  {!user && (
                    <p className="mt-2 text-xs text-center text-gray-500">
                      Please <a href="/login" className="underline">sign in</a> to subscribe
                    </p>
                  )}
                </div>
                
                <div className="pt-6 pb-8 px-6 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                    What&apos;s included
                  </h4>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <CheckIcon
                          className="flex-shrink-0 h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {currentSubscription && (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600">
              Want to change or cancel your subscription?{' '}
              <a href="/dashboard" className="text-indigo-600 hover:text-indigo-500">
                Manage billing in your dashboard
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}