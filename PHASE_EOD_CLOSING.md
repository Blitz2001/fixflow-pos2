# End-of-Day Closing & Daily Report Plan

The `shop_sessions` table gives us a precise `opened_at` / `closed_at` window to scope every financial query for the day. "Close Shop" becomes a single **End-of-Day trigger** that finalizes everything automatically.

---

## What Happens When Owner Clicks "Close Shop"

1. **Set `closed_at`** on the active `shop_sessions` row.
2. **Trigger a server action** (`closeShopWithSummary`) that runs all calculations below in a single atomic pass.
3. **Render the End-of-Day Report** as a modal or a dedicated page.

---

## Calculations Scoped to the Session Window

### 💰 Daily Revenue (Till Summary)
```sql
SELECT
  SUM(grand_total)  AS total_revenue,
  SUM(CASE WHEN payment_type = 'Cash' THEN grand_total ELSE 0 END) AS cash_sales,
  SUM(CASE WHEN payment_type = 'Bank Transfer' THEN grand_total ELSE 0 END) AS transfer_sales,
  SUM(CASE WHEN payment_type = 'QR' THEN grand_total ELSE 0 END) AS qr_sales,
  COUNT(*) AS transaction_count
FROM transactions
WHERE shop_id = :shopId
  AND status = 'paid'
  AND paid_at BETWEEN :opened_at AND :closed_at;
```

### 🧾 Till Closing (Cash Drawer Balance)
```
Cash in Drawer = Opening Float + Cash Sales − Cash Refunds
```
- Opening float is an optional field we can add to `shop_sessions` (e.g., `opening_float NUMERIC`).
- At close, the system shows **Expected Cash** vs **Counted Cash** (owner inputs), and records any discrepancy.

### 👷 Staff Wages Due Tonight
```sql
SELECT e.full_name, a.daily_wage_earned, a.check_in, a.check_out
FROM hr_attendance a
JOIN hr_employees e ON e.id = a.employee_id
WHERE a.shop_id = :shopId
  AND a.check_in >= :opened_at
  AND a.is_paid = false;
```
- Owner can approve and auto-insert into `expenses` (category: `Staff Wages (Daily)`) in one click.

### 📦 Daily Expenses
```sql
SELECT category, SUM(amount) AS total
FROM expenses
WHERE shop_id = :shopId
  AND expense_date = CURRENT_DATE
GROUP BY category;
```

### 📊 Net Profit for the Day
```
Net = Total Revenue − Cost of Goods Sold (from stock_moves) − Daily Expenses − Daily Wages
```

---

## End-of-Day Report (Auto-Generated)

When "Close Shop" is confirmed, the system generates a structured summary containing:

| Section | Detail |
|---|---|
| Session Hours | Opened 9:00 AM → Closed 7:30 PM (10h 30m) |
| Total Revenue | LKR 85,000 |
| Cash Sales | LKR 40,000 |
| Card / QR | LKR 45,000 |
| Total Expenses | LKR 12,000 |
| Staff Wages Due | LKR 8,500 |
| Estimated Net | LKR 64,500 |
| Tickets Completed | 12 |
| Parts Used | 8 units |

- The report is stored in a new `daily_reports` table (one row per session).
- Optionally printable / exportable as PDF.

---

## Future Migration Needed: `012_daily_reports.sql`

```sql
CREATE TABLE daily_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID NOT NULL REFERENCES shops(id),
  session_id      UUID NOT NULL REFERENCES shop_sessions(id),
  report_date     DATE NOT NULL,
  total_revenue   NUMERIC(12,2),
  cash_sales      NUMERIC(12,2),
  total_expenses  NUMERIC(12,2),
  wages_paid      NUMERIC(12,2),
  net_profit      NUMERIC(12,2),
  tickets_closed  INT,
  payload         JSONB, -- full breakdown for display
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Files to Create When Ready

| File | Purpose |
|---|---|
| `supabase/migrations/012_daily_reports.sql` | `daily_reports` table + `opening_float` on `shop_sessions` |
| `web/src/lib/actions/shop-session.ts` | Extend `closeShop()` → `closeShopWithSummary()` |
| `web/src/components/features/shop/DailyCloseModal.tsx` | The End-of-Day UI modal |
| `web/src/app/(dashboard)/dashboard/reports/daily/page.tsx` | Historical daily report viewer |
