-- ==============================================================================
-- JAB LEATHER - MIGRATION 003: ATOMIC ORDER CREATION & GUEST ORDER RPC
-- Description: SECURITY DEFINER database functions with ACID transaction guarantees
-- Review-Only Migration (Do not apply automatically without review)
-- ==============================================================================

-- Architectural Recommendation: Postgres Function (RPC) vs. Supabase Edge Function
-- We strongly recommend this PostgreSQL function for order placement because:
-- 1. ACID & Row Locks: Uses `SELECT ... FOR UPDATE` directly on product rows within the
--    same database transaction, making overselling mathematically impossible even under high concurrency.
-- 2. Zero Cold Starts: Executes in single-digit milliseconds natively inside the Postgres engine.
-- 3. Elimination of Price Spoofing: Client prices and totals are completely discarded;
--    all amounts are calculated server-side from verified catalog records.

CREATE OR REPLACE FUNCTION public.create_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_items_input JSONB;
  v_customer JSONB;
  v_shipping_address JSONB;
  v_payment_method TEXT;
  v_coupon_code TEXT;
  v_currency TEXT;

  v_item JSONB;
  v_product_id TEXT;
  v_product_uuid UUID;
  v_quantity INT;
  v_size TEXT;
  v_color TEXT;

  v_product RECORD;
  v_unit_price NUMERIC(12, 2);
  v_item_subtotal NUMERIC(12, 2);

  v_calc_subtotal NUMERIC(12, 2) := 0;
  v_calc_discount NUMERIC(12, 2) := 0;
  v_calc_shipping NUMERIC(12, 2) := 0;
  v_calc_tax NUMERIC(12, 2) := 0;
  v_calc_total NUMERIC(12, 2) := 0;

  v_verified_items JSONB := '[]'::JSONB;
  v_verified_item JSONB;
  v_order RECORD;
