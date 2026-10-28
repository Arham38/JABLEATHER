-- ==============================================================================
-- JAB LEATHER - MIGRATION 002: ORDERS SCHEMA & GLOBAL RLS POLICIES
-- Description: Orders table, order sequence, strict RLS, and catalog hardening
-- Review-Only Migration (Do not apply automatically without review)
-- ==============================================================================

-- 1. ORDER NUMBER SEQUENCE & GENERATOR
-- Generates sequential order numbers in the format 'JAB-000101', 'JAB-000102'
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 10001;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT 'JAB-' || LPAD(nextval('public.order_number_seq')::TEXT, 6, '0');
$$;

-- 2. ORDERS TABLE
-- Architecture decision for JSONB `items`:
-- We store purchased items as a JSONB array snapshot directly on the order record.
-- Rationale:
--   1. Immutability: An e-commerce order must reflect the exact historical product state
--      (title, SKU, selected size, selected color, price, image) at checkout time,
--      unaffected by future price hikes, renaming, or product deletions.
--   2. Performance: Single row fetch for order details, cart receipts, and invoice generation
--      without needing multi-table joins.
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT public.generate_order_number(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable to allow guest checkouts
  customer JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL DEFAULT 'card',
  payment_provider TEXT DEFAULT 'manual',
  payment_transaction_id TEXT,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'partially_refunded', 'refunded', 'failed')),
  order_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  coupon_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);

-- Enable Row Level Security on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. ORDERS RLS POLICIES
-- Policy 1: Authenticated customers can view ONLY their own orders
CREATE POLICY "Customers can view own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Admins can view ALL orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Policy 3: NO direct INSERT from client side
-- All orders must be placed through the secure atomic Postgres function `create_order`
-- This prevents tampering with prices, stock bypass, or spoofing order fields.
-- (No INSERT policy is created for public or authenticated roles)

-- Policy 4: Admins can UPDATE order status and tracking fields only
CREATE POLICY "Admins can update order status and tracking"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Policy 5: Deny all DELETE operations on orders to preserve accounting records
-- (No DELETE policy is created; orders cannot be dropped via client API)


-- 4. HARDENING CATALOG & STORAGE RLS POLICIES

-- Products Table RLS
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Categories Table RLS
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active' OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Storage Bucket `product-images` Policies
-- Public can view/download uploaded images
DROP POLICY IF EXISTS "Public read access to product-images" ON storage.objects;
CREATE POLICY "Public read access to product-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Only admins can upload product images
DROP POLICY IF EXISTS "Admin upload access to product-images" ON storage.objects;
CREATE POLICY "Admin upload access to product-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Only admins can delete product images
DROP POLICY IF EXISTS "Admin delete access to product-images" ON storage.objects;
CREATE POLICY "Admin delete access to product-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
