-- 014_enable_realtime.sql
-- Enables Supabase Realtime for critical platform tables

-- 1. Create a publication for realtime if it doesn't exist
-- Note: Supabase usually has 'supabase_realtime' publication already.

-- 2. Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE shops;
ALTER PUBLICATION supabase_realtime ADD TABLE platform_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE repair_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