BEGIN
  -- 1. Extract and sanitize top-level parameters
  v_user_id := auth.uid(); -- Null if guest checkout
  v_items_input := payload->'items';
  v_customer := payload->'customer';
  v_shipping_address := payload->'shippingAddress';
  v_payment_method := COALESCE(payload->>'paymentMethod', 'card');
  v_coupon_code := NULLIF(TRIM(payload->>'couponCode'), '');
  v_currency := COALESCE(NULLIF(TRIM(payload->>'currency'), ''), 'USD');

  -- Basic validation
  IF v_items_input IS NULL OR jsonb_array_length(v_items_input) = 0 THEN
    RAISE EXCEPTION 'Order placement failed: Cart is empty.';
  END IF;

  IF v_customer IS NULL OR NULLIF(TRIM(v_customer->>'email'), '') IS NULL THEN
    RAISE EXCEPTION 'Order placement failed: Customer email is required.';
  END IF;

  IF v_shipping_address IS NULL OR NULLIF(TRIM(v_shipping_address->>'address'), '') IS NULL THEN
    RAISE EXCEPTION 'Order placement failed: Shipping address is required.';
  END IF;

  -- 2. Process each item: acquire row lock, verify stock, calculate real prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items_input)
  LOOP
    v_product_id := v_item->>'productId';
    IF v_product_id IS NULL THEN
      v_product_id := v_item->>'id';
    END IF;
    v_quantity := COALESCE((v_item->>'quantity')::INT, 1);
    v_size := COALESCE(v_item->>'size', 'Standard');
    v_color := COALESCE(v_item->>'color', '');

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity % requested for product %', v_quantity, v_product_id;
    END IF;

    -- Lock product row FOR UPDATE to prevent race conditions & overselling
    BEGIN
      v_product_uuid := v_product_id::UUID;
      SELECT * INTO v_product
      FROM public.products
      WHERE id = v_product_uuid
      FOR UPDATE;
    EXCEPTION WHEN OTHERS THEN
      SELECT * INTO v_product
      FROM public.products
      WHERE id::TEXT = v_product_id OR slug = v_product_id
      LIMIT 1
      FOR UPDATE;
    END;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with identifier "%" not found in catalog.', v_product_id;
    END IF;

    IF v_product.status <> 'active' THEN
      RAISE EXCEPTION 'Product "%" is currently unavailable.', v_product.name;
    END IF;

    IF v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Available: %, Requested: %',
        v_product.name, v_product.stock, v_quantity;
    END IF;

    -- Calculate true unit price (taking valid sale price into account)
    IF v_product.sale_price IS NOT NULL AND v_product.sale_price > 0 AND v_product.sale_price < v_product.price THEN
      v_unit_price := v_product.sale_price;
    ELSE
      v_unit_price := v_product.price;
    END IF;

    v_item_subtotal := ROUND(v_unit_price * v_quantity, 2);
    v_calc_subtotal := v_calc_subtotal + v_item_subtotal;

    -- Decrement stock atomically
    UPDATE public.products
    SET stock = stock - v_quantity,
        updated_at = NOW()
    WHERE id = v_product.id;

    -- Build immutable item snapshot
    v_verified_item := jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'slug', v_product.slug,
      'sku', COALESCE(v_product.sku, ''),
      'price', v_unit_price,
      'quantity', v_quantity,
      'size', v_size,
      'color', v_color,
      'image', COALESCE(v_product.images->>0, ''),
      'subtotal', v_item_subtotal
    );

    v_verified_items := v_verified_items || jsonb_build_array(v_verified_item);
  END LOOP;

  -- 3. Server-side Coupon & Discount Calculation
  IF v_coupon_code IS NOT NULL THEN
    IF UPPER(v_coupon_code) = 'WELCOME10' THEN
      v_calc_discount := ROUND(v_calc_subtotal * 0.10, 2);
    ELSIF UPPER(v_coupon_code) = 'LUXURY20' AND v_calc_subtotal >= 200 THEN
      v_calc_discount := ROUND(v_calc_subtotal * 0.20, 2);
    ELSIF UPPER(v_coupon_code) = 'FREESHIP' THEN
      v_calc_discount := 0; -- Handled in shipping below
    END IF;
  END IF;

  -- 4. Server-side Shipping Calculation
  -- Free shipping for orders $150+ or when FREESHIP coupon is used
  IF (v_currency = 'USD' AND v_calc_subtotal >= 150.00) OR UPPER(COALESCE(v_coupon_code, '')) = 'FREESHIP' THEN
    v_calc_shipping := 0.00;
  ELSE
    v_calc_shipping := 25.00;
  END IF;

  -- 5. Calculate Final Total
  v_calc_total := GREATEST(0.00, v_calc_subtotal - v_calc_discount + v_calc_shipping + v_calc_tax);

  -- 6. Insert Order Record with initial 'unpaid' status
  INSERT INTO public.orders (
    user_id,
    customer,
    shipping_address,
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    currency,
    payment_method,
    payment_status,
    order_status,
    coupon_code
  ) VALUES (
    v_user_id,
    v_customer,
    v_shipping_address,
    v_verified_items,
    v_calc_subtotal,
    v_calc_discount,
    v_calc_shipping,
    v_calc_tax,
    v_calc_total,
    v_currency,
    v_payment_method,
    'unpaid',
    'pending',
    v_coupon_code
  )
  RETURNING * INTO v_order;

  -- 7. Return created order JSON
  RETURN jsonb_build_object(
    'id', v_order.order_number,
    'databaseId', v_order.id,
    'orderNumber', v_order.order_number,
    'date', v_order.created_at,
    'customer', v_order.customer,
    'shippingAddress', v_order.shipping_address,
    'items', v_order.items,
    'subtotal', v_order.subtotal,
    'discount', v_order.discount,
    'shippingFee', v_order.shipping,
    'tax', v_order.tax,
    'total', v_order.total,
    'currency', v_order.currency,
    'paymentMethod', v_order.payment_method,
    'paymentStatus', v_order.payment_status,
    'orderStatus', v_order.order_status,
    'trackingNumber', v_order.payment_reference
  );
END;
$$;


-- 8. GUEST ORDER LOOKUP RPC
-- Safe RPC for guest checkout confirmation. Allows finding a single order by order_number
-- only when the provided email matches the stored customer email.
CREATE OR REPLACE FUNCTION public.get_guest_order(p_order_number TEXT, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
BEGIN
  IF p_order_number IS NULL OR p_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE order_number = p_order_number
    AND LOWER(TRIM(customer->>'email')) = LOWER(TRIM(p_email));

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_order.order_number,
    'databaseId', v_order.id,
    'orderNumber', v_order.order_number,
    'date', v_order.created_at,
    'customer', v_order.customer,
    'shippingAddress', v_order.shipping_address,
    'items', v_order.items,
    'subtotal', v_order.subtotal,
    'discount', v_order.discount,
    'shippingFee', v_order.shipping,
    'tax', v_order.tax,
    'total', v_order.total,
    'currency', v_order.currency,
    'paymentMethod', v_order.payment_method,
    'paymentStatus', v_order.payment_status,
    'orderStatus', v_order.order_status,
    'trackingNumber', v_order.payment_reference
  );
END;
$$;
