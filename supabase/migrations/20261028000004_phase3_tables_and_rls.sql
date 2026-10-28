-- ==============================================================================
-- JAB LEATHER - MIGRATION 004: PHASE 3 TABLES, RLS, AND COUPON VALIDATION RPC
-- Description: Store settings, shipping methods, coupons, CMS, collections,
--              verified reviews, contact messages, and newsletter subscribers.
-- Review-Only Migration (Do not apply automatically without review)
-- ==============================================================================

-- 1. STORE SETTINGS TABLE (Single Source of Truth for Store Configuration & Currency)
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read store settings (needed for store currency, exchange rates, thresholds)
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  TO public
  USING (true);

-- Admin can manage store settings
DROP POLICY IF EXISTS "Admin full control on store settings" ON public.store_settings;
CREATE POLICY "Admin full control on store settings"
  ON public.store_settings
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed default settings (USD primary export currency with multi-currency exchange rates)
INSERT INTO public.store_settings (key, value, description)
VALUES
(
  'general',
  jsonb_build_object(
    'store_name', 'JAB LEATHER',
    'tagline', 'Luxury Handcrafted Leather Goods from Sialkot, Pakistan',
    'base_currency', 'USD',
    'supported_currencies', jsonb_build_array('USD', 'PKR', 'EUR', 'GBP'),
    'exchange_rates', jsonb_build_object(
      'USD', 1.0,
      'PKR', 278.50,
      'EUR', 0.92,
      'GBP', 0.79
    ),
    'contact_email', 'concierge@jableather.com',
    'contact_phone', '+92 300 1234567',
    'address', 'Atelier District, Sialkot 51310, Punjab, Pakistan',
    'free_shipping_threshold', 150.00
  ),
  'Core store configuration, base export currency, and exchange rates'
),
(
  'shipping',
  jsonb_build_object(
    'free_shipping_threshold', 150.00,
    'standard_rate', 25.00,
    'express_rate', 35.00,
    'default_carrier', 'DHL Express / FedEx',
    'dispatch_origin', 'Sialkot, Pakistan'
  ),
  'Shipping thresholds and global dispatch configurations'
),
(
  'payments',
  jsonb_build_object(
    'stripe_enabled', true,
    'wire_transfer_enabled', true,
    'cod_enabled', false,
    'sandbox_mode', true,
    'wire_instructions', 'Bank: Standard Chartered Pakistan\nAccount Title: JAB LEATHER (PVT) LTD\nIBAN: PK36SCBL0000001123456701\nSWIFT: SCBLPKKA'
  ),
  'Payment gateway enablement and manual bank wire instructions'
)
ON CONFLICT (key) DO NOTHING;


-- 2. SHIPPING METHODS TABLE
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  estimated_days TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  free_above_subtotal NUMERIC(10, 2) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active shipping methods" ON public.shipping_methods;
CREATE POLICY "Public can view active shipping methods"
  ON public.shipping_methods
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin full control on shipping methods" ON public.shipping_methods;
CREATE POLICY "Admin full control on shipping methods"
  ON public.shipping_methods
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

INSERT INTO public.shipping_methods (name, code, rate, estimated_days, is_active, free_above_subtotal, sort_order)
VALUES
  ('DHL Express Worldwide', 'express', 35.00, '2-4 Business Days', true, NULL, 1),
  ('Standard International Air', 'standard', 25.00, '5-8 Business Days', true, 150.00, 2)
ON CONFLICT (code) DO NOTHING;


-- 3. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
  max_discount_amount NUMERIC(10, 2) DEFAULT NULL,
  usage_limit INT DEFAULT NULL,
  usage_count INT DEFAULT 0,
  per_customer_limit INT DEFAULT 1,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Note: Storefront cannot SELECT arbitrary coupon rows directly (protects unannounced codes).
-- Coupons are strictly validated through the `validate_coupon` RPC below.
DROP POLICY IF EXISTS "Admin full control on coupons" ON public.coupons;
CREATE POLICY "Admin full control on coupons"
  ON public.coupons
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
  ('WELCOME10', 'percentage', 10.00, 50.00, true),
  ('LUXURY20', 'percentage', 20.00, 200.00, true),
  ('FREESHIP', 'fixed', 25.00, 100.00, true)
ON CONFLICT (code) DO NOTHING;


-- 4. SERVER-SIDE COUPON VALIDATION RPC
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_subtotal NUMERIC,
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_coupon RECORD;
  v_discount NUMERIC(10, 2) := 0;
  v_user_uses INT := 0;
