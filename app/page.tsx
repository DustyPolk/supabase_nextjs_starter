import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Hero from '@/components/Hero'
import FeatureCard from '@/components/FeatureCard'
import TestimonialCard from '@/components/TestimonialCard'
import FAQAccordion from '@/components/FAQAccordion'
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  BoltIcon, 
  CodeBracketIcon,
  ServerStackIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    title: "Secure Authentication",
    description: "Built-in authentication with Supabase, supporting email/password and social logins."
  },
  {
    icon: <CreditCardIcon className="h-6 w-6" />,
    title: "Stripe Subscriptions",
    description: "Complete subscription billing integration with Stripe, webhooks, and customer portal."
  },
  {
    icon: <BoltIcon className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Built on Next.js 15 with server components for optimal performance and SEO."
  },
  {
    icon: <CodeBracketIcon className="h-6 w-6" />,
    title: "TypeScript Ready",
    description: "Fully typed with TypeScript for better developer experience and fewer bugs."
  },
  {
    icon: <ServerStackIcon className="h-6 w-6" />,
    title: "Database Included",
    description: "PostgreSQL database with Supabase, including real-time subscriptions."
  },
  {
    icon: <UserGroupIcon className="h-6 w-6" />,
    title: "User Management",
    description: "Complete user management system with profiles, sessions, and permissions."
  }
]

const testimonials = [
  {
    quote: "This starter kit saved us months of development time. We launched our SaaS in just 2 weeks!",
    author: "Sarah Chen",
    role: "Founder",
    company: "TechStartup Inc",
    rating: 5
  },
  {
    quote: "The authentication and subscription setup is flawless. It just works out of the box.",
    author: "Michael Rodriguez",
    role: "CTO",
    company: "DevTools Pro",
    rating: 5
  },
  {
    quote: "Best investment for our startup. Clean code, great documentation, and amazing support.",
    author: "Emily Johnson",
    role: "Lead Developer",
    company: "CloudApps",
    rating: 5
  }
]

const faqs = [
  {
    question: "What's included in the starter kit?",
    answer: "The starter kit includes Next.js 15 setup, Supabase authentication, Stripe subscription integration, TypeScript configuration, Tailwind CSS styling, and a complete user dashboard."
  },
  {
    question: "Do I need to know Next.js to use this?",
    answer: "Basic React knowledge is recommended. The starter kit is well-documented and follows Next.js best practices, making it easy to learn as you build."
  },
  {
    question: "Can I use this for commercial projects?",
    answer: "Yes! Once you purchase the starter kit, you can use it for unlimited commercial and personal projects."
  },
  {
    question: "How do I deploy this?",
    answer: "The starter kit is ready to deploy on Vercel, Netlify, or any platform that supports Next.js. We provide deployment guides for popular platforms."
  },
  {
    question: "Is there ongoing support?",
    answer: "Yes, we provide email support for setup questions and maintain the starter kit with updates for major dependency changes."
  }
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Launch
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Stop building authentication and payments from scratch. Focus on your unique features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Ship Faster, Scale Better
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Save Months of Development
                  </h3>
                  <p className="text-gray-600">
                    Skip the boilerplate and jump straight to building your unique features. 
                    Our starter kit handles all the common SaaS requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Production-Ready Code
                  </h3>
                  <p className="text-gray-600">
                    Built with best practices, fully typed with TypeScript, and tested in production. 
                    Deploy with confidence from day one.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Scale Without Limits
                  </h3>
                  <p className="text-gray-600">
                    Built on Next.js and Supabase, your app can handle millions of users. 
                    Start small and scale seamlessly as you grow.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Start Building Today</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Complete authentication system
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Subscription billing ready
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Production-ready codebase
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="inline-block bg-white text-indigo-600 font-semibold py-3 px-6 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Get Started Free →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Loved by Developers
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Join hundreds of developers who've launched successful SaaS products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your needs. All plans include core features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900">Starter</h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">$9<span className="text-base font-normal text-gray-600">/mo</span></p>
            </div>
            <div className="bg-white border-2 border-indigo-500 rounded-lg p-6 relative shadow-lg">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
                Popular
              </span>
              <h3 className="font-semibold text-lg text-gray-900">Pro</h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">$29<span className="text-base font-normal text-gray-600">/mo</span></p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-gray-900">Enterprise</h3>
              <p className="text-3xl font-bold mt-2 text-gray-900">$99<span className="text-base font-normal text-gray-600">/mo</span></p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors"
          >
            View All Plans →
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to know about the starter kit
            </p>
          </div>
          
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build Your SaaS?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join hundreds of developers who are building successful SaaS products with our starter kit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-md hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-block bg-indigo-700 text-white font-semibold py-3 px-8 rounded-md hover:bg-indigo-800 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}