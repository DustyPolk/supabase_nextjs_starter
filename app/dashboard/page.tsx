import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SubscriptionCard from './SubscriptionCard'
import { Suspense } from 'react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  // Get user subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', data.user.id)
    .in('status', ['trialing', 'active', 'past_due'])
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account and subscription settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Information Card */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details from your account.</p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{data.user.email}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{data.user.id}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created at</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(data.user.created_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Subscription Card */}
          <Suspense fallback={<div className="bg-white shadow sm:rounded-lg p-6">Loading subscription...</div>}>
            <SubscriptionCard subscription={subscription} userId={data.user.id} />
          </Suspense>
        </div>
        
        <div className="mt-8">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}