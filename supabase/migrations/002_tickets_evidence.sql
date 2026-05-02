-- ================================================================
-- RepairOS — Migration 002: Repair Tickets & Evidence
-- Depends on: 001_foundation.sql
-- ================================================================

-- ── REPAIR TICKETS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS repair_tickets (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id                  UUID        NOT NULL REFERENCES shops(id)   ON DELETE CASCADE,
  device_id                UUID        NOT NULL REFERENCES devices(id),
  ticket_number            TEXT        NOT NULL,

  -- Core fields
  issue_description        TEXT        NOT NULL DEFAULT '',
  status                   TEXT        NOT NULL DEFAULT 'intake'
    CHECK (status IN ('intake','diagnosing','waiting_parts','repairing','ready','delivered','cancelled')),
  priority                 TEXT        NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low','normal','high','urgent')),

  -- Staff
  assigned_to              UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  technician_notes         TEXT,

  -- Financials
  estimated_cost           NUMERIC(12,2),
  actual_cost              NUMERIC(12,2),
  estimated_completion_date DATE,

  -- Accessories list e.g. ["Charger","Bag"]
  accessories_included     JSONB       NOT NULL DEFAULT '[]',

  /**
   * metadata: extensible JSONB for future business types.
   * PC Repair: {}  (default — ticket fields cover everything)
   * Salon:     { "appointment_time": "...", "stylist_id": "..." }
   * Grocery:   { "delivery_slot": "...", "order_items": [...] }
   */
  metadata                 JSONB       NOT NULL DEFAULT '{}',

  -- Timestamps
  intake_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (shop_id, ticket_number)
);

-- Performance: dashboard sorts by status + created_at most frequently
CREATE INDEX IF NOT EXISTS idx_tickets_shop_status  ON repair_tickets (shop_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_shop_created ON repair_tickets (shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned     ON repair_tickets (assigned_to);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tickets_updated_at ON repair_tickets;
CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON repair_tickets
  FOR EACH ROW EXECUTE PROCEDURE public.touch_updated_at();

-- Ticket number generator: PC-1001, PC-1002, …
CREATE OR REPLACE FUNCTION public.generate_ticket_number(p_shop_id UUID)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v_next INT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INT)), 1000
  ) + 1
  INTO v_next
  FROM repair_tickets
  WHERE shop_id = p_shop_id;
  RETURN 'PC-' || v_next;
END;
$$;

-- ── TICKET STATUS HISTORY (Audit trail) ─────────────────────────
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID        NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  shop_id     UUID        NOT NULL REFERENCES shops(id)          ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT        NOT NULL,
  changed_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  note        TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_ticket ON ticket_status_history (ticket_id, changed_at DESC);

-- Auto-insert a history row whenever ticket status changes
CREATE OR REPLACE FUNCTION public.log_ticket_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_status_history
      (ticket_id, shop_id, from_status, to_status, changed_by)
    VALUES
      (NEW.id, NEW.shop_id, OLD.status, NEW.status, (SELECT auth.uid()));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_status_change_log ON repair_tickets;
CREATE TRIGGER ticket_status_change_log
  AFTER UPDATE ON repair_tickets
  FOR EACH ROW EXECUTE PROCEDURE public.log_ticket_status_change();

-- ── EVIDENCE LOGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS evidence_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    UUID        NOT NULL REFERENCES repair_tickets(id) ON DELETE CASCADE,
  shop_id      UUID        NOT NULL REFERENCES shops(id)          ON DELETE CASCADE,
  photo_url    TEXT        NOT NULL, -- Public URL from Supabase Storage
  storage_path TEXT        NOT NULL, -- Internal storage path for deletion
  uploader_id  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_ticket ON evidence_logs (ticket_id);

-- ── ACTIVITY LOGS (Data Science / Audit) ────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT        NOT NULL, -- e.g. 'ticket.created', 'item.sold', 'status.changed'
  payload     JSONB       NOT NULL DEFAULT '{}', -- Raw event data for ML/DS pipelines
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimised for time-series queries (DS dashboards read by shop + time range)
CREATE INDEX IF NOT EXISTS idx_activity_shop_time   ON activity_logs (shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action_type ON activity_logs (action_type);

-- ── RLS ──────────────────────────────────────────────────────────

ALTER TABLE repair_tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs        ENABLE ROW LEVEL SECURITY;

-- REPAIR TICKETS: all roles can read; TECHNICIAN write is restricted in app layer
CREATE POLICY "tickets_tenant"
  ON repair_tickets FOR ALL TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));

-- TICKET STATUS HISTORY: read-only tenant isolation (inserts via trigger)
CREATE POLICY "ticket_history_tenant"
  ON ticket_status_history FOR ALL TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));

-- EVIDENCE LOGS: tenant isolation
CREATE POLICY "evidence_tenant"
  ON evidence_logs FOR ALL TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));

-- ACTIVITY LOGS: append-only for authenticated users, no UPDATE/DELETE
CREATE POLICY "activity_logs_select"
  ON activity_logs FOR SELECT TO authenticated
  USING (shop_id IN (SELECT get_my_shop_ids()));

CREATE POLICY "activity_logs_insert"
  ON activity_logs FOR INSERT TO authenticated
  WITH CHECK (shop_id IN (SELECT get_my_shop_ids()));
