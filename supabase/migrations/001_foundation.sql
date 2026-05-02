-- ================================================================
-- RepairOS — Migration 001: Foundation
-- Run in: Supabase Dashboard → SQL Editor
-- Tables: shops, profiles, memberships, customers, devices
-- ================================================================

-- ── SHOPS (Root Tenant) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  address     TEXT,
  phone       TEXT,
  logo_url    TEXT,
  currency    TEXT        NOT NULL DEFAULT 'LKR',
  tax_enabled BOOLEAN     NOT NULL DEFAULT FALSE,
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PROFILES (extends auth.users 1-to-1) ────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── MEMBERSHIPS (RBAC) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memberships (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shop_id    UUID        NOT NULL REFERENCES shops(id)    ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'TECHNICIAN'
               CHECK (role IN ('OWNER', 'ADMIN', 'TECHNICIAN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, shop_id)
);

-- ── CUSTOMERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  phone_number TEXT        NOT NULL,
  email        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance index: phone lookups are frequent at POS counter
CREATE INDEX IF NOT EXISTS idx_customers_phone   ON customers (phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers (shop_id);

-- ── DEVICES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID        NOT NULL REFERENCES shops(id)     ON DELETE CASCADE,
  customer_id   UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  brand         TEXT,
  model         TEXT        NOT NULL,
  serial_number TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_shop_id     ON devices (shop_id);
CREATE INDEX IF NOT EXISTS idx_devices_customer_id ON devices (customer_id);

-- ================================================================
-- ROW LEVEL SECURITY
-- CRITICAL pattern: (SELECT auth.uid()) caches the uid per statement,
-- preventing N+1 auth function calls on large result sets.
-- ================================================================

ALTER TABLE shops       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices     ENABLE ROW LEVEL SECURITY;

-- Helper: returns all shop_ids the current user belongs to.
-- SECURITY DEFINER so it runs with creator privileges (safe read-only).
CREATE OR REPLACE FUNCTION public.get_my_shop_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id
  FROM   memberships
  WHERE  user_id = (SELECT auth.uid());
$$;

-- PROFILES: each user sees and updates only their own profile
CREATE POLICY "profiles_self"
  ON profiles FOR ALL TO authenticated
  USING (id = (SELECT auth.uid()));

-- MEMBERSHIPS: users see only their own membership rows
CREATE POLICY "memberships_self"
  ON memberships FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- SHOPS: users see only shops they are members of
CREATE POLICY "shops_select" ON shops FOR SELECT TO authenticated USING (id IN (SELECT get_my_shop_ids()));
CREATE POLICY "shops_update" ON shops FOR UPDATE TO authenticated USING (id IN (SELECT get_my_shop_ids()));
CREATE POLICY "shops_delete" ON shops FOR DELETE TO authenticated USING (id IN (SELECT get_my_shop_ids()));
CREATE POLICY "shops_insert" ON shops FOR INSERT TO authenticated WITH CHECK (true);

-- CUSTOMERS: tenant isolation
CREATE POLICY "customers_tenant"
  ON customers FOR ALL TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));

-- DEVICES: tenant isolation
CREATE POLICY "devices_tenant"
  ON devices FOR ALL TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));
