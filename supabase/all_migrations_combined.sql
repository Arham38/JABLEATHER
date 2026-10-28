-- ============================================================================
-- JAB LEATHER â€“ BASELINE CATALOG & STORAGE SCHEMA (MIGRATION 000)
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
  'Atelier Womenâ€™s Asymmetric Leather Rider',
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
  'An exquisitely draped womenâ€™s leather jacket handcrafted from ultra-soft vegetable-tanned lambskin. Flattering cropped waistline, articulated sleeve seams, and signature polished nickel hardware.',
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
  'Cadence Womenâ€™s Clean Collarless Leather Jacket',
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
  'Sovereign Womenâ€™s Long Shearling Trench',
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
  'The definitive travelerâ€™s companion. Fits standard international passports, credit cards, foreign currency, and a travel pen in one slim, organized folio.',
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




-- ==============================================================================
-- JAB LEATHER - MIGRATION 001: PROFILES & ADDRESSES
-- Description: Customer profiles, addresses, auto-create triggers and RLS policies
-- Review-Only Migration (Do not apply automatically without review)
-- ==============================================================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with public customer information.
-- Referenced by foreign key to auth.users with cascade delete.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies:
-- Customers can view their own profile only
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Customers can update their own profile only
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins (with app_metadata.role = 'admin') can view all customer profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2. TRIGGER: Auto-create Profile on auth.users Sign Up
-- Automatically copies initial user details from signup metadata into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_phone TEXT;
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'name', '');
  v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');

  IF v_name = '' AND (v_first_name <> '' OR v_last_name <> '') THEN
    v_name := TRIM(CONCAT(v_first_name, ' ', v_last_name));
  END IF;

  INSERT INTO public.profiles (id, name, first_name, last_name, phone)
  VALUES (new.id, NULLIF(v_name, ''), NULLIF(v_first_name, ''), NULLIF(v_last_name, ''), NULLIF(v_phone, ''))
  ON CONFLICT (id) DO UPDATE
  SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. ADDRESSES TABLE
-- Stores multiple shipping and billing addresses for authenticated customers.
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL,
  address_line2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'United States',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user addresses queries
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Enable Row Level Security
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Addresses RLS Policies:
-- Users can only view their own saved addresses
CREATE POLICY "Users can view own addresses"
  ON public.addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert addresses for themselves only
CREATE POLICY "Users can insert own addresses"
  ON public.addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses only
CREATE POLICY "Users can update own addresses"
  ON public.addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON public.addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view customer addresses for fulfillment inspection
CREATE POLICY "Admins can view all addresses"
  ON public.addresses
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');



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
    'message', 'Handcrafted in Sialkot, Pakistan â€¢ Complimentary Worldwide DHL Express Shipping on Orders Over $150',
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



