-- ================================================================
-- RepairOS — Migration 010: HR, Attendance, and Payroll Module
-- ================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE hr_role AS ENUM ('Technician', 'Manager', 'Cashier');
  CREATE TYPE hr_pay_frequency AS ENUM ('DAILY', 'MONTHLY');
  CREATE TYPE hr_attendance_status AS ENUM ('PRESENT', 'LATE', 'LEAVE');
  CREATE TYPE hr_commission_status AS ENUM ('PENDING_WARRANTY', 'EARNED', 'PAID');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Modify Expenses Constraint
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN (
    'Rent', 'Salary', 'Utilities', 'Parts Purchase', 'Marketing', 'Other',
    'Staff Wages (Daily)', 'Staff Salaries (Monthly)'
  ));

-- 3. Create HR Employees Table
CREATE TABLE IF NOT EXISTS hr_employees (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  role            hr_role NOT NULL DEFAULT 'Technician',
  pay_frequency   hr_pay_frequency NOT NULL DEFAULT 'DAILY',
  base_salary     NUMERIC(12,2) NOT NULL DEFAULT 0,
  daily_rate      NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- e.g., 0.10 for 10%
  auth_pin        TEXT, -- Hashed PIN for kiosk clock-in
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hr_employees_shop ON hr_employees(shop_id);

-- 4. Create HR Attendance Table
CREATE TABLE IF NOT EXISTS hr_attendance (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id           UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  check_in          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out         TIMESTAMPTZ,
  status            hr_attendance_status NOT NULL DEFAULT 'PRESENT',
  daily_wage_earned NUMERIC(12,2) DEFAULT 0,
  is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hr_attendance_emp ON hr_attendance(employee_id);

-- 5. Create HR Commissions Table
CREATE TABLE IF NOT EXISTS hr_commissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  employee_id  UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  ticket_id    UUID NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL,
  status       hr_commission_status NOT NULL DEFAULT 'PENDING_WARRANTY',
  release_date TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hr_commissions_emp ON hr_commissions(employee_id);
CREATE INDEX idx_hr_commissions_status ON hr_commissions(status);

-- 6. Row Level Security (RLS)
ALTER TABLE hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hr_employees_tenant" ON hr_employees 
  FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));

CREATE POLICY "hr_attendance_tenant" ON hr_attendance 
  FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));

CREATE POLICY "hr_commissions_tenant" ON hr_commissions 
  FOR ALL TO authenticated USING (shop_id IN (SELECT get_my_shop_ids()));
