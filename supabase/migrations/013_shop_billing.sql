-- 013_shop_billing.sql
-- Implements the subscription and auto-freeze logic schema

-- Add billing columns to shops
ALTER TABLE shops ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'frozen'));
ALTER TABLE shops ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ DEFAULT (now() + interval '30 days');
ALTER TABLE shops ADD COLUMN IF NOT EXISTS last_billing_date TIMESTAMPTZ;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS subscription_amount NUMERIC DEFAULT 5000.00;

-- Create platform_subscriptions table to track payments
CREATE TABLE IF NOT EXISTS platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_method TEXT,
    transaction_id TEXT,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for billing checks
CREATE INDEX IF NOT EXISTS idx_shops_billing ON shops(next_billing_date, subscription_status);
