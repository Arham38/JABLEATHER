# JAB LEATHER – Local & Staging Development Setup Guide

This guide details how to configure a development or staging Supabase project, apply the SQL migrations in order, create an administrative user with secure `app_metadata` privileges, verify Row Level Security (RLS), and seed test catalog data for JAB LEATHER.

---

## 1. Prerequisites & Environment Setup

### 1.1 Create a Dev/Staging Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a dedicated project (e.g., `jab-leather-staging`).
2. Navigate to **Project Settings** > **API**:
   - Copy **Project URL** (e.g., `https://<project-ref>.supabase.co`).
   - Copy **Project API Keys**:
     - `anon` / `public` key (safe for browser and backend queries).
     - `service_role` / `secret` key (kept strictly on backend; never expose to frontend).

### 1.2 Configure Local Environment Files
Ensure your `.env` files follow the templates in `.env.example`:

**Server Configuration (`server/.env`)**:
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<32-char-random-string>
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**Client Configuration (`client/.env.local`)**:
```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=http://localhost:5000/api
```

> [!CAUTION]
> Never put `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` in `client/.env.local`. Vite bundles variables prefixed with `VITE_` into client-side JavaScript, which would expose full administrative database access to the public.

---

## 2. Database Migrations (Apply in Order)

Open the **SQL Editor** in your Supabase Dashboard (or use Supabase CLI `supabase db push` if linked). Execute the migrations sequentially:

### Step 1: Customer Profiles & Addresses
Run the contents of:
[`supabase/migrations/20261028000001_profiles_and_addresses.sql`](../supabase/migrations/20261028000001_profiles_and_addresses.sql)

**What this establishes**:
- Creates `public.profiles` table with foreign key to `auth.users(id) ON DELETE CASCADE`.
- Sets up `handle_new_user()` trigger to automatically create a profile record when a customer registers via Supabase Auth.
- Creates `public.addresses` table for multi-address management.
- Enables Row Level Security (RLS): customers can only read/write their own profile and address records (`auth.uid() = id` / `auth.uid() = user_id`).
- Grants administrative access (`app_metadata->>'role' = 'admin'`) to review all profiles.

---

### Step 2: Orders Schema, Sequence & RLS Hardening
Run the contents of:
[`supabase/migrations/20261028000002_orders_and_rls.sql`](../supabase/migrations/20261028000002_orders_and_rls.sql)

**What this establishes**:
- Creates sequence `public.order_number_seq` and helper function `public.generate_order_number()` yielding identifiers like `JAB-000101`.
- Creates `public.orders` table with JSONB snapshots for `customer`, `shipping_address`, and `items`.
- Constrains `order_status` (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) and `payment_status` (`unpaid`, `paid`, `refunded`, `failed`).
- Strict RLS Policies:
  - **Customers**: Can `SELECT` only their own orders (`auth.uid() = user_id`).
  - **Direct Client Writes**: `INSERT` and `UPDATE` from standard client sessions are explicitly disallowed (denied by default without policies).
  - **Admins**: Can `SELECT` all orders and `UPDATE` order status and tracking fields only.
- Hardens existing `products`, `categories`, and `product-images` storage bucket policies (public read-only; admin-only mutate).

---

### Step 3: Atomic Order Creation & Guest Lookup Functions
Run the contents of:
[`supabase/migrations/20261028000003_order_functions.sql`](../supabase/migrations/20261028000003_order_functions.sql)

**What this establishes**:
- **`public.create_order(payload JSONB)`**: A `SECURITY DEFINER` function with strict search path that:
  1. Acquires row locks (`SELECT ... FOR UPDATE`) on catalog product rows to prevent overselling or race conditions.
  2. Recomputes unit prices, coupon discounts, and shipping costs on the database server (ignoring client-tampered totals).
  3. Atomically decrements product inventory.
  4. Inserts the immutable order record and returns the complete order JSON.
- **`public.get_guest_order(p_order_number TEXT, p_email TEXT)`**: Safe RPC allowing guest shoppers to look up their order confirmation without exposing arbitrary orders to the public.

---

## 3. Creating an Admin User

### 3.1 Why `app_metadata`?
In Supabase Auth:
- `user_metadata` can be written or updated by the customer during `signUp()` or `updateUser()`. **Never use `user_metadata` for roles.**
- `app_metadata` can only be modified with the `service_role` key or directly via SQL in the database.

