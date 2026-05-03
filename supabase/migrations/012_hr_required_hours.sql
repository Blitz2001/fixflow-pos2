-- ================================================================
-- RepairOS — Migration 012: HR Working Hours & Payment
-- ================================================================

-- Add required hours per day to hr_employees
ALTER TABLE hr_employees
  ADD COLUMN IF NOT EXISTS required_hours NUMERIC(4,2) NOT NULL DEFAULT 8.0;