BEGIN
  IF p_code IS NULL OR TRIM(p_code) = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Coupon code is required.');
  END IF;

  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(TRIM(p_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid coupon code.');
  END IF;

  IF NOT v_coupon.is_active THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon is no longer active.');
  END IF;

  IF v_coupon.starts_at IS NOT NULL AND v_coupon.starts_at > NOW() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon promotion has not started yet.');
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon has expired.');
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon has reached its maximum usage limit.');
  END IF;

  IF v_coupon.min_order_amount IS NOT NULL AND p_subtotal < v_coupon.min_order_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', format('Minimum order amount of $%s required for this coupon.', v_coupon.min_order_amount)
    );
  END IF;

  -- Verify per-customer usage limit against past orders
  IF v_coupon.per_customer_limit IS NOT NULL AND (p_user_id IS NOT NULL OR (p_email IS NOT NULL AND TRIM(p_email) <> '')) THEN
    SELECT COUNT(*) INTO v_user_uses
    FROM public.orders
    WHERE coupon_code = v_coupon.code
      AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id)
        OR
        (p_email IS NOT NULL AND LOWER(TRIM(customer->>'email')) = LOWER(TRIM(p_email)))
      );

    IF v_user_uses >= v_coupon.per_customer_limit THEN
      RETURN jsonb_build_object('valid', false, 'error', 'You have already redeemed this coupon.');
    END IF;
  END IF;

  -- Calculate discount amount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := ROUND((p_subtotal * (v_coupon.discount_value / 100.0)), 2);
    IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
      v_discount := v_coupon.max_discount_amount;
    END IF;
  ELSE
    v_discount := LEAST(v_coupon.discount_value, p_subtotal);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', v_coupon.code,
    'discountType', v_coupon.discount_type,
    'discountValue', v_coupon.discount_value,
    'discountAmount', v_discount,
    'minOrderAmount', v_coupon.min_order_amount,
    'freeShipping', (UPPER(v_coupon.code) = 'FREESHIP')
  );
END;
$$;


