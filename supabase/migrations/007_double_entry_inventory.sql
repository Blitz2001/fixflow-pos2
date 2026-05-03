-- ================================================================
-- RepairOS — Migration 007: Double-Entry Inventory Engine
-- ================================================================

-- 1. Create Location Type Enum
DO $$ BEGIN
  CREATE TYPE location_type AS ENUM ('internal', 'vendor', 'customer', 'inventory_loss', 'scrap');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create Stock Locations Table
CREATE TABLE IF NOT EXISTS stock_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type location_type NOT NULL DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_locations_shop ON stock_locations(shop_id, type);

ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_locations_tenant') THEN
        CREATE POLICY "stock_locations_tenant"
          ON stock_locations FOR ALL TO authenticated
          USING (shop_id IN (SELECT get_my_shop_ids()));
    END IF;
END $$;

-- 3. Create default locations for existing shops
DO $$ 
DECLARE
  s RECORD;
BEGIN
  FOR s IN SELECT id FROM shops LOOP
    IF NOT EXISTS (SELECT 1 FROM stock_locations WHERE shop_id = s.id AND type = 'internal') THEN
      INSERT INTO stock_locations (shop_id, name, type) VALUES
        (s.id, 'Main Warehouse', 'internal'),
        (s.id, 'Vendors', 'vendor'),
        (s.id, 'Customers', 'customer'),
        (s.id, 'Inventory Loss', 'inventory_loss');
    END IF;
  END LOOP;
END $$;

