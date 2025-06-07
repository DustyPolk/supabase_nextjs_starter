-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  PRIMARY KEY (id)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on profiles table
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Comment on profiles table
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';

-- Create stripe schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS stripe;

-- Create custom types for Stripe data
CREATE TYPE stripe.subscription_status AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);

CREATE TYPE stripe.price_type AS ENUM (
    'one_time',
    'recurring'
);

CREATE TYPE stripe.price_recurring_interval AS ENUM (
    'day',
    'week',
    'month',
    'year'
);

-- Create products table
CREATE TABLE public.products (
  id TEXT NOT NULL PRIMARY KEY, -- Stripe Product ID
  active BOOLEAN,
  name TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.products IS 'Stores product information from Stripe.';

-- Trigger to update updated_at on products table
CREATE TRIGGER on_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Create prices table
CREATE TABLE public.prices (
  id TEXT NOT NULL PRIMARY KEY, -- Stripe Price ID
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  active BOOLEAN,
  currency TEXT CHECK (char_length(currency) = 3), -- ISO currency code
  unit_amount BIGINT,
  type stripe.price_type,
  "interval" stripe.price_recurring_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.prices IS 'Stores price information for products from Stripe.';

-- Trigger to update updated_at on prices table
CREATE TRIGGER on_prices_updated
  BEFORE UPDATE ON public.prices
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status stripe.subscription_status,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE, -- Renamed from tier_product_id for clarity
  price_id TEXT REFERENCES public.prices(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start_at TIMESTAMPTZ,
  trial_end_at TIMESTAMPTZ,
  metadata JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription information.';

-- Trigger to update updated_at on subscriptions table
CREATE TRIGGER on_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Enable RLS for prices table
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Enable RLS for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Allow individual read access to own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow individual update access to own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for products table
CREATE POLICY "Allow read access to products for authenticated users"
  ON public.products FOR SELECT
  USING (auth.role() = 'authenticated');
  -- Add policy for service_role to allow webhook data sync if needed later
  -- CREATE POLICY "Allow all access for service_role" ON public.products FOR ALL USING (auth.role() = 'service_role');


-- RLS Policies for prices table
CREATE POLICY "Allow read access to prices for authenticated users"
  ON public.prices FOR SELECT
  USING (auth.role() = 'authenticated');
  -- Add policy for service_role to allow webhook data sync if needed later
  -- CREATE POLICY "Allow all access for service_role" ON public.prices FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for subscriptions table
CREATE POLICY "Allow individual read access to own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- For subscriptions, INSERT, UPDATE, DELETE are typically handled by system processes (e.g., Stripe webhooks using a service_role).
-- Users would not directly insert/update/delete their subscriptions table rows.
-- If specific user-driven updates were needed (e.g., changing metadata they control), a more granular policy would be required.
-- For now, focusing on read access as per PRD.
-- Add policy for service_role to allow webhook data sync if needed later
-- CREATE POLICY "Allow all access for service_role" ON public.subscriptions FOR ALL USING (auth.role() = 'service_role');

--
-- Applying this migration:
--
-- 1. Link your local project to your Supabase project (if not already done):
--    supabase link --project-ref YOUR_PROJECT_ID
--
-- 2. Apply the migration to your local Supabase instance (if running one):
--    supabase db push
--
-- 3. Apply the migration to your linked Supabase project (e.g., staging or production):
--    supabase migration up
--
-- Note: For production environments, it's recommended to first apply and test migrations
-- in a staging/development environment.
-- Ensure your Supabase CLI is up to date and you are authenticated.
--
