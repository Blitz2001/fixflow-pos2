-- ================================================================
-- DANGER: This script wipes all custom tables, views, and functions
-- from the public schema. It will NOT delete your Supabase Auth users
-- or Storage buckets, but it will delete all application data.
-- ================================================================

DROP TABLE IF EXISTS 
  activity_logs, 
  evidence_logs, 
  transaction_items, 
  transactions, 
  serial_numbers, 
  inventory_items, 
  purchase_orders, 
  suppliers, 
  expenses, 
  ticket_status_history, 
  ticket_status_updates, 
  repair_tickets, 
  devices, 
  customers, 
  memberships, 
  profiles, 
  shops,
  invoices,
  invoice_items,
  payments
CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS get_my_shop_ids() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS generate_ticket_number(UUID) CASCADE;
DROP FUNCTION IF EXISTS touch_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_ticket_status_change() CASCADE;
DROP FUNCTION IF EXISTS sync_inventory_quantity_on_insert() CASCADE;
DROP FUNCTION IF EXISTS sync_inventory_quantity_on_assign() CASCADE;
DROP FUNCTION IF EXISTS decrement_bulk_inventory_on_sale() CASCADE;

-- Note: All Views (daily_revenue, low_stock_alerts, etc.) and Triggers 
-- are automatically dropped when the tables they depend on are dropped via CASCADE.
