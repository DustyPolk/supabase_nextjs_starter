# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a complete SaaS starter template built with Next.js 15, Supabase authentication, and Stripe subscriptions using TypeScript, Tailwind CSS v4, and server actions. The project demonstrates a complete authentication flow with email/password auth, protected routes, session management, and subscription billing.

## Essential Commands

```bash
# Development
bun dev          # Run development server with turbopack (port 3000)
npm run dev      # Alternative with npm

# Build & Production
bun build        # Create production build
bun start        # Run production server
npm run build    # Alternative with npm
npm start        # Alternative with npm

# Code Quality
bun lint         # Run Next.js linter
npm run lint     # Alternative with npm
```

## Architecture Overview

### Authentication Flow
1. **Supabase Clients** (`/utils/supabase/`)
   - `client.ts`: Browser-side client using `createBrowserClient`
   - `server.ts`: Server-side client with cookie management
   - `middleware.ts`: Session refresh logic with `updateSession`

2. **Middleware** (`middleware.ts`)
   - Intercepts all requests except static assets
   - Calls `updateSession` to refresh auth tokens
   - Redirects unauthenticated users to `/login` for protected routes

3. **Server Actions** (`app/login/actions.ts`)
   - `login()`: Handles sign-in with email/password
   - `signup()`: Handles new user registration
   - Both redirect to `/dashboard` on success, `/error` on failure

4. **Route Handlers**
   - `/auth/confirm/route.ts`: Handles email confirmation callbacks
   - `/auth/signout/route.ts`: Clears session and redirects to login

### Protected Routes Pattern
Server components check authentication by:
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### Subscription Flow
1. **Stripe Integration** (`/utils/stripe/`)
   - `config.ts`: Stripe client and pricing plans configuration
   - `subscription.ts`: Helper functions for subscription management

2. **Database Schema** (Supabase tables)
   - `customers`: Links Supabase users to Stripe customers
   - `subscriptions`: Stores subscription details and status
   - `subscription_items`: Line items for subscriptions
   - `invoices`: Invoice history and payment tracking

3. **API Routes**
   - `/api/webhooks/stripe/route.ts`: Handles Stripe webhook events
   - `/api/create-checkout-session/route.ts`: Creates Stripe Checkout sessions
   - `/api/create-portal-session/route.ts`: Creates billing portal sessions

4. **Pages & Components**
   - `/pricing`: Displays subscription plans with pricing
   - `/dashboard`: User dashboard with subscription management
   - `SubscriptionCard`: Component showing current subscription details

### Environment Configuration
Required variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret
- `STRIPE_STARTER_PRICE_ID`: Price ID for Starter plan
- `STRIPE_PRO_PRICE_ID`: Price ID for Pro plan
- `STRIPE_ENTERPRISE_PRICE_ID`: Price ID for Enterprise plan

### Key Dependencies
- `@supabase/ssr`: Server-side rendering support for Supabase
- `@supabase/supabase-js`: Core Supabase client
- `stripe`: Stripe Node.js SDK
- `@stripe/stripe-js`: Stripe JavaScript SDK
- `@heroicons/react`: Icon components
- Next.js 15 with App Router
- Tailwind CSS v4 (using PostCSS)

## Important Supabase Configuration

When setting up a new Supabase project:
1. Enable Email provider in Authentication → Providers
2. Add redirect URLs in Authentication → URL Configuration:
   - `http://localhost:3000/auth/confirm`
   - Production URLs when deploying
3. Run the subscription database migration to create the required tables

## Important Stripe Configuration

When setting up Stripe:
1. Create products and prices in the Stripe Dashboard or via API
2. Update the price IDs in your environment variables
3. Set up webhook endpoint pointing to `/api/webhooks/stripe`
4. Configure webhook to listen for these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

## Testing Authentication & Subscription Flow

1. **Authentication**:
   - Sign up creates user via Supabase (sends confirmation email by default)
   - Email confirmation redirects to `/auth/confirm` then `/dashboard`
   - Direct sign-in redirects to `/dashboard`
   - Accessing protected routes while logged out redirects to `/login`
   - Sign out clears session and redirects to `/login`

2. **Subscriptions**:
   - Visit `/pricing` to view subscription plans
   - Click "Get started" to initiate Stripe Checkout
   - Successful payment creates subscription in database via webhook
   - Dashboard shows current subscription status and billing management
   - "Manage billing" button opens Stripe Customer Portal

## Deployment Checklist

1. Set up production Supabase project and update environment variables
2. Set up production Stripe account and update keys/price IDs
3. Configure Stripe webhook endpoint for production domain
4. Update redirect URLs in Supabase dashboard
5. Set `NEXT_PUBLIC_SITE_URL` environment variable for production domain