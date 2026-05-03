-- ================================================================
-- RepairOS — Migration 006: Unified Partners & Product Types
-- ================================================================

-- 1. Create Partners Table
CREATE TABLE IF NOT EXISTS partners (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  phone        TEXT,
  email        TEXT,
  partner_types TEXT[]     NOT NULL DEFAULT '{}',
  lead_time_days INT       NOT NULL DEFAULT 3,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_shop ON partners (shop_id);
CREATE INDEX IF NOT EXISTS idx_partners_phone ON partners (phone);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'partners_tenant'
    ) THEN
        CREATE POLICY "partners_tenant"
          ON partners FOR ALL TO authenticated
          USING (shop_id IN (SELECT get_my_shop_ids()));
    END IF;
END
$$;

-- 2. Drop views that depend on old columns
DROP VIEW IF EXISTS low_stock_alerts CASCADE;

-- 3. Clear old data to avoid NOT NULL constraint violations when adding new columns
TRUNCATE TABLE devices CASCADE;
TRUNCATE TABLE repair_tickets CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE purchase_orders CASCADE;
TRUNCATE TABLE inventory_items CASCADE;

-- 4. Devices table update
ALTER TABLE devices DROP COLUMN IF EXISTS customer_id CASCADE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_devices_partner_id ON devices (partner_id);

-- 5. Transactions table update
ALTER TABLE transactions DROP COLUMN IF EXISTS customer_id CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- 6. Purchase Orders table update
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS supplier_id CASCADE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE RESTRICT;

-- 7. Inventory Items table update
ALTER TABLE inventory_items DROP COLUMN IF EXISTS supplier_id CASCADE;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- 8. Product Classification
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='product_type') THEN
        ALTER TABLE inventory_items ADD COLUMN product_type TEXT NOT NULL DEFAULT 'storable'
          CHECK (product_type IN ('storable', 'service', 'consumable'));
    END IF;
END
$$;

-- 9. Drop old tables
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

-- 10. Recreate Low Stock Alerts View using partners
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT
  i.shop_id, i.id, i.name, i.category, i.sku,
  i.quantity, i.low_stock_threshold,
  (i.low_stock_threshold - i.quantity) AS units_short,
  p.lead_time_days
FROM inventory_items i
LEFT JOIN partners p ON p.id = i.partner_id
WHERE i.quantity <= i.low_stock_threshold
ORDER BY units_short DESC;
