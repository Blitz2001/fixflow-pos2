// ─────────────────────────────────────────────────────────────────────────────
// RepairOS — Database Types
// Auto-generate with: npm run db:types  (requires Supabase CLI)
// Hand-authored for Phase 1 bootstrapping.
// ─────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Enums ─────────────────────────────────────────────────────────────────────
export type TicketStatus = 'intake' | 'diagnosing' | 'waiting_parts' | 'repairing' | 'ready' | 'delivered' | 'cancelled'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type MembershipRole = 'OWNER' | 'ADMIN' | 'TECHNICIAN'
export type PaymentType = 'Cash' | 'Bank Transfer' | 'QR' | 'Card'
export type TransactionType = 'repair_payment' | 'direct_sale' | 'refund'
export type LocationType = 'internal' | 'vendor' | 'customer' | 'inventory_loss' | 'scrap'
export type ProductType = 'storable' | 'service' | 'consumable'

export type HRRole = 'Technician' | 'Manager' | 'Cashier'
export type HRPayFrequency = 'DAILY' | 'MONTHLY'
export type HRAttendanceStatus = 'PRESENT' | 'LATE' | 'LEAVE'
export type HRCommissionStatus = 'PENDING_WARRANTY' | 'EARNED' | 'PAID'

// ── Table Rows ────────────────────────────────────────────────────────────────
export interface ShopRow {
  id: string; name: string; address: string | null; phone: string | null
  logo_url: string | null; currency: string; tax_enabled: boolean
  tax_rate: number; created_at: string
}

export interface ProfileRow {
  id: string; full_name: string; avatar_url: string | null; created_at: string
}

export interface MembershipRow {
  id: string; user_id: string; shop_id: string; role: MembershipRole; created_at: string
}

export interface PartnerRow {
  id: string; shop_id: string; name: string; phone: string | null
  email: string | null; partner_types: string[]; lead_time_days: number; created_at: string
}

export interface DeviceRow {
  id: string; shop_id: string; partner_id: string; brand: string | null
  model: string; serial_number: string | null; created_at: string
}

export interface RepairTicketRow {
  id: string; shop_id: string; device_id: string; ticket_number: string
  issue_description: string; status: TicketStatus; priority: TicketPriority
  assigned_to: string | null; technician_notes: string | null
  estimated_cost: number | null; actual_cost: number | null
  estimated_completion_date: string | null
  accessories_included: Json  // string[]
  metadata: Json              // extensible — salon/grocery fields go here
  intake_at: string; delivered_at: string | null
  created_at: string; updated_at: string
}

export interface TicketStatusHistoryRow {
  id: string; ticket_id: string; shop_id: string
  from_status: TicketStatus | null; to_status: TicketStatus
  changed_by: string | null; note: string | null; changed_at: string
}

export interface EvidenceLogRow {
  id: string; ticket_id: string; shop_id: string
  photo_url: string; storage_path: string
  uploader_id: string | null; uploaded_at: string
}

export interface InventoryItemRow {
  id: string; shop_id: string; partner_id: string | null
  name: string; brand: string | null; category: string; sku: string | null
  cost_price: number; sell_price: number
  quantity: number; low_stock_threshold: number; product_type: ProductType; created_at: string
}

export interface StockLocationRow {
  id: string; shop_id: string; name: string; type: LocationType; created_at: string
}

export interface StockMoveRow {
  id: string; shop_id: string; item_id: string; serial_number_id: string | null
  source_location_id: string; dest_location_id: string
  quantity: number; status: 'draft' | 'done' | 'cancelled'; reference: string | null
  created_at: string
}

export interface TransactionRow {
  id: string; shop_id: string; ticket_id: string | null; partner_id: string | null
  type: TransactionType; payment_type: PaymentType
  subtotal: number; tax_amount: number; discount: number; grand_total: number
  status: 'draft' | 'paid' | 'refunded'
  paid_at: string | null; created_at: string
}

