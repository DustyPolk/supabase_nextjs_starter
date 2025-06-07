'use client'

import { useState } from 'react'

interface SubscribeButtonProps {
  priceId: string
  userId?: string
  userEmail?: string
  disabled?: boolean
}

export default function SubscribeButton({ priceId, userId, userEmail, disabled }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!userId || !userEmail) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
        }),
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = disabled && userId // Only disable if explicitly disabled AND user exists
  const buttonText = loading ? 'Loading...' : (!userId ? 'Sign in to subscribe' : 'Get started')

  return (
    <button
      onClick={handleSubscribe}
      disabled={isDisabled || loading}
      className={`block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
        isDisabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {buttonText}
    </button>
  )
}