## Relevant Files

- `supabase/migrations/<timestamp>_initial_schema.sql` - SQL migration file to set up the database schema for profiles, subscriptions, etc.
- `app/pricing/page.tsx` - The new pricing page that will display subscription tiers.
- `app/pricing/page.test.tsx` - Unit tests for the pricing page.
- `app/dashboard/page.tsx` - The updated user dashboard to show subscription status.
- `app/dashboard/page.test.tsx` - Unit tests for the dashboard page.
- `app/api/create-checkout-session/route.ts` - API route handler for creating Stripe checkout sessions.
- `app/api/create-portal-session/route.ts` - API route handler for creating Stripe customer portal sessions.
- `supabase/functions/stripe-webhooks/index.ts` - Supabase Edge Function to handle incoming Stripe webhooks.
- `utils/stripe/config.ts` - To be updated with Stripe product and price information.
- `utils/stripe/server.ts` - To be updated with Stripe client initialization.
- `components/ui/PricingCard.tsx` - A new UI component for displaying a single pricing tier.
- `hooks/useSubscription.ts` - A new custom hook to provide subscription data across the application.
- `README.md` - To be updated with new setup instructions for Stripe.
- `.env.local.example` - To be updated with new required environment variables for Stripe.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `bun test` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Set up Supabase Database Schema and RLS
  - [ ] 1.1 Create a new SQL migration file in `supabase/migrations/`.
  - [ ] 1.2 In the migration file, define a `profiles` table to store user data, linked to `auth.users`.
  - [ ] 1.3 Define `products`, `prices`, and `subscriptions` tables to manage subscription data.
  - [ ] 1.4 Enable Row Level Security (RLS) on all new tables.
  - [ ] 1.5 Create RLS policies to ensure users can only access their own data.
  - [ ] 1.6 Apply the migration to your local and production Supabase databases.
- [ ] 2.0 Configure Stripe Products and Foreign Data Wrappers
  - [ ] 2.1 In the Stripe Dashboard, create three products: 'Free', 'Pro', and 'Enterprise'.
  - [ ] 2.2 For the 'Pro' and 'Enterprise' tiers, create monthly and yearly prices.
  - [ ] 2.3 In your Supabase project, enable the `supabase-wrappers` and `stripe_fdw` extensions.
  - [ ] 2.4 Create a foreign data wrapper server that connects to your Stripe account using your API key.
  - [ ] 2.5 Create foreign tables for `stripe.products` and `stripe.prices` to sync data from Stripe.
  - [ ] 2.6 Verify that the data from Stripe is correctly appearing in your Supabase tables.
- [ ] 3.0 Implement Stripe Payment and Subscription Logic
  - [ ] 3.1 Create a new Supabase Edge Function at `supabase/functions/stripe-webhooks/index.ts`.
  - [ ] 3.2 Implement the webhook logic to handle `invoice.payment_succeeded`, `customer.subscription.updated`, and `customer.subscription.deleted`.
  - [ ] 3.3 The webhook should securely update the `subscriptions` table in your Supabase database.
  - [ ] 3.4 Create the API route `app/api/create-checkout-session/route.ts` for initiating subscriptions.
  - [ ] 3.5 Create the API route `app/api/create-portal-session/route.ts` for managing subscriptions.
  - [ ] 3.6 Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to your environment variables.
- [ ] 4.0 Build Frontend UI for Pricing and Dashboard
  - [ ] 4.1 Create the pricing page file at `app/pricing/page.tsx`.
  - [ ] 4.2 Build a `PricingCard` component to display each subscription plan.
  - [ ] 4.3 On the pricing page, fetch the products and prices from Supabase and render them using the `PricingCard` component.
  - [ ] 4.4 The "Subscribe" button on each card should call the `create-checkout-session` API route.
  - [ ] 4.5 On the `app/dashboard/page.tsx`, display the user's current subscription tier and status.
  - [ ] 4.6 The "Manage Subscription" button should call the `create-portal-session` API route.
- [ ] 5.0 Implement Feature Gating based on Subscription Tier
  - [ ] 5.1 Create a `useSubscription` hook that provides the user's current subscription status.
  - [ ] 5.2 Use the `useSubscription` hook to conditionally render UI elements based on the user's plan.
  - [ ] 5.3 Create an example "Pro" feature on the dashboard that is only visible to users on the "Pro" or "Enterprise" plan.
- [ ] 6.0 Create Documentation and Final Touches
  - [ ] 6.1 Update `README.md` with detailed instructions on setting up Stripe and the new database schema.
  - [ ] 6.2 Update `.env.local.example` with the new Stripe-related environment variables.
  - [ ] 6.3 Ensure the entire application is responsive and works well on mobile devices.
  - [ ] 6.4 Polish the UI and implement a dark mode theme.
  - [ ] 6.5 Write comprehensive tests for all new backend and frontend functionality. 