-- ============================================================================
-- JAB LEATHER – PHASE 4: PAYMENT ARCHITECTURE MIGRATION (005)
-- Description: Creates payments table, processed_webhook_events table,
--              payment_audit_log, and security definer functions for manual
--              settlement and abandoned order cleanup.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'manual', 'sandbox', 'stripe', 'paypal'
  reference TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN (
      'pending',
      'processing',
      'paid',
      'failed',
      'cancelled',
      'amount_mismatch',
      'refunded',
      'partially_refunded'
    )
  ),
  raw_event_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_number ON public.payments(order_number);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- 2. Processed Webhook Events (Idempotency)
CREATE TABLE IF NOT EXISTS public.processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  order_number TEXT,
  processed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processed_events_event_id ON public.processed_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_processed_events_provider ON public.processed_webhook_events(provider);

-- 3. Payment Audit Log (Manual Transitions & Administrative Overrides)
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL,
  action TEXT NOT NULL, -- 'manual_payment_confirmed', 'status_override', 'refund_issued'
  performed_by TEXT NOT NULL, -- Admin email or UUID
  reason TEXT,
  previous_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_order_number ON public.payment_audit_log(order_number);
CREATE INDEX IF NOT EXISTS idx_payment_audit_created_at ON public.payment_audit_log(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- 4.1 Payments RLS Policies
-- Customers can read payments for their own orders only
DROP POLICY IF EXISTS "Customers can view their own order payments" ON public.payments;
CREATE POLICY "Customers can view their own order payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all payments
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can update payment records
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4.2 Webhook Events RLS Policies
-- Only service role and admins can access processed webhook records
DROP POLICY IF EXISTS "Admins can view webhook logs" ON public.processed_webhook_events;
CREATE POLICY "Admins can view webhook logs"
  ON public.processed_webhook_events FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4.3 Audit Log RLS Policies
-- Only admins can read audit log
DROP POLICY IF EXISTS "Admins can view payment audit log" ON public.payment_audit_log;
CREATE POLICY "Admins can view payment audit log"
  ON public.payment_audit_log FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 5. Administrative Manual Payment Confirmation Function
CREATE OR REPLACE FUNCTION public.mark_manual_payment_paid(
  p_order_number TEXT,
  p_reference TEXT,
  p_admin_id TEXT,
  p_reason TEXT DEFAULT 'Bank transfer verified by treasury'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_payment RECORD;
BEGIN
  -- 1. Fetch order
  SELECT * INTO v_order
  FROM public.orders
  WHERE order_number = p_order_number
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_number;
  END IF;

  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object(
      'status', 'already_paid',
      'order_number', p_order_number,
      'message', 'Order is already marked as paid'
    );
  END IF;

  -- 2. Update or insert payment record
  SELECT * INTO v_payment
  FROM public.payments
  WHERE order_number = p_order_number
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.payments
    SET
      status = 'paid',
      reference = COALESCE(NULLIF(p_reference, ''), reference),
      updated_at = now()
    WHERE id = v_payment.id;
  ELSE
    INSERT INTO public.payments (
      order_id,
      order_number,
      provider,
      reference,
      amount,
      currency,
      status
    ) VALUES (
      v_order.id,
      v_order.order_number,
      v_order.payment_method,
      COALESCE(NULLIF(p_reference, ''), 'MANUAL-' || v_order.order_number),
      v_order.total,
      v_order.currency,
      'paid'
    ) RETURNING * INTO v_payment;
  END IF;

  -- 3. Update order status
  UPDATE public.orders
  SET
    payment_status = 'paid',
    order_status = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END,
    payment_reference = COALESCE(NULLIF(p_reference, ''), v_order.payment_reference),
    updated_at = now()
  WHERE id = v_order.id;

  -- 4. Record entry in payment audit log
  INSERT INTO public.payment_audit_log (
    payment_id,
    order_number,
    action,
    performed_by,
    reason,
    previous_status,
    new_status
  ) VALUES (
    v_payment.id,
    p_order_number,
    'manual_payment_confirmed',
    COALESCE(p_admin_id, 'admin'),
    p_reason,
    v_order.payment_status,
    'paid'
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'order_number', p_order_number,
    'payment_id', v_payment.id,
    'new_payment_status', 'paid'
  );
END;
$$;

-- 6. Cleanup Abandoned Orders & Restock Inventory
CREATE OR REPLACE FUNCTION public.cancel_abandoned_orders(
  p_abandon_hours INTEGER DEFAULT 24
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rec RECORD;
  v_item JSONB;
  v_product_id UUID;
  v_quantity INTEGER;
  v_cancelled_count INTEGER := 0;
BEGIN
  FOR v_rec IN
    SELECT id, order_number, items
    FROM public.orders
    WHERE payment_status = 'unpaid'
      AND order_status = 'pending'
      AND created_at < (now() - (p_abandon_hours || ' hours')::INTERVAL)
    FOR UPDATE
  LOOP
    -- Restock items
    FOR v_item IN SELECT * FROM jsonb_array_elements(v_rec.items)
    LOOP
      v_product_id := (v_item->>'product_id')::UUID;
      v_quantity := (v_item->>'quantity')::INTEGER;

      IF v_product_id IS NOT NULL AND v_quantity > 0 THEN
        UPDATE public.products
        SET stock = stock + v_quantity
        WHERE id = v_product_id;
      END IF;
    END LOOP;

    -- Update order to cancelled
    UPDATE public.orders
    SET
      order_status = 'cancelled',
      payment_status = 'failed',
      notes = COALESCE(notes, '') || ' [Auto-cancelled: Payment abandoned after ' || p_abandon_hours || ' hours]',
      updated_at = now()
    WHERE id = v_rec.id;

    -- Record audit log
    INSERT INTO public.payment_audit_log (
      order_number,
      action,
      performed_by,
      reason,
      previous_status,
      new_status
    ) VALUES (
      v_rec.order_number,
      'order_abandoned_auto_cancelled',
      'system_scheduler',
      'Unpaid order expired after ' || p_abandon_hours || ' hours; inventory restocked',
      'unpaid',
      'cancelled'
    );

    v_cancelled_count := v_cancelled_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'status', 'success',
    'cancelled_orders_count', v_cancelled_count
  );
END;
$$;
