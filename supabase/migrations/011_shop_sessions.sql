-- ================================================================
-- RepairOS — Migration 011: Shop Session Tracking
-- ================================================================

CREATE TABLE IF NOT EXISTS shop_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at   TIMESTAMPTZ,
  opened_by   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  closed_by   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_sessions_shop ON shop_sessions(shop_id, opened_at DESC);

ALTER TABLE shop_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_sessions_tenant"
  ON shop_sessions FOR ALL TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));
