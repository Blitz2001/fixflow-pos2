-- ================================================================
-- RepairOS — Migration 005: Blacklist System
-- ================================================================

CREATE TABLE IF NOT EXISTS blacklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'supplier', 'item', 'other')),
  identifier TEXT NOT NULL, -- e.g. Phone number, Email, Name, or SKU
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blacklists_shop_type ON blacklists (shop_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_blacklists_identifier ON blacklists (shop_id, identifier);

ALTER TABLE blacklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blacklists_tenant" 
  ON blacklists FOR ALL TO authenticated 
  USING (shop_id IN (SELECT get_my_shop_ids()));
