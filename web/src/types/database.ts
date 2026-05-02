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
export type ExpenseCategory = 'Rent' | 'Salary' | 'Utilities' | 'Parts Purchase' | 'Marketing' | 'Other'

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

export interface CustomerRow {
  id: string; shop_id: string; name: string; phone_number: string
  email: string | null; created_at: string
}

export interface DeviceRow {
  id: string; shop_id: string; customer_id: string; brand: string | null
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
  id: string; shop_id: string; supplier_id: string | null
  name: string; brand: string | null; category: string; sku: string | null
  cost_price: number; sell_price: number
  quantity: number; low_stock_threshold: number; created_at: string
}

export interface SupplierRow {
  id: string; shop_id: string; name: string
  contact_person: string | null; phone: string | null; email: string | null; created_at: string
}

export interface TransactionRow {
  id: string; shop_id: string; ticket_id: string | null; customer_id: string | null
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
  id: string; shop_id: string; category: ExpenseCategory
  description: string | null; amount: number
  expense_date: string; receipt_url: string | null
  created_by: string | null; created_at: string
}

export interface ActivityLogRow {
  id: string; shop_id: string; user_id: string | null
  action_type: string; payload: Json; created_at: string
}

// ── Supabase Database interface ────────────────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      shops:                  { Row: ShopRow;               Insert: Omit<ShopRow, 'id'|'created_at'>;               Update: Partial<Omit<ShopRow, 'id'|'created_at'>> }
      profiles:               { Row: ProfileRow;            Insert: Omit<ProfileRow, 'created_at'>;                  Update: Partial<Omit<ProfileRow, 'id'|'created_at'>> }
      memberships:            { Row: MembershipRow;         Insert: Omit<MembershipRow, 'id'|'created_at'>;          Update: Partial<Pick<MembershipRow, 'role'>> }
      customers:              { Row: CustomerRow;           Insert: Omit<CustomerRow, 'id'|'created_at'>;            Update: Partial<Omit<CustomerRow, 'id'|'shop_id'|'created_at'>> }
      devices:                { Row: DeviceRow;             Insert: Omit<DeviceRow, 'id'|'created_at'>;              Update: Partial<Omit<DeviceRow, 'id'|'created_at'>> }
      repair_tickets:         { Row: RepairTicketRow;       Insert: Omit<RepairTicketRow, 'id'|'created_at'|'updated_at'>; Update: Partial<Omit<RepairTicketRow, 'id'|'shop_id'|'created_at'>> }
      ticket_status_history:  { Row: TicketStatusHistoryRow; Insert: Omit<TicketStatusHistoryRow, 'id'|'changed_at'>; Update: never }
      evidence_logs:          { Row: EvidenceLogRow;        Insert: Omit<EvidenceLogRow, 'id'|'uploaded_at'>;        Update: never }
      inventory_items:        { Row: InventoryItemRow;      Insert: Omit<InventoryItemRow, 'id'|'created_at'>;       Update: Partial<Omit<InventoryItemRow, 'id'|'shop_id'|'created_at'>> }
      suppliers:              { Row: SupplierRow;           Insert: Omit<SupplierRow, 'id'|'created_at'>;            Update: Partial<Omit<SupplierRow, 'id'|'shop_id'|'created_at'>> }
      transactions:           { Row: TransactionRow;        Insert: Omit<TransactionRow, 'id'|'created_at'>;         Update: Partial<Pick<TransactionRow, 'status'|'paid_at'>> }
      transaction_items:      { Row: TransactionItemRow;    Insert: Omit<TransactionItemRow, 'id'>;                  Update: never }
      expenses:               { Row: ExpenseRow;            Insert: Omit<ExpenseRow, 'id'|'created_at'>;             Update: Partial<Omit<ExpenseRow, 'id'|'shop_id'|'created_at'>> }
      activity_logs:          { Row: ActivityLogRow;        Insert: Omit<ActivityLogRow, 'id'|'created_at'>;         Update: never }
    }
    Views: { [_ in never]: never }
    Functions: {
      get_my_shop_ids:        { Args: Record<string, never>; Returns: string[] }
      generate_ticket_number: { Args: { p_shop_id: string }; Returns: string }
    }
    Enums: { [_ in never]: never }
  }
}

// ── Joined / Computed types ────────────────────────────────────────────────────
export interface TicketWithDetails extends RepairTicketRow {
  device: DeviceRow & { customer: CustomerRow }
  assigned_profile: ProfileRow | null
  evidence_count: number
}

export interface MemberWithProfile extends MembershipRow {
  profile: ProfileRow
}
