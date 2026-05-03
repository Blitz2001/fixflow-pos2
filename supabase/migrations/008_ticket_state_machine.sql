-- ================================================================
-- RepairOS — Migration 008: Ticket Finite State Machine (FSM)
-- ================================================================

CREATE OR REPLACE FUNCTION validate_ticket_fsm()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  is_paid BOOLEAN;
  txn_count INT;
BEGIN
  -- If status hasn't changed, allow the update (e.g. changing notes)
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- 1. Final States
  IF OLD.status IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Ticket is in a final state (%) and cannot be reopened.', OLD.status;
  END IF;

  -- 2. Strict State Transition Logic
  IF OLD.status = 'intake' AND NEW.status NOT IN ('diagnosing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid transition: % to %. Intake must go to diagnosing or cancelled.', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'diagnosing' AND NEW.status NOT IN ('waiting_parts', 'repairing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid transition: % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'waiting_parts' AND NEW.status NOT IN ('repairing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid transition: % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'repairing' AND NEW.status NOT IN ('ready', 'waiting_parts', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid transition: % to %', OLD.status, NEW.status;
  END IF;

  IF OLD.status = 'ready' AND NEW.status NOT IN ('delivered', 'cancelled', 'repairing') THEN
    RAISE EXCEPTION 'Invalid transition: % to %', OLD.status, NEW.status;
  END IF;

  -- 3. Financial Rule: Cannot be delivered unless transactions are settled
  IF NEW.status = 'delivered' THEN
    -- Check if there are any transactions tied to this ticket
    SELECT COUNT(*) INTO txn_count FROM transactions WHERE ticket_id = NEW.id;
    
    IF txn_count > 0 THEN
      -- If there are transactions, ensure at least one is 'paid' and no 'draft' remain?
      -- A simpler ERP rule: If there are transactions, there must be a paid one, and no unpaid drafts.
      SELECT EXISTS (
        SELECT 1 FROM transactions WHERE ticket_id = NEW.id AND status = 'draft'
      ) INTO is_paid; -- reusing variable for "has_draft"
      
      IF is_paid THEN
        RAISE EXCEPTION 'Financial Policy: Ticket cannot be delivered while there are unpaid draft transactions.';
      END IF;
    ELSE
        -- If actual cost > 0 but no transaction exists, block it
        IF COALESCE(NEW.actual_cost, 0) > 0 THEN
            RAISE EXCEPTION 'Financial Policy: Ticket has an actual cost but no paid transactions.';
        END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_ticket_fsm ON repair_tickets;
CREATE TRIGGER enforce_ticket_fsm
  BEFORE UPDATE ON repair_tickets
  FOR EACH ROW EXECUTE PROCEDURE validate_ticket_fsm();
