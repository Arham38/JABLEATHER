-- ============================================================================
-- JAB LEATHER – BASELINE CATALOG & STORAGE SCHEMA (MIGRATION 000)
-- Description: Creates public.categories, public.products, product-images storage bucket,
--              Row Level Security (RLS) policies, and seeds handcrafted catalog.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  aliases TEXT[] DEFAULT '{}',
  show_in_navbar BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories (slug);
CREATE INDEX IF NOT EXISTS idx_categories_status_sort ON public.categories (status, sort_order);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT UNIQUE,
  short_description TEXT,
  description TEXT,
  gender TEXT DEFAULT 'unisex' CHECK (gender IN ('men', 'women', 'unisex')),
  material TEXT DEFAULT 'Full-Grain Leather',
  leather_type TEXT DEFAULT 'Cowhide',
  lining TEXT DEFAULT 'Quilted Satin / Cotton',
  closure TEXT DEFAULT 'Heavy-Duty Brass YKK Zipper',
  fit TEXT DEFAULT 'Regular Fit',
  care_instructions TEXT DEFAULT 'Professional leather clean only',
  seo JSONB DEFAULT '{}'::jsonb,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  sale_price NUMERIC(10,2) DEFAULT NULL CHECK (sale_price IS NULL OR sale_price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  stock INTEGER NOT NULL DEFAULT 10 CHECK (stock >= 0),
  low_stock_threshold INTEGER DEFAULT 3 CHECK (low_stock_threshold >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock')),
  featured BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  show_on_homepage BOOLEAN DEFAULT true,
  homepage_order INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_ids UUID[] DEFAULT '{}',
  subcategory_ids UUID[] DEFAULT '{}',
  collection_id UUID,
  tags TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]'::jsonb,
  sizes TEXT[] DEFAULT '{"S","M","L","XL","XXL"}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products (gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (featured);

-- 3. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read access to product-images" ON storage.objects;
CREATE POLICY "Public read access to product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload to product-images" ON storage.objects;
CREATE POLICY "Admins can upload to product-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 5. Seed Categories
INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'cat-1',
  'Men''s Jackets',
  'mens-jackets',
  'Handcrafted men''s genuine leather jackets engineered for longevity, durability, and classic style.',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  true,
  1,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  'cat-2',
  'Women''s Jackets',
  'womens-jackets',
  'Sleek, tailored women''s leather jackets made from supple full-grain and vegetable-tanned hides.',
  'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80',
  true,
  2,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000003',
  'cat-3',
  'Biker Jackets',
  'biker-jackets',
  'Iconic asymmetrical zip biker jackets with heavy-gauge antique brass hardware and reinforced panels.',
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80',
  true,
  3,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000004',
  'cat-4',
  'Motorcycle Jackets',
  'motorcycle-jackets',
  'CE-armor compatible heavy cowhide motorcycle riding jackets built for maximum abrasion resistance.',
  'https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=800&q=80',
  true,
  4,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000005',
  'cat-5',
  'Bomber Jackets',
  'bomber-jackets',
  'Timeless MA-1 flight silhouettes crafted in premium drum-dyed goatskin and buttery lambskin.',
  'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
  true,
  5,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000006',
  'cat-6',
  'Aviator Jackets',
  'aviator-jackets',
  'Heritage shearling-lined aviator and flight jackets designed for supreme warmth and rugged distinction.',
  'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80',
  true,
  6,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000007',
  'cat-7',
  'Leather Blazers',
  'leather-blazers',
  'Sartorial leather tailoring suited for formal evenings, executive wardrobes, and smart-casual layers.',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  false,
  7,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000008',
  'cat-8',
  'Western Jackets',
  'western-jackets',
  'Authentic frontier yoke detailing, point collars, and premium distressed calfskin finishes.',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
  false,
  8,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000009',
  'cat-9',
  'Leather Vests',
  'vests',
  'Club-style riding vests, utility vests, and classic button-front leather waistcoats.',
  'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  true,
  9,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000010',
  'cat-10',
  'Bags & Luggage',
  'bags',
  'Full-grain leather weekenders, messenger bags, executive briefcases, and everyday backpacks.',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  true,
  10,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000011',
  'cat-11',
  'Belts & Wallets',
  'belts-wallets',
  'Hand-burnished bridle leather belts and saddle-stitched vegetable-tanned bifold wallets.',
  'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
  true,
  11,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000012',
  'cat-12',
  'Accessories',
  'accessories',
  'Leather driving gloves, watch bands, key fobs, passport travel covers, and leather hats.',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
  true,
  12,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000013',
  'cat-13',
  'Riding Products',
  'riding-products',
  'Professional motorcycle racing gear, reinforced riding jackets, and protective track accessories.',
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  false,
  13,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

INSERT INTO public.categories (id, legacy_id, name, slug, description, image, show_in_navbar, sort_order, status)
VALUES (
  'a1000000-0000-0000-0000-000000000014',
  'cat-14',
  'Cowhide Products',
  'cowhide-products',
  'Natural hair-on cowhide accessories, artisanal clutches, and handcrafted rugs.',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  false,
  14,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  show_in_navbar = EXCLUDED.show_in_navbar,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

-- 6. Seed Handcrafted Leather Products
INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'prod-001',
  'Sialkot Masterpiece Biker Jacket',
  'sialkot-masterpiece-biker-jacket',
  'JAB-MJ-001',
  'a1000000-0000-0000-0000-000000000003',
  349,
  420,
  'USD',
  'men',
  true,
  false,
  true,
  18,
  'active',
  '100% Genuine Full-Grain Cowhide',
  'Top-Grain Drum-Dyed Cowhide (1.2mm)',
  '100% Quilted Satin Silk Interior',
  'Heavy-Duty YKK Antique Brass Asymmetric Zippers',
  'Slim Ergonomic Moto Fit',
  'Specialist leather cleaner only. Avoid direct heat.',
  'Our iconic asymmetric moto jacket, precision-tailored in Sialkot from premium 1.2mm drum-dyed cowhide. Features snap-down lapels, zippered gusset cuffs, and reinforced diamond-stitched shoulders.',
  '{"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL"}',
  '[{"name":"Onyx Black","hex":"#1c1c1c","inStock":true},{"name":"Vintage Cognac","hex":"#8b4513","inStock":true},{"name":"Espresso Brown","hex":"#3a2418","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'prod-002',
  'Atelier Women’s Asymmetric Leather Rider',
  'womens-asymmetric-leather-rider',
  'JAB-WJ-002',
  'a1000000-0000-0000-0000-000000000002',
  320,
  385,
  'USD',
  'women',
  true,
  false,
  true,
  14,
  'active',
  '100% Buttery Italian Lambskin',
  'Vegetable-Tanned Lambskin (0.9mm)',
  'Breathable Polyester Twill',
  'Brushed Silver YKK Front Zip & Cuffs',
  'Cropped Tailored Silhouette',
  'Professional leather dry cleaning only.',
  'An exquisitely draped women’s leather jacket handcrafted from ultra-soft vegetable-tanned lambskin. Flattering cropped waistline, articulated sleeve seams, and signature polished nickel hardware.',
  '{"https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85"}',
  '{"XS","S","M","L","XL"}',
  '[{"name":"Obsidian Black","hex":"#111111","inStock":true},{"name":"Caramel Tan","hex":"#a66a3f","inStock":true},{"name":"Burgundy Wine","hex":"#4a1525","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000003',
  'prod-003',
  'Vintage Flight MA-1 Leather Bomber',
  'vintage-flight-ma1-leather-bomber',
  'JAB-BJ-003',
  'a1000000-0000-0000-0000-000000000005',
  295,
  NULL,
  'USD',
  'men',
  true,
  true,
  true,
  22,
  'active',
  '100% Genuine Goatskin Leather',
  'Full-Grain Distressed Goatskin',
  'Orange Cotton-Poly Heritage Lining',
  'Heavy Center Zip with Wind Flap',
  'Classic Relaxed Bomber',
  'Condition once per season with natural beeswax balm.',
  'Re-engineered military silhouette featuring ribbed storm cuffs, fold-down collar, snap-button waist pockets, and a utility sleeve zipper pocket.',
  '{"https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL"}',
  '[{"name":"Distressed Brown","hex":"#5c3a21","inStock":true},{"name":"Midnight Black","hex":"#1c1c1c","inStock":true},{"name":"Military Olive","hex":"#4a5335","inStock":false}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000004',
  'prod-004',
  'B-3 Heavy Shearling Aviator Flight Jacket',
  'b3-heavy-shearling-aviator-flight-jacket',
  'JAB-AJ-004',
  'a1000000-0000-0000-0000-000000000006',
  549,
  650,
  'USD',
  'men',
  false,
  true,
  true,
  8,
  'active',
  '100% Genuine Sheepskin & Natural Wool',
  'Thick Nappa-Finished Sheepskin Pelts',
  'Heavy Natural Fleece Shearling Interior',
  'Double Buckle Collar & Heavy Brass Zip',
  'Rugged Winter Aviator Cut',
  'Store on wide wooden hanger in ventilated garment bag.',
  'The heavyweight pinnacle of cold-weather outerwear. Constructed from thick sheepskin with dense, natural shearling fleece that insulates down to sub-zero temperatures.',
  '{"https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85"}',
  '{"M","L","XL","XXL"}',
  '[{"name":"Antique Walnut & Cream","hex":"#432918","inStock":true},{"name":"Pitch Black & Charcoal","hex":"#222222","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000005',
  'prod-005',
  'Sartorial Tailored Leather Blazer',
  'sartorial-tailored-leather-blazer',
  'JAB-LB-005',
  'a1000000-0000-0000-0000-000000000007',
  365,
  410,
  'USD',
  'men',
  false,
  false,
  false,
  11,
  'active',
  '100% Full-Grain Calfskin',
  'Semi-Aniline Glazed Calfskin (0.8mm)',
  'Cupro Rayon Jacquard',
  'Two-Button Horn Closure with Notched Lapel',
  'Modern Tailored Fit',
  'Professional leather valet service only.',
  'Sharp, elegant two-button leather blazer designed with structured shoulders, welt chest pocket, dual rear vents, and refined flap pockets.',
  '{"https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85"}',
  '{"38R","40R","42R","44R","46R"}',
  '[{"name":"Tuxedo Black","hex":"#141414","inStock":true},{"name":"Deep Espresso","hex":"#322015","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000006',
  'prod-006',
  'Frontier Western Yoke Leather Jacket',
  'frontier-western-yoke-leather-jacket',
  'JAB-WJ-006',
  'a1000000-0000-0000-0000-000000000008',
  315,
  NULL,
  'USD',
  'men',
  false,
  true,
  false,
  15,
  'active',
  '100% Distressed Waxed Cowhide',
  'Pull-Up Waxed Nubuck Cowhide',
  '100% Checked Cotton Flannel',
  'Antique Brass Snap Button Front',
  'Straight Western Cut',
  'Apply leather wax to restore distressed pull-up patina.',
  'Heritage Western design featuring peaked shoulder yokes, dual snap flap chest pockets, and durable side hand-warmer pockets.',
  '{"https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL"}',
  '[{"name":"Tobacco Tan","hex":"#8a502c","inStock":true},{"name":"Weathered Saddle","hex":"#5b391e","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000007',
  'prod-007',
  'Highway Patrol CE Armored Moto Jacket',
  'highway-patrol-ce-armored-moto-jacket',
  'JAB-MJ-007',
  'a1000000-0000-0000-0000-000000000004',
  385,
  450,
  'USD',
  'men',
  true,
  false,
  true,
  16,
  'active',
  '1.4mm Heavyweight Race-Grade Cowhide',
  'Milled Full-Grain Cowhide with Hydrophobic Coating',
  'Removable Thermal Vest Liner & Mesh Underlayer',
  'Reinforced Safety Seams & Dual Slider Zips',
  'Rider Posture Pre-Curved Sleeves',
  'Wipe clean with damp cloth after dusty highway rides.',
  'Engineered for dedicated motorcycle riders. Includes removable CE Level-2 shoulder, elbow, and spine armor pockets with zippered intake vents on biceps and exhaust vents on back.',
  '{"https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL","3XL"}',
  '[{"name":"Stealth Matte Black","hex":"#1e1e1e","inStock":true},{"name":"Dark Rust Brown","hex":"#4c2e1f","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000008',
  'prod-008',
  'Cadence Women’s Clean Collarless Leather Jacket',
  'cadence-womens-clean-collarless-leather-jacket',
  'JAB-WJ-008',
  'a1000000-0000-0000-0000-000000000002',
  295,
  340,
  'USD',
  'women',
  false,
  true,
  true,
  12,
  'active',
  '100% Fine Grain Italian Lambskin',
  'Aniline Lambskin (0.8mm)',
  'Smooth Poly-Silk',
  'Concealed Center Front Zip',
  'Fitted Architectural Silhouette',
  'Dry clean by leather specialist.',
  'Clean, modern, and sculptural. Free from excessive hardware, highlighting the natural drape and luxurious grain of soft lambskin.',
  '{"https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85"}',
  '{"XS","S","M","L","XL"}',
  '[{"name":"Cream Sand","hex":"#e3dac9","inStock":true},{"name":"Deep Onyx","hex":"#161616","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000009',
  'prod-009',
  'Anarchy Club Leather Riding Vest',
  'anarchy-club-leather-riding-vest',
  'JAB-VT-009',
  'a1000000-0000-0000-0000-000000000009',
  185,
  220,
  'USD',
  'unisex',
  true,
  false,
  true,
  25,
  'active',
  '100% Heavy Milled Naked Cowhide (1.3mm)',
  'Top-Grain Drum-Dyed Naked Cowhide',
  'Heavy Satin with Concealed Carry Interior Pockets',
  'Hidden Metal Snap Buttons & Heavy YKK Zip',
  'Regular Riding Vest Cut (Seamless Single Back Panel for Patches)',
  'Treat with leather oil once annually.',
  'The preferred club-cut vest with single back panel ideal for embroidery or patches. Fitted with dual quick-access interior pockets and mandarin collar.',
  '{"https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL","3XL","4XL"}',
  '[{"name":"Pure Matte Black","hex":"#181818","inStock":true},{"name":"Distressed Brown","hex":"#432918","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000010',
  'prod-010',
  'Grand Voyageur Full-Grain Leather Duffel',
  'grand-voyageur-full-grain-leather-duffel',
  'JAB-BG-010',
  'a1000000-0000-0000-0000-000000000010',
  275,
  340,
  'USD',
  'unisex',
  true,
  false,
  true,
  20,
  'active',
  '100% Vegetable-Tanned Full-Grain Leather',
  'Pull-up Italian Veg-Tan Cowhide (1.8mm)',
  'Durable Water-Repellent Cotton Canvas',
  'Double Brass Zipper with Padlock Loops',
  '52 Liters Travel Capacity (Carry-On Approved)',
  'Condition with beeswax cream every 6 months.',
  'An heirloom weekender bag built to endure decades of global transit. Includes reinforced leather handles, detachable padded shoulder strap, and separate ventilated shoe compartment.',
  '{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85"}',
  '{"Standard 52L"}',
  '[{"name":"Saddle Tan","hex":"#a66a3f","inStock":true},{"name":"Dark Chestnut","hex":"#3e271a","inStock":true},{"name":"Midnight Onyx","hex":"#191919","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000011',
  'prod-011',
  'Diplomat English Bridle Leather Briefcase',
  'diplomat-english-bridle-leather-briefcase',
  'JAB-BG-011',
  'a1000000-0000-0000-0000-000000000010',
  295,
  360,
  'USD',
  'unisex',
  false,
  true,
  true,
  9,
  'active',
  'Full-Grain English Bridle Hide',
  'Traditional Oak-Bark Tanned Bridle Leather',
  'Pigskin Suede Interior',
  'Solid Cast Brass Quick-Release Buckles & Key Lock',
  'Accommodates up to 16" MacBook Pro and Legal Documents',
  'Wipe with damp cloth and treat with saddle soap.',
  'Designed for executives, attorneys, and professionals. Features double gussets, organizer panel for pens and passport, and hand-burnished edges.',
  '{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=85"}',
  '{"One Size (16\" x 12\" x 5\")"}',
  '[{"name":"Vintage Havana","hex":"#482a17","inStock":true},{"name":"London Tan","hex":"#9d633b","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000012',
  'prod-012',
  'Artisan Solid Brass Bridle Leather Belt',
  'artisan-solid-brass-bridle-leather-belt',
  'JAB-BL-012',
  'a1000000-0000-0000-0000-000000000011',
  65,
  85,
  'USD',
  'unisex',
  true,
  false,
  true,
  45,
  'active',
  '100% Solid Full-Grain Harness Leather (9-10 oz)',
  'Vegetable-Tanned Harness Leather',
  'Unlined Natural Flesh Side (Smoothed & Beveled)',
  'Solid Brass Roller Buckle with Chicago Screws',
  '1.5" Width (Standard Casual & Denim Loops)',
  'Zero maintenance required. Patinas richer with every wear.',
  'Cut from a single continuous strip of 4mm thick harness leather. Hand-beveled edges burnished with organic beeswax. Buckle is easily interchangeable via Chicago screws.',
  '{"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85"}',
  '{"30","32","34","36","38","40","42"}',
  '[{"name":"Bourbon Brown","hex":"#63381a","inStock":true},{"name":"Pitch Black","hex":"#181818","inStock":true},{"name":"Natural Tan","hex":"#b37e50","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000013',
  'prod-013',
  'Saddle-Stitched Slim Bifold Leather Wallet',
  'saddle-stitched-slim-bifold-leather-wallet',
  'JAB-WL-013',
  'a1000000-0000-0000-0000-000000000011',
  55,
  70,
  'USD',
  'unisex',
  true,
  false,
  true,
  50,
  'active',
  '100% Buttero Vegetable-Tanned Leather',
  'Italian Veg-Tan Calfskin (3-4 oz)',
  'Full Leather Construction',
  'Fold-Over Pocket Configuration',
  'Holds 8-12 Cards + Full Length Cash Bill Compartment',
  'Keep dry. Buff with microfiber cloth.',
  'Hand-sewn with waxed polycord thread using traditional double-needle saddle stitching that will never unravel. Edge coated and heat creased by hand.',
  '{"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85"}',
  '{"Standard Slim"}',
  '[{"name":"Saddle Tan","hex":"#a66a3f","inStock":true},{"name":"Espresso","hex":"#3b2518","inStock":true},{"name":"Navy Blue","hex":"#1d2738","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000014',
  'prod-014',
  'Peaky Heritage 8-Panel Leather Newsboy Cap',
  'peaky-heritage-8-panel-leather-newsboy-cap',
  'JAB-HT-014',
  'a1000000-0000-0000-0000-000000000012',
  75,
  95,
  'USD',
  'unisex',
  false,
  true,
  false,
  20,
  'active',
  '100% Genuine Distressed Lambskin',
  'Vintage Drum-Dyed Lambskin',
  '100% Breathable Cotton Herringbone',
  'Snap Peak Bill with Leather Sweatband',
  'Classic 8-Panel Bakerboy Profile',
  'Gently wipe with soft sponge.',
  'Timeless vintage silhouette handcrafted with eight triangular leather segments and a centered leather-covered top button. Comfortably padded interior sweatband.',
  '{"https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1000&q=85"}',
  '{"M (57cm)","L (59cm)","XL (61cm)"}',
  '[{"name":"Vintage Dark Chocolate","hex":"#372418","inStock":true},{"name":"Onyx Black","hex":"#161616","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000015',
  'prod-015',
  'Apex Touchscreen Carbon-Knuckle Moto Gloves',
  'apex-touchscreen-carbon-knuckle-moto-gloves',
  'JAB-GL-015',
  'a1000000-0000-0000-0000-000000000013',
  85,
  110,
  'USD',
  'unisex',
  true,
  false,
  true,
  30,
  'active',
  'Supple Goatskin & Kangaroo Palm',
  'High-Tensile Abrasion Resistant Leather',
  'Unlined Palm for Sensitive Grip Feedback',
  'Dual Velcro Wrist Cinch',
  'Pre-Curved Racing Ergonomics with Smart Touch Index & Thumb',
  'Air dry away from heat sources.',
  'Professional motorcycle riding gloves equipped with molded carbon-fiber knuckle shields, ventilated finger intakes, and conductive leather fingertips for GPS/smartphone use.',
  '{"https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL"}',
  '[{"name":"Stealth Black","hex":"#181818","inStock":true},{"name":"Black & Vintage Tan","hex":"#583823","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000016',
  'prod-016',
  'Artisan Hair-On Cowhide & Leather Tote',
  'artisan-hair-on-cowhide-and-leather-tote',
  'JAB-CH-016',
  'a1000000-0000-0000-0000-000000000014',
  195,
  240,
  'USD',
  'women',
  false,
  true,
  true,
  7,
  'active',
  'Natural Hair-On Cowhide & Saddle Leather',
  'Unbleached Organic Patterned Cowhide',
  'Heavyweight Sand Canvas with Zippered Security Pocket',
  'Magnetic Snap & Reinforced Straps',
  'Generous 18" Wide Daily Carry',
  'Gently brush hair in natural growth direction.',
  'Every single tote is 100% unique in pattern and color distribution. Accented with durable vegetable-tanned straps and solid brass rivets.',
  '{"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85"}',
  '{"Standard Tote"}',
  '[{"name":"Natural Tri-Color Cowhide","hex":"#7a5a40","inStock":true},{"name":"Black & White Brindle","hex":"#333333","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000017',
  'prod-017',
  'Speedway Vintage Cafe Racer Leather Jacket',
  'speedway-vintage-cafe-racer-leather-jacket',
  'JAB-MJ-017',
  'a1000000-0000-0000-0000-000000000001',
  330,
  395,
  'USD',
  'men',
  true,
  false,
  true,
  15,
  'active',
  '100% Top-Grain Waxed Buffalo Hide',
  'Oiled & Waxed Buffalo Hide (1.2mm)',
  'Tartan Plaid Brushed Cotton',
  'Snap Tab Mandarin Collar & Brass Center Zip',
  'Trim Cafe Racer Fit',
  'Re-wax occasionally with Otter Wax or natural tallow.',
  'Clean minimalist cafe racer lines inspired by 1960s British Isle racers. Horizontal chest pockets, gusseted shoulder action back for easy reach, and zipped cuffs.',
  '{"https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL"}',
  '[{"name":"Burnt Umber","hex":"#4e2d1d","inStock":true},{"name":"Cafe Black","hex":"#1a1a1a","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000018',
  'prod-018',
  'Sovereign Women’s Long Shearling Trench',
  'sovereign-womens-long-shearling-trench',
  'JAB-WJ-018',
  'a1000000-0000-0000-0000-000000000002',
  580,
  690,
  'USD',
  'women',
  false,
  true,
  true,
  6,
  'active',
  '100% Merinillo Sheepskin Shearling',
  'Silky Suede Finish with Plush Merinillo Fur',
  'Self-Lined Full Sheepskin Wool',
  'Double Breasted Button with Matching Leather Tie Belt',
  'Graceful Knee-Length Silhouette',
  'Specialist fur and shearling storage during summer.',
  'A striking statement piece offering supreme luxury and warmth. Styled with oversized shearling lapels, deep slant pockets, and a tailored wrap belt.',
  '{"https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL"}',
  '[{"name":"Oatmeal & Ivory","hex":"#d9cdb8","inStock":true},{"name":"Dark Chestnut & Espresso","hex":"#3d2516","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000019',
  'prod-019',
  'Nomad Roll-Top Heritage Leather Backpack',
  'nomad-roll-top-heritage-leather-backpack',
  'JAB-BG-019',
  'a1000000-0000-0000-0000-000000000010',
  245,
  295,
  'USD',
  'unisex',
  true,
  false,
  false,
  18,
  'active',
  '100% Full-Grain Waxed Leather',
  'Veg-Tanned Saddle Leather',
  'Olive Green Heavy Canvas with Padded 15.6" Laptop Sleeve',
  'Solid Brass Roller Buckles & Roll-Top Enclosure',
  '28L Expandable Volume',
  'Condition twice annually.',
  'Built for urban commuters and intrepid travelers. Features ergonomic padded leather shoulder straps, side water bottle pocket, and hidden anti-theft passport pocket on back.',
  '{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85"}',
  '{"One Size (28L)"}',
  '[{"name":"Vintage Oak","hex":"#6d4327","inStock":true},{"name":"Slate Black","hex":"#1c1c1c","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000020',
  'prod-020',
  'Globe-Trotter Leather Travel & Passport Folio',
  'globetrotter-leather-travel-and-passport-folio',
  'JAB-WL-020',
  'a1000000-0000-0000-0000-000000000011',
  68,
  85,
  'USD',
  'unisex',
  false,
  true,
  false,
  35,
  'active',
  '100% Italian Vachetta Leather',
  'Full-Grain Vegetable-Tanned Vachetta',
  'Natural Burnished Leather Inside',
  'Secure Leather Wrap-Around Strap',
  'Holds 2 Passports, Boarding Passes, 6 Cards & Pen',
  'Wipes clean with soft cloth.',
  'The definitive traveler’s companion. Fits standard international passports, credit cards, foreign currency, and a travel pen in one slim, organized folio.',
  '{"https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85"}',
  '{"Travel Folio"}',
  '[{"name":"Caramel Vachetta","hex":"#a66a3f","inStock":true},{"name":"Dark Mocha","hex":"#341f14","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000021',
  'prod-021',
  'Vanguard Velvet-Soft Suede Bomber Jacket',
  'vanguard-velvet-soft-suede-bomber-jacket',
  'JAB-BJ-021',
  'a1000000-0000-0000-0000-000000000005',
  310,
  375,
  'USD',
  'men',
  false,
  true,
  true,
  14,
  'active',
  '100% Genuine Goat Suede',
  'Silky Fine-Nap Goat Suede (0.8mm)',
  'Lightweight Satin Lining',
  'Polished Gunmetal Center Zip',
  'Tailored Athletic Bomber Fit with Elasticated Hem & Cuffs',
  'Protect with suede water-repellent spray prior to first wear.',
  'Impeccably tailored from premium split goat suede that feels exceptionally soft. Pair effortlessly with cashmere knits or tailored trousers.',
  '{"https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85"}',
  '{"S","M","L","XL","XXL"}',
  '[{"name":"Desert Sand Suede","hex":"#c2a884","inStock":true},{"name":"Chocolate Suede","hex":"#4e3321","inStock":true},{"name":"Navy Suede","hex":"#1f2a3a","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

INSERT INTO public.products (
  id, legacy_id, name, slug, sku,
  category_id, price, sale_price, currency,
  gender, best_seller, new_arrival, featured,
  stock, status, material, leather_type, lining,
  closure, fit, care_instructions, description,
  images, sizes, colors
) VALUES (
  'b1000000-0000-0000-0000-000000000022',
  'prod-022',
  'Bespoke Private-Label Sample Leather Jacket',
  'bespoke-private-label-sample-leather-jacket',
  'JAB-OEM-022',
  'a1000000-0000-0000-0000-000000000003',
  399,
  NULL,
  'USD',
  'unisex',
  false,
  false,
  true,
  99,
  'active',
  'Choice of Cowhide, Buffalo, Lambskin or Goatskin',
  'Custom Tanned & Dyed to Client Pantone / Specification',
  'Custom Embossed Silk, Cotton, or Technical Membrane',
  'Branded Custom Metal Hardware & Custom Woven Labels',
  'Made to Custom Tech-Pack or Made-to-Measure Specifications',
  'Instructions tailored to selected leather batch.',
  'Sample prototyping jacket for international apparel brands, motorcycle clubs, and retail chains. Full OEM customization including custom embossing, hardware engraving, and tailored patterns.',
  '{"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85","https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=85"}',
  '{"Custom Sizing Available","S","M","L","XL","XXL"}',
  '[{"name":"Custom Pantone Selection","hex":"#1c1c1c","inStock":true}]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  gender = EXCLUDED.gender,
  best_seller = EXCLUDED.best_seller,
  new_arrival = EXCLUDED.new_arrival,
  featured = EXCLUDED.featured,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status,
  material = EXCLUDED.material,
  leather_type = EXCLUDED.leather_type,
  lining = EXCLUDED.lining,
  closure = EXCLUDED.closure,
  fit = EXCLUDED.fit,
  care_instructions = EXCLUDED.care_instructions,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

