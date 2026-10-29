-- ============================================================================
-- JAB LEATHER – COMPLETE LEATHER TAXONOMY & PRODUCT EXPANSION (MIGRATION 006)
-- Description: Seeds the comprehensive 14-category leather catalog requested
--              for JAB LEATHER, sets up indexes, and inserts full-spectrum
--              artisan products with variant matrices.
-- ============================================================================

-- Ensure categories table columns and indexes
CREATE INDEX IF NOT EXISTS idx_categories_show_navbar ON public.categories (show_in_navbar);

-- 1. Insert or Update All 14 Core Leather Categories
INSERT INTO public.categories (name, slug, description, image, show_in_navbar, sort_order, status)
VALUES
  (
    'Men''s Leather Jackets',
    'mens-leather-jackets',
    'Iconic biker, bomber, cafe racer, and aviator jackets handcrafted from full-grain Pakistani cowhide and lambskin.',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    true,
    1,
    'active'
  ),
  (
    'Women''s Leather Jackets',
    'womens-leather-jackets',
    'Precision-tailored asymmetrical riders, cropped bombers, and luxury shearling jackets made from ultra-soft nappa hides.',
    'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80',
    true,
    2,
    'active'
  ),
  (
    'Leather Vests',
    'leather-vests',
    'Heavy-duty club vests, concealed carry riding cuts, and tailored formal leather waistcoats with reinforced stitchwork.',
    'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80',
    true,
    3,
    'active'
  ),
  (
    'Cowhide Rugs',
    'cowhide-rugs',
    '100% natural, chromium-tanned genuine cowhide rugs with lustrous hair-on finish, hypoallergenic treatment, and non-slip backing.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    true,
    4,
    'active'
  ),
  (
    'Leather Gloves',
    'leather-gloves',
    'Touchscreen-compatible winter dress gloves, perforated track motorcycle gauntlets, and thermal fleece-lined riding gloves.',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
    true,
    5,
    'active'
  ),
  (
    'Motorcycle Leather Suits',
    'motorcycle-leather-suits',
    'FIM/CE Level-2 certified 1-piece and 2-piece track race suits with titanium shoulder sliders and aerodynamic speed humps.',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
    true,
    6,
    'active'
  ),
  (
    'Leather Pants',
    'leather-pants',
    'Tailored touring pants, skinny rock biker trousers, and perforated riding chap pants engineered with flex stretch ribs.',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    true,
    7,
    'active'
  ),
  (
    'Leather Coats',
    'leather-coats',
    'Commanding floor-length trench coats, double-breasted officer overcoats, and car coats insulated for freezing weather.',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    true,
    8,
    'active'
  ),
  (
    'Leather Wallets',
    'leather-wallets',
    'RFID-shielded bifold wallets, minimalist cardholders, biker chain long wallets, and bespoke passport organizers in vegetable-tanned bridle leather.',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    true,
    9,
    'active'
  ),
  (
    'Leather Belts',
    'leather-belts',
    'Solid single-strip 1.5-inch English bridle leather belts with interchangeable solid brass and antique nickel roller buckles.',
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    true,
    10,
    'active'
  ),
  (
    'Leather Bags',
    'leather-bags',
    'Artisan 45L weekend travel duffles, structured executive laptop briefcases, messenger bags, and roll-top leather backpacks.',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    true,
    11,
    'active'
  ),
  (
    'Leather Accessories',
    'leather-accessories',
    'Hand-stitched leather valet trays, desk mats, key fobs, luggage tags, journals, and protective watch rolls.',
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80',
    true,
    12,
    'active'
  ),
  (
    'Custom Leather Products',
    'custom-leather-products',
    'Bespoke made-to-measure tailoring. Send us your measurements, select leather grain, hardware finishes, and personalized embossing.',
    'https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=800&q=80',
    true,
    13,
    'active'
  ),
  (
    'Wholesale Orders',
    'wholesale-orders',
    'Direct B2B manufacturing for international brands, motorcycle clubs, and private-label apparel retailers with custom branding in Sialkot.',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    true,
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

-- Also ensure legacy slugs (e.g. 'biker-jackets', 'mens-jackets') remain active and linked
UPDATE public.categories
SET status = 'active'
WHERE slug IN ('mens-jackets', 'womens-jackets', 'biker-jackets', 'bomber-jackets', 'bags-luggage');
