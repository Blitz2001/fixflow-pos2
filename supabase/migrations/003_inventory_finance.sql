-- ================================================================
-- RepairOS — Migration 003 (REVISED): Inventory, Serials, Finance
-- Depends on: 001_foundation.sql, 002_tickets_evidence.sql
-- ================================================================

-- ── SUPPLIERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name           TEXT          NOT NULL,
  contact_person TEXT,
  phone          TEXT,
  email          TEXT,
  lead_time_days INT           NOT NULL DEFAULT 3, -- For reorder forecasting (Phase 5)
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── PURCHASE ORDERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        UUID          NOT NULL REFERENCES shops(id)      ON DELETE CASCADE,
  supplier_id    UUID          NOT NULL REFERENCES suppliers(id)  ON DELETE RESTRICT,
  total_cost     NUMERIC(12,2) NOT NULL DEFAULT 0,
  status         TEXT          NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','received','cancelled')),
  ordered_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  received_at    TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── INVENTORY ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id             UUID          NOT NULL REFERENCES shops(id)    ON DELETE CASCADE,
  supplier_id         UUID          REFERENCES suppliers(id)          ON DELETE SET NULL,
  purchase_order_id   UUID          REFERENCES purchase_orders(id)    ON DELETE SET NULL,
  name                TEXT          NOT NULL,
  brand               TEXT,
  -- Category: SSD, RAM, Screen, Motherboard, Charger, Thermal Paste, etc.
  category            TEXT          NOT NULL,
  sku                 TEXT,
  -- Store BOTH prices for exact margin / COGS calculation
  cost_price          NUMERIC(12,2) NOT NULL DEFAULT 0,
  sell_price          NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- quantity = computed from serial_numbers for serialized items
  -- or manually managed for bulk items (thermal paste, etc.)
  quantity            INT           NOT NULL DEFAULT 0,
  low_stock_threshold INT           NOT NULL DEFAULT 5,
  -- If TRUE, every unit must have a unique serial number
  is_serialized       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_shop     ON inventory_items (shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items (shop_id, category);
CREATE INDEX IF NOT EXISTS idx_inventory_sku      ON inventory_items (shop_id, sku);

-- ── SERIAL NUMBERS ───────────────────────────────────────────────
-- Tracks individual high-value units (SSDs, GPUs, RAM sticks, etc.)
CREATE TABLE IF NOT EXISTS serial_numbers (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id          UUID          NOT NULL REFERENCES shops(id)           ON DELETE CASCADE,
  item_id          UUID          NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  serial_number    TEXT          NOT NULL,
  status           TEXT          NOT NULL DEFAULT 'Available'
    CHECK (status IN ('Available', 'Sold', 'Defective', 'RMA')),
  -- Set when the part is assigned to a repair ticket
  ticket_id        UUID          REFERENCES repair_tickets(id)            ON DELETE SET NULL,
  -- Cost at the time this unit was purchased (FIFO tracking)
  cost_at_purchase NUMERIC(12,2) NOT NULL DEFAULT 0,
  assigned_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- A serial number must be unique within a shop
  UNIQUE (shop_id, serial_number)
);

CREATE INDEX IF NOT EXISTS idx_serials_item    ON serial_numbers (item_id);
CREATE INDEX IF NOT EXISTS idx_serials_ticket  ON serial_numbers (ticket_id);
CREATE INDEX IF NOT EXISTS idx_serials_status  ON serial_numbers (shop_id, status);

-- Trigger: when a new serial number is added, increment parent item quantity
CREATE OR REPLACE FUNCTION public.sync_inventory_quantity_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE inventory_items
  SET quantity = quantity + 1
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serial_added ON serial_numbers;
CREATE TRIGGER serial_added
  AFTER INSERT ON serial_numbers
  FOR EACH ROW EXECUTE PROCEDURE public.sync_inventory_quantity_on_insert();

-- Trigger: when a serial is assigned (status → Sold), decrement quantity
CREATE OR REPLACE FUNCTION public.sync_inventory_quantity_on_assign()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Going from Available → Sold/Defective/RMA: decrement
  IF OLD.status = 'Available' AND NEW.status != 'Available' THEN
    UPDATE inventory_items SET quantity = quantity - 1 WHERE id = NEW.item_id;
  END IF;
  -- Reverting to Available: increment (e.g. RMA returned)
  IF OLD.status != 'Available' AND NEW.status = 'Available' THEN
    UPDATE inventory_items SET quantity = quantity + 1 WHERE id = NEW.item_id;
  END IF;
  -- Set assigned_at timestamp when linked to a ticket
  IF NEW.ticket_id IS NOT NULL AND OLD.ticket_id IS NULL THEN
    NEW.assigned_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS serial_status_changed ON serial_numbers;
CREATE TRIGGER serial_status_changed
  BEFORE UPDATE ON serial_numbers
  FOR EACH ROW EXECUTE PROCEDURE public.sync_inventory_quantity_on_assign();

-- ── TRANSACTIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID          NOT NULL REFERENCES shops(id)     ON DELETE CASCADE,
  ticket_id    UUID          REFERENCES repair_tickets(id)      ON DELETE SET NULL,
  customer_id  UUID          REFERENCES customers(id)           ON DELETE SET NULL,
  type         TEXT          NOT NULL
    CHECK (type IN ('repair_payment', 'direct_sale', 'refund')),
  payment_type TEXT          NOT NULL
    CHECK (payment_type IN ('Cash', 'Bank Transfer', 'QR', 'Card')),
  subtotal     NUMERIC(12,2) NOT NULL DEFAULT 0,
  -- Tax stored separately for audit + IRD e-invoicing (RAMIS) readiness
  sscl_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,  -- 2.5% SSCL
  vat_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,  -- 18% VAT
  tax_amount   NUMERIC(12,2) GENERATED ALWAYS AS (sscl_amount + vat_amount) STORED,
  discount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total  NUMERIC(12,2) NOT NULL DEFAULT 0,
  status       TEXT          NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'paid', 'refunded')),
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_shop   ON transactions (shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_ticket ON transactions (ticket_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (shop_id, status);

-- ── TRANSACTION LINE ITEMS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS transaction_items (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id      UUID          NOT NULL REFERENCES transactions(id)      ON DELETE CASCADE,
  inventory_item_id   UUID          REFERENCES inventory_items(id)             ON DELETE SET NULL,
  serial_number_id    UUID          REFERENCES serial_numbers(id)              ON DELETE SET NULL,
  description         TEXT          NOT NULL,
  quantity            INT           NOT NULL DEFAULT 1,
  -- Immutable snapshots at time of sale — critical for historical margin analysis
  cost_price_snapshot NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_price          NUMERIC(12,2) NOT NULL,
  line_total          NUMERIC(12,2) NOT NULL
);

-- Decrement bulk inventory (non-serialized items) on sale
CREATE OR REPLACE FUNCTION public.decrement_bulk_inventory_on_sale()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Only decrement bulk items (serialized items handled via serial_numbers trigger)
  IF NEW.inventory_item_id IS NOT NULL AND NEW.serial_number_id IS NULL THEN
    UPDATE inventory_items
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.inventory_item_id;
  END IF;
  -- Mark serial number as Sold if linked
  IF NEW.serial_number_id IS NOT NULL THEN
    UPDATE serial_numbers
    SET status = 'Sold', ticket_id = (
      SELECT ticket_id FROM transactions WHERE id = NEW.transaction_id
    )
    WHERE id = NEW.serial_number_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inventory_decrement ON transaction_items;
CREATE TRIGGER inventory_decrement
  AFTER INSERT ON transaction_items
  FOR EACH ROW EXECUTE PROCEDURE public.decrement_bulk_inventory_on_sale();

-- ── EXPENSES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID          NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category     TEXT          NOT NULL
    CHECK (category IN ('Rent','Salary','Utilities','Parts Purchase','Marketing','Other')),
  description  TEXT,
  amount       NUMERIC(12,2) NOT NULL,
  expense_date DATE          NOT NULL DEFAULT CURRENT_DATE,
  receipt_url  TEXT,
  created_by   UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_shop_date ON expenses (shop_id, expense_date DESC);

-- ── ANALYTICS VIEWS (Phase 5 foundation) ─────────────────────────

-- Daily revenue — used by P&L dashboard charts
CREATE OR REPLACE VIEW daily_revenue AS
SELECT
  shop_id,
  DATE(paid_at)         AS day,
  SUM(grand_total)      AS revenue,
  SUM(subtotal)         AS revenue_before_tax,
  SUM(sscl_amount)      AS sscl_collected,
  SUM(vat_amount)       AS vat_collected,
  COUNT(*)              AS transaction_count
FROM transactions
WHERE status = 'paid'
GROUP BY 1, 2;

-- Low stock alerts
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT
  i.shop_id, i.id, i.name, i.category, i.sku,
  i.quantity, i.low_stock_threshold,
  (i.low_stock_threshold - i.quantity) AS units_short,
  s.lead_time_days
FROM inventory_items i
LEFT JOIN suppliers s ON s.id = i.supplier_id
WHERE i.quantity <= i.low_stock_threshold
ORDER BY units_short DESC;

-- Inventory velocity — how many units sold per day (Phase 5 forecasting)
CREATE OR REPLACE VIEW inventory_velocity AS
SELECT
  sn.item_id,
  sn.shop_id,
  COUNT(*) FILTER (WHERE sn.status = 'Sold') AS units_sold,
  MIN(sn.assigned_at) AS first_sale,
  MAX(sn.assigned_at) AS last_sale,
  ROUND(
    COUNT(*) FILTER (WHERE sn.status = 'Sold')::numeric
    / GREATEST(EXTRACT(DAY FROM (MAX(sn.assigned_at) - MIN(sn.assigned_at))), 1),
    3
  ) AS daily_velocity
FROM serial_numbers sn
GROUP BY 1, 2;

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE suppliers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_tenant"
  ON suppliers FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
CREATE POLICY "purchase_orders_tenant"
  ON purchase_orders FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
CREATE POLICY "inventory_tenant"
  ON inventory_items FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
CREATE POLICY "serials_tenant"
  ON serial_numbers FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
CREATE POLICY "transactions_tenant"
  ON transactions FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
CREATE POLICY "transaction_items_tenant"
  ON transaction_items FOR ALL TO authenticated
  USING (transaction_id IN (SELECT id FROM transactions WHERE shop_id IN (SELECT get_my_shop_ids())));
CREATE POLICY "expenses_tenant"
  ON expenses FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
