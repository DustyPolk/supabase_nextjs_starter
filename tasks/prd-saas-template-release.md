# PRD: SaaS Starter Kit

## 1. Introduction/Overview

This document outlines the requirements for enhancing the existing Next.js + Supabase starter into a comprehensive, premium SaaS starter kit. The goal is to provide developers with a robust foundation for building and launching their own SaaS applications as quickly as possible. This template will be a sellable product targeted at developers.

The core of this enhancement is to build a flexible, tiered subscription model using Stripe, integrated deeply with Supabase for data and authentication management. The final product should be well-documented, easy to customize, and feature a modern, beautiful UI that is appealing to developers.

## 2. Goals

- **Primary Goal:** Create a sellable SaaS starter template for developers.
- **Monetization:** Implement a tiered subscription model (e.g., Free, Pro, Enterprise) with Stripe.
- **Developer Experience:** Provide a clean, well-structured, and well-documented codebase that is easy for other developers to understand and build upon.
- **UI/UX:** Deliver a modern, beautiful, and responsive user interface for both the marketing pages and the authenticated application dashboard.
- **Security:** Ensure proper data protection and access control using Supabase's Row Level Security (RLS).

## 3. User Stories

- **As a developer (customer),** I want to purchase and download the SaaS starter kit so that I can quickly start building my own application.
- **As a developer (customer),** I want to easily configure my Supabase and Stripe credentials to get the project running.
- **As a developer (customer),** I want to see a clear and beautiful pricing page that explains the different subscription tiers.
- **As a developer (customer),** I want to be able to customize the existing subscription tiers or add new ones easily.
- **As an end-user of a SaaS built with this template,** I want to be able to sign up for an account.
- **As an end-user,** I want to be able to choose a subscription plan and pay for it using Stripe.
- **As an end-user,** I want to have a dashboard where I can see my current subscription status.
- **As an end-user,** I want to be able to manage my subscription (upgrade, downgrade, cancel) through a customer portal.
- **As an end-user,** I want to have access to different features based on my subscription tier.

## 4. Functional Requirements

### 4.1. Database (Supabase)
1.  **Profiles Table:** A table to store user profile information, linked to `auth.users` via a foreign key.
2.  **Products Table:** A foreign table (`stripe.products`) that syncs with Stripe products. This will represent the different subscription tiers.
3.  **Prices Table:** A foreign table (`stripe.prices`) that syncs with Stripe prices associated with the products.
4.  **Subscriptions Table:** A table to store user subscription status, linked to the user's profile and the Stripe subscription. It should include columns for `user_id`, `status` (e.g., `active`, `canceled`), `tier` (e.g., `free`, `pro`), `cancel_at_period_end`.
5.  **RLS Policies:** Implement Row Level Security for all tables to ensure users can only access and manage their own data.

### 4.2. Payments (Stripe)
1.  **Stripe Products & Prices:** Create at least three subscription tiers in the Stripe dashboard (e.g., Free, Pro, Enterprise) with monthly and yearly pricing options.
2.  **Stripe Webhooks:**
    - Create a Supabase Edge Function to handle incoming webhooks from Stripe.
    - The webhook should handle events like `invoice.payment_succeeded`, `customer.subscription.updated`, and `customer.subscription.deleted` to update the `subscriptions` table in the Supabase database.
3.  **Checkout Session:** Create an API route (`/api/create-checkout-session`) that creates a Stripe Checkout session for a user to start a new subscription.
4.  **Customer Portal:** Create an API route (`/api/create-portal-session`) that redirects a user to the Stripe Customer Portal to manage their subscription.

### 4.3. User Interface (Next.js & Tailwind CSS)
1.  **Pricing Page:** A new, beautifully designed pricing page (`/pricing`) that:
    - Fetches subscription plans and prices from the database.
    - Clearly lists the features for each tier.
    - Has a "Subscribe" button for each plan that initiates the Stripe checkout process.
2.  **Dashboard:**
    - A new, modern dashboard page for authenticated users (`/dashboard`).
    - It should display the user's current subscription tier and status.
    - It should have a "Manage Subscription" button that redirects to the Stripe Customer Portal.
3.  **Feature Gating:** The application UI should conditionally render features or components based on the user's subscription tier.

## 5. Non-Goals (Out of Scope for v1)

-   One-time payments.
-   Metered billing or usage-based pricing.
-   Team accounts or multi-user subscriptions.
-   In-app seat management.
-   An admin dashboard for managing all users.

## 6. Design Considerations

-   The UI should be modern, clean, and visually appealing to developers.
-   Use a consistent design system. Tailwind UI or a similar component library can be a good starting point.
-   The design should be fully responsive and work on all screen sizes.
-   Provide both light and dark mode themes.

## 7. Technical Considerations

-   Use Supabase Foreign Data Wrappers to sync Stripe data with the Postgres database. This is a key technical decision that needs to be implemented correctly.
-   All communication with Stripe's API from the frontend should be done through secure API routes in the Next.js backend (or Supabase Edge Functions). Never expose Stripe secret keys on the client-side.
-   Use server-side rendering (SSR) or static site generation (SSG) with revalidation for the pricing page to ensure it's fast and SEO-friendly.
-   Ensure all environment variables (Supabase and Stripe keys) are stored securely and not exposed in the client-side code.

## 8. Success Metrics

-   Positive feedback from developers who purchase the template.
-   Number of sales of the template.
-   A low number of support requests related to setup and configuration.

## 9. Open Questions

-   What will be the exact features for each of the subscription tiers (Free, Pro, Enterprise)? This needs to be defined to implement the feature gating.
-   What is the pricing for each tier?
-   What is the official name of the SaaS starter kit? 