### 3.2 Step-by-Step Admin Account Creation
1. Go to **Authentication** > **Users** in the Supabase Dashboard.
2. Click **Add User** > **Create User**.
3. Enter the administrator's email (e.g., `admin@jableather.com`) and a strong temporary password.
4. Auto-confirm the user by checking "Auto Confirm User".
5. Open the **SQL Editor** in the Supabase Dashboard and run:

```sql
-- Grant admin role to your administrative user
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@jableather.com';

-- Verify the admin role assignment
SELECT id, email, raw_app_meta_data->>'role' AS role, created_at
FROM auth.users
WHERE email = 'admin@jableather.com';
```

---

## 4. Seeding Test Catalog Data

To test the storefront, cart, and checkout engine, seed a category and a couple of test products. Run this in the **SQL Editor**:

```sql
-- 1. Create a test category
INSERT INTO public.categories (id, name, slug, description, sort_order, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Men''s Leather Jackets',
  'mens-leather-jackets',
  'Handcrafted genuine leather jackets crafted in Sialkot, Pakistan.',
  1,
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create sample leather products
INSERT INTO public.products (
  id,
  name,
  slug,
  sku,
  short_description,
  description,
  category_id,
  price,
  sale_price,
  currency,
  stock,
  low_stock_threshold,
  status,
  featured,
  best_seller,
  leather_type,
  sizes,
  colors,
  images
)
VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'Heritage Biker Jacket',
  'heritage-biker-jacket',
  'JAB-MBJ-001',
  'Top-grain Pakistani cowhide with antique brass hardware.',
  'Meticulously crafted in our Sialkot workshop using vegetable-tanned cowhide, quilted lining, and reinforced double-needle stitching.',
  'a0000000-0000-0000-0000-000000000001',
  295.00,
  NULL,
  'USD',
  15,
  3,
  'active',
  true,
  true,
  'Cowhide',
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black", "Vintage Brown"]'::jsonb,
  '["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop"]'::jsonb
),
(
  'b0000000-0000-0000-0000-000000000002',
  'Aviator Shearling Bomber',
  'aviator-shearling-bomber',
  'JAB-MAB-002',
  'Heavyweight sheepskin with plush natural wool shearling collar.',
  'Classic WWII inspired pilot jacket crafted from supple sheepskin nappa leather with full thermal shearling lining.',
  'a0000000-0000-0000-0000-000000000001',
  450.00,
  395.00,
  'USD',
  8,
  2,
  'active',
  true,
  false,
  'Sheepskin',
  '["M", "L", "XL"]'::jsonb,
  '["Dark Brown"]'::jsonb,
  '["https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
```

---

## 5. Verification Checklist

### 5.1 Test Customer Signup & Profile
1. Start the client: `cd client && npm run dev`.
2. Visit `http://localhost:5173/account/signup` and register a customer account (e.g., `customer@example.com`).
3. Visit `http://localhost:5173/account/profile` and update the first name, last name, and phone.
4. Visit `http://localhost:5173/account/addresses` and add a shipping address.
5. In Supabase Dashboard, verify a row exists in `public.profiles` and `public.addresses` matching `auth.uid()`.

### 5.2 Test Order Placement & Atomic Stock Decrement
1. Add the "Heritage Biker Jacket" to cart.
2. Proceed to `/checkout`.
3. Fill out shipping details (or verify pre-filled profile details) and submit order.
4. Verify redirection to `/checkout/success?orderId=JAB-XXXXXX`.
5. Check `public.orders` in Supabase:
   - Status is `pending`, payment status is `unpaid` (sandbox mode).
   - Items snapshot matches the purchased item.
6. Check `public.products`:
   - Stock for "Heritage Biker Jacket" decremented by the purchased quantity.

### 5.3 Test RLS Isolation
1. As the customer, navigate to `/account/orders`: verify the placed order appears in the list.
2. In browser console, attempt to query another user's order:
   ```javascript
   const { data } = await supabase.from('orders').select('*');
   console.log(data); // Only returns rows belonging to the authenticated customer
   ```
3. Attempt to directly insert an order from client console:
   ```javascript
   const { error } = await supabase.from('orders').insert({ total: 10 });
   console.log(error); // RLS violation error
   ```

### 5.4 Test Admin Panel
1. Log in with `admin@jableather.com` at `http://localhost:5173/admin/login`.
2. Verify access to `/admin` dashboard:
   - Operational metrics reflect active products, total categories, and recent orders.
3. Navigate to `/admin/orders`:
   - View placed orders, inspect line items, and change status (e.g., to `processing` or `shipped`).
4. Attempt to access `/admin` while logged in as a normal customer:
   - Should be redirected immediately and denied access.
