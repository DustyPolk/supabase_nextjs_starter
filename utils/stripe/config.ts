export const getStripeUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000'
}

export const PRICING_PLANS = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small projects',
    price: '$9',
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      'Up to 5 users',
      '10GB storage',
      'Basic analytics',
      'Email support',
      'API access'
    ]
  },
  {
    name: 'Pro',
    description: 'For growing teams and businesses',
    price: '$29',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Up to 50 users',
      '100GB storage',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'Team collaboration'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: '$99',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    features: [
      'Unlimited users',
      'Unlimited storage',
      'Enterprise analytics',
      '24/7 phone support',
      'API access',
      'Custom integrations',
      'Team collaboration',
      'SLA guarantee',
      'Dedicated account manager'
    ]
  }
]