-- 4. Create Stock Moves Table
CREATE TABLE IF NOT EXISTS stock_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  serial_number_id UUID REFERENCES serial_numbers(id) ON DELETE SET NULL,
  source_location_id UUID NOT NULL REFERENCES stock_locations(id),
  dest_location_id UUID NOT NULL REFERENCES stock_locations(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'done' CHECK (status IN ('draft', 'done', 'cancelled')),
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_moves_shop ON stock_moves(shop_id);
CREATE INDEX IF NOT EXISTS idx_stock_moves_item ON stock_moves(item_id);

ALTER TABLE stock_moves ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stock_moves_tenant') THEN
        CREATE POLICY "stock_moves_tenant"
          ON stock_moves FOR ALL TO authenticated
          USING (shop_id IN (SELECT get_my_shop_ids()));
    END IF;
END $$;

-- 5. Trigger to automatically adjust `inventory_items.quantity` on stock move completion
CREATE OR REPLACE FUNCTION process_stock_move()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  src_type location_type;
  dst_type location_type;
BEGIN
  IF NEW.status = 'done' THEN
    SELECT type INTO src_type FROM stock_locations WHERE id = NEW.source_location_id;
    SELECT type INTO dst_type FROM stock_locations WHERE id = NEW.dest_location_id;
    
    -- If moving out of internal stock
    IF src_type = 'internal' AND dst_type != 'internal' THEN
      UPDATE inventory_items SET quantity = quantity - NEW.quantity WHERE id = NEW.item_id;
    END IF;
    
    -- If moving into internal stock
    IF src_type != 'internal' AND dst_type = 'internal' THEN
      UPDATE inventory_items SET quantity = quantity + NEW.quantity WHERE id = NEW.item_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stock_move_completed ON stock_moves;
CREATE TRIGGER stock_move_completed
  AFTER INSERT OR UPDATE OF status ON stock_moves
  FOR EACH ROW EXECUTE PROCEDURE process_stock_move();

-- 6. Refactor existing triggers to insert stock moves instead of directly updating inventory_items

-- 6a. Serial Added
CREATE OR REPLACE FUNCTION public.sync_inventory_quantity_on_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  loc_vendor UUID;
  loc_internal UUID;
BEGIN
  SELECT id INTO loc_vendor FROM stock_locations WHERE shop_id = NEW.shop_id AND type = 'vendor' LIMIT 1;
  SELECT id INTO loc_internal FROM stock_locations WHERE shop_id = NEW.shop_id AND type = 'internal' LIMIT 1;

  INSERT INTO stock_moves (shop_id, item_id, serial_number_id, source_location_id, dest_location_id, quantity, status, reference)
  VALUES (NEW.shop_id, NEW.item_id, NEW.id, loc_vendor, loc_internal, 1, 'done', 'Serial Initial Receipt');
  
  RETURN NEW;
END;
$$;

-- 6b. Serial Status Changed (Assigned/RMA)
CREATE OR REPLACE FUNCTION public.sync_inventory_quantity_on_assign()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  loc_internal UUID;
  loc_customer UUID;
  loc_loss UUID;
  dst_loc UUID;
  src_loc UUID;
BEGIN
  SELECT id INTO loc_internal FROM stock_locations WHERE shop_id = NEW.shop_id AND type = 'internal' LIMIT 1;
  SELECT id INTO loc_customer FROM stock_locations WHERE shop_id = NEW.shop_id AND type = 'customer' LIMIT 1;
  SELECT id INTO loc_loss FROM stock_locations WHERE shop_id = NEW.shop_id AND type = 'inventory_loss' LIMIT 1;

  IF OLD.status = 'Available' AND NEW.status != 'Available' THEN
    IF NEW.status = 'Sold' THEN dst_loc := loc_customer; ELSE dst_loc := loc_loss; END IF;
    INSERT INTO stock_moves (shop_id, item_id, serial_number_id, source_location_id, dest_location_id, quantity, status, reference)
    VALUES (NEW.shop_id, NEW.item_id, NEW.id, loc_internal, dst_loc, 1, 'done', 'Serial ' || NEW.status);
  END IF;

  IF OLD.status != 'Available' AND NEW.status = 'Available' THEN
    IF OLD.status = 'Sold' THEN src_loc := loc_customer; ELSE src_loc := loc_loss; END IF;
    INSERT INTO stock_moves (shop_id, item_id, serial_number_id, source_location_id, dest_location_id, quantity, status, reference)
    VALUES (NEW.shop_id, NEW.item_id, NEW.id, src_loc, loc_internal, 1, 'done', 'Serial Returned to Available');
  END IF;

  IF NEW.ticket_id IS NOT NULL AND OLD.ticket_id IS NULL THEN
    NEW.assigned_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- 6c. Bulk Item Sold via Transaction
CREATE OR REPLACE FUNCTION public.decrement_bulk_inventory_on_sale()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_shop_id UUID;
  loc_internal UUID;
  loc_customer UUID;
BEGIN
  SELECT shop_id INTO v_shop_id FROM transactions WHERE id = NEW.transaction_id;
  
  IF NEW.inventory_item_id IS NOT NULL AND NEW.serial_number_id IS NULL THEN
    SELECT id INTO loc_internal FROM stock_locations WHERE shop_id = v_shop_id AND type = 'internal' LIMIT 1;
    SELECT id INTO loc_customer FROM stock_locations WHERE shop_id = v_shop_id AND type = 'customer' LIMIT 1;

    INSERT INTO stock_moves (shop_id, item_id, source_location_id, dest_location_id, quantity, status, reference)
    VALUES (v_shop_id, NEW.inventory_item_id, loc_internal, loc_customer, NEW.quantity, 'done', 'Direct Sale');
  END IF;

  IF NEW.serial_number_id IS NOT NULL THEN
    UPDATE serial_numbers
    SET status = 'Sold', ticket_id = (SELECT ticket_id FROM transactions WHERE id = NEW.transaction_id)
    WHERE id = NEW.serial_number_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 7. View to calculate current stock strictly from moves (for audits)
CREATE OR REPLACE VIEW get_current_stock AS
SELECT
  item_id,
  SUM(CASE WHEN dst.type = 'internal' THEN quantity ELSE 0 END) -
  SUM(CASE WHEN src.type = 'internal' THEN quantity ELSE 0 END) AS calculated_quantity
FROM stock_moves m
JOIN stock_locations src ON src.id = m.source_location_id
JOIN stock_locations dst ON dst.id = m.dest_location_id
WHERE m.status = 'done'
GROUP BY item_id;