-- 5. HOMEPAGE CMS TABLE
CREATE TABLE IF NOT EXISTS public.homepage_cms (
  id TEXT PRIMARY KEY,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.homepage_cms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active homepage cms sections" ON public.homepage_cms;
CREATE POLICY "Public can view active homepage cms sections"
  ON public.homepage_cms
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin full control on homepage cms" ON public.homepage_cms;
CREATE POLICY "Admin full control on homepage cms"
  ON public.homepage_cms
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed default CMS sections
INSERT INTO public.homepage_cms (id, title, content, is_active)
VALUES
(
  'announcement_bar',
  'Announcement Banner',
  jsonb_build_object(
    'enabled', true,
    'message', 'Handcrafted in Sialkot, Pakistan • Complimentary Worldwide DHL Express Shipping on Orders Over $150',
    'link', '/shop'
  ),
  true
),
(
  'hero',
  'Hero Section',
  jsonb_build_object(
    'headline', 'Heritage Leather Craftsmanship, Exported Worldwide',
    'subheadline', 'Meticulously tailored jackets, coats, and bombers crafted from premium Pakistani top-grain cowhide and supple sheepskin.',
    'ctaText', 'Explore Atelier Collection',
    'ctaLink', '/shop',
    'secondaryCtaText', 'Bespoke Inquiries',
    'secondaryCtaLink', '/contact',
    'badge', 'Sialkot Master Tailors'
  ),
  true
),
(
  'featured_collection',
  'Featured Atelier Collection',
  jsonb_build_object(
    'enabled', true,
    'title', 'The Leather Collection',
    'description', 'Explore timeless leather styles engineered for motorcycle touring, international travel, and enduring luxury.',
    'ctaText', 'Explore All Jackets'
  ),
  true
),
(
  'why_choose_us',
  'Why Choose JAB Leather',
  jsonb_build_object(
    'enabled', true,
    'title', 'Why Connoisseurs Choose JAB Leather',
    'features', jsonb_build_array(
      jsonb_build_object('title', 'Sialkot Atelier Heritage', 'description', 'Century-old leather craftsmanship perfected through generations.'),
      jsonb_build_object('title', 'Top-Grain Raw Materials', 'description', 'Sourced ethically from premium tanneries with full aniline and nappa finishing.'),
      jsonb_build_object('title', 'Global Express Dispatch', 'description', 'Direct DHL / FedEx air courier from atelier to your door in 2-4 business days.')
    )
  ),
  true
),
(
  'workshop_story',
  'Workshop Story',
  jsonb_build_object(
    'enabled', true,
    'title', 'From Raw Hide to Masterpiece',
    'subtitle', 'The Sialkot Heritage',
    'paragraphs', jsonb_build_array(
      'Every JAB Leather jacket begins with hand-selected hides, inspected millimeter by millimeter for tensile strength, grain depth, and suppleness.',
      'Our master cutters cut individual panels by hand to ensure grain direction alignment, followed by double-bonded nylon stitching and YKK antique brass zippers.'
    )
  ),
  true
)
ON CONFLICT (id) DO NOTHING;


-- 6. COLLECTIONS & COLLECTION PRODUCTS TABLES
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  banner_image TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active collections" ON public.collections;
CREATE POLICY "Public can view active collections"
  ON public.collections
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admin full control on collections" ON public.collections;
CREATE POLICY "Admin full control on collections"
  ON public.collections
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE TABLE IF NOT EXISTS public.collection_products (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view collection products" ON public.collection_products;
CREATE POLICY "Public can view collection products"
  ON public.collection_products
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admin full control on collection products" ON public.collection_products;
CREATE POLICY "Admin full control on collection products"
  ON public.collection_products
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed sample collections
INSERT INTO public.collections (id, title, slug, description, image, is_active, sort_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Biker & Moto Classics', 'biker-classics', 'Rugged, armored, and tailored asymmetric leather riding jackets.', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop', true, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Aviator & Shearling Bombers', 'aviator-shearling', 'Heavyweight sheepskin shearling jackets designed for arctic cold and timeless style.', 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop', true, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Urban Minimalist', 'urban-minimalist', 'Clean-lined cafe racers and lightweight nappa leather overshirts.', 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&auto=format&fit=crop', true, 3)
ON CONFLICT (slug) DO NOTHING;


-- 7. PRODUCT REVIEWS TABLE (Verified Purchases & Moderation)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON public.reviews(product_id, status);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews"
  ON public.reviews
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Authenticated customers can insert their own review
DROP POLICY IF EXISTS "Authenticated users can submit reviews" ON public.reviews;
CREATE POLICY "Authenticated users can submit reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- Admins can view and moderate all reviews
DROP POLICY IF EXISTS "Admin full control on reviews" ON public.reviews;
CREATE POLICY "Admin full control on reviews"
  ON public.reviews
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- 8. CONTACT MESSAGES TABLE (Inquiries & Custom Requests)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message VARCHAR(5000) NOT NULL,
  phone VARCHAR(50),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'replied', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can insert contact messages (storefront contact form)
DROP POLICY IF EXISTS "Public can insert contact messages" ON public.contact_messages;
CREATE POLICY "Public can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (
    LENGTH(TRIM(name)) >= 2
    AND LENGTH(TRIM(email)) >= 5
    AND LENGTH(TRIM(message)) >= 10
  );

-- Admin can view and manage all contact messages
DROP POLICY IF EXISTS "Admin full control on contact messages" ON public.contact_messages;
CREATE POLICY "Admin full control on contact messages"
  ON public.contact_messages
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- 9. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  source VARCHAR(100) DEFAULT 'footer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe
DROP POLICY IF EXISTS "Public can insert newsletter subscriptions" ON public.newsletter_subscribers;
CREATE POLICY "Public can insert newsletter subscriptions"
  ON public.newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (
    LENGTH(TRIM(email)) >= 5
    AND status = 'subscribed'
  );

-- Public can unsubscribe their own email
DROP POLICY IF EXISTS "Public can unsubscribe newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public can unsubscribe newsletter"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (status = 'unsubscribed');

-- Admin can view and manage all subscribers
DROP POLICY IF EXISTS "Admin full control on newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin full control on newsletter subscribers"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- 10. UPDATE ORDER CREATION RPC (Connect Dynamic Coupons & Dynamic Shipping Settings)
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

  v_coupon_result JSONB;
  v_shipping_settings JSONB;
  v_free_ship_threshold NUMERIC(12, 2) := 150.00;
  v_standard_shipping_rate NUMERIC(12, 2) := 25.00;

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

  -- 2. Process each item: acquire row lock, verify stock, calculate real catalog prices
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

  -- 3. Load dynamic shipping thresholds from store_settings
  SELECT value INTO v_shipping_settings
  FROM public.store_settings
  WHERE key = 'shipping';

  IF FOUND AND v_shipping_settings IS NOT NULL THEN
    v_free_ship_threshold := COALESCE((v_shipping_settings->>'free_shipping_threshold')::NUMERIC, 150.00);
    v_standard_shipping_rate := COALESCE((v_shipping_settings->>'standard_rate')::NUMERIC, 25.00);
  END IF;

  -- 4. Server-side Coupon Validation via validate_coupon()
  IF v_coupon_code IS NOT NULL THEN
    v_coupon_result := public.validate_coupon(
      v_coupon_code,
      v_calc_subtotal,
      v_user_id,
      v_customer->>'email'
    );

    IF (v_coupon_result->>'valid')::BOOLEAN THEN
      v_calc_discount := (v_coupon_result->>'discountAmount')::NUMERIC;
      IF (v_coupon_result->>'freeShipping')::BOOLEAN THEN
        v_free_ship_threshold := 0.00;
      END IF;

      -- Increment coupon usage count
      UPDATE public.coupons
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE UPPER(code) = UPPER(v_coupon_code);
    ELSE
      -- Coupon invalid: do not apply discount, proceed with standard calculation
      v_coupon_code := NULL;
    END IF;
  END IF;

  -- 5. Server-side Shipping Calculation
  IF v_calc_subtotal >= v_free_ship_threshold THEN
    v_calc_shipping := 0.00;
  ELSE
    v_calc_shipping := v_standard_shipping_rate;
  END IF;

  -- 6. Calculate Final Total
  v_calc_total := GREATEST(0.00, v_calc_subtotal - v_calc_discount + v_calc_shipping + v_calc_tax);

  -- 7. Insert Order Record with initial 'unpaid' status
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

  -- 8. Return created order JSON
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