export interface TransactionItemRow {
  id: string; transaction_id: string; inventory_item_id: string | null
  description: string; quantity: number
  cost_price_snapshot: number  // immutable snapshot for margin analysis
  unit_price: number; line_total: number
}

export interface ExpenseRow {
  id: string; shop_id: string; category: string; description: string | null
  amount: number; expense_date: string; receipt_url: string | null
  created_by: string | null; created_at: string
}

export interface ShopSessionRow {
  id: string; shop_id: string; opened_at: string; closed_at: string | null
  opened_by: string | null; closed_by: string | null; notes: string | null; created_at: string
}

export interface HREmployeeRow {
  id: string; shop_id: string; full_name: string; role: HRRole
  pay_frequency: HRPayFrequency; base_salary: number; daily_rate: number
  commission_rate: number; auth_pin: string | null; created_at: string
}

export interface HRAttendanceRow {
  id: string; shop_id: string; employee_id: string; check_in: string
  check_out: string | null; status: HRAttendanceStatus
  daily_wage_earned: number | null; is_paid: boolean; created_at: string
}

export interface HRCommissionRow {
  id: string; shop_id: string; employee_id: string; ticket_id: string
  amount: number; status: HRCommissionStatus; release_date: string; created_at: string
}

export interface ActivityLogRow {
  id: string; shop_id: string; user_id: string | null
  action_type: string; payload: Json; created_at: string
}

// ── Supabase Database interface ────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      shops:                  { Row: ShopRow;               Insert: any; Update: any; Relationships: any[] }
      profiles:               { Row: ProfileRow;            Insert: any; Update: any; Relationships: any[] }
      memberships:            { Row: MembershipRow;         Insert: any; Update: any; Relationships: any[] }
      partners:               { Row: PartnerRow;            Insert: any; Update: any; Relationships: any[] }
      devices:                { Row: DeviceRow;             Insert: any; Update: any; Relationships: any[] }
      repair_tickets:         { Row: RepairTicketRow;       Insert: any; Update: any; Relationships: any[] }
      ticket_status_history:  { Row: TicketStatusHistoryRow; Insert: any; Update: any; Relationships: any[] }
      evidence_logs:          { Row: EvidenceLogRow;        Insert: any; Update: any; Relationships: any[] }
      inventory_items:        { Row: InventoryItemRow;      Insert: any; Update: any; Relationships: any[] }
      stock_locations:        { Row: StockLocationRow;      Insert: any; Update: any; Relationships: any[] }
      stock_moves:            { Row: StockMoveRow;          Insert: any; Update: any; Relationships: any[] }
      transactions:           { Row: TransactionRow;        Insert: any; Update: any; Relationships: any[] }
      transaction_items:      { Row: TransactionItemRow;    Insert: any; Update: any; Relationships: any[] }
      expenses:               { Row: ExpenseRow;            Insert: any; Update: any; Relationships: any[] }
      hr_employees:           { Row: HREmployeeRow;         Insert: any; Update: any; Relationships: any[] }
      hr_attendance:          { Row: HRAttendanceRow;       Insert: any; Update: any; Relationships: any[] }
      hr_commissions:         { Row: HRCommissionRow;       Insert: any; Update: any; Relationships: any[] }
      shop_sessions:          { Row: ShopSessionRow;        Insert: any; Update: any; Relationships: any[] }
      activity_logs:          { Row: ActivityLogRow;        Insert: any; Update: any; Relationships: any[] }
      serial_numbers:         { Row: any;                   Insert: any; Update: any; Relationships: any[] }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_my_shop_ids:        { Args: Record<string, never>; Returns: string[] }
      generate_ticket_number: { Args: { p_shop_id: string }; Returns: string }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// ── Joined / Computed types ────────────────────────────────────────────────────
export interface TicketWithDetails extends RepairTicketRow {
  device: DeviceRow & { partner: PartnerRow }
  assigned_profile: ProfileRow | null
  evidence_count: number
}

export interface MemberWithProfile extends MembershipRow {
  profile: ProfileRow
}
