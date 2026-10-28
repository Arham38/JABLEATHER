# JAB LEATHER — Luxury Fullstack E-Commerce Platform

> Handcrafted genuine leather jackets, outerwear, duffels, and bespoke accessories tailored in Sialkot, Pakistan. Engineered with a modern fullstack architecture for international retail & wholesale export.

---

## 🏛️ Project Architecture

```
JABLEATHER/
├── client/                     # React 19 + Vite 8 + Tailwind CSS 4 Single Page Application
│   ├── src/
│   │   ├── api/                # Axios API client (strict VITE_API_URL in production)
│   │   ├── assets/             # Brand logos, badges, and imagery
│   │   ├── components/
│   │   │   ├── admin/          # Admin portal navigation and shell layout
│   │   │   ├── cart/           # Slide-over cart drawer and calculations
│   │   │   ├── common/         # Button, Input, Modal, Badge, Pagination, etc.
│   │   │   ├── home/           # Editorial banners, hero, workshop story
│   │   │   ├── layout/         # Storefront header, footer, announcement bar
│   │   │   └── product/        # Product cards, filter drawer, responsive grids
│   │   ├── context/            # Auth, Cart, Wishlist, UI, and Toast providers
│   │   ├── data/               # Static fallback datasets (mock collections, reviews)
│   │   ├── pages/
│   │   │   ├── admin/          # 16 admin operations pages (Dashboard, CMS, Orders, Media)
│   │   │   ├── customer/       # Customer portal pages (Dashboard, Orders, Addresses)
│   │   │   └── storefront/     # Catalog, product details, checkout, about, contact
│   │   ├── services/           # Service layer with Supabase integration
│   │   ├── utils/              # Local storage, currency formatting, validation helpers
│   │   ├── App.jsx             # Comprehensive routing & context tree
│   │   └── main.jsx
│   ├── .env.example            # Client environment template
│   └── package.json
├── server/                     # Node.js + Express 5 Secure Backend Service
│   ├── server.js               # Express 5 server with helmet, rate-limit & CORS controls
│   ├── supabaseClient.js       # Centralized Supabase JS client with WebSocket polyfill
│   ├── .env.example            # Server environment template
│   └── package.json
├── .gitignore                  # Root gitignore protecting all .env files and dependencies
└── package.json                # Monorepo management scripts
```

---

## 🛠️ Tech Stack & Key Infrastructure

* **Frontend**: React 19, Vite 8, Tailwind CSS 4, Lucide React icons, React Router DOM v7
* **Backend**: Node.js, Express 5, Helmet, Express-Rate-Limit, CORS
* **Database & Auth**: Supabase (PostgreSQL, Supabase Auth with RBAC, Supabase Storage)
* **Code Quality**: Oxlint (fast Rust-based linter)

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v18+ (tested on Node v20 & v22)
* **npm**: v9+
* **Supabase Project**: Dev / Staging Supabase project

### 2. Environment Configuration

Copy the example environment files in both client and server before starting:

#### Server Configuration
```bash
cp server/.env.example server/.env
```
Fill in the required variables in `server/.env`:
* `PORT`: Server port (default `5000`)
* `CORS_ORIGIN`: Comma-separated allowed frontend origins (e.g. `http://localhost:5173`)
* `JWT_SECRET`: Secure secret key for signing tokens
* `SUPABASE_URL`: Your Supabase project URL (`https://your-project.supabase.co`)
* `SUPABASE_ANON_KEY`: Supabase anon/public API key
* `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-only, never expose to client)
* `DATABASE_URL`: Direct PostgreSQL connection string (optional)

#### Client Configuration
```bash
cp client/.env.example client/.env.local
```
Fill in the variables in `client/.env.local`:
* `VITE_API_URL`: Backend server URL (default `http://localhost:5000`)
* `VITE_SUPABASE_URL`: Your Supabase project URL
* `VITE_SUPABASE_ANON_KEY`: Supabase anon/public API key

> [!CAUTION]
> Never commit `.env` or `.env.*` files. Secrets must always remain out of version control.

### 3. Running Locally

```bash
# Start Client (Frontend)
npm run dev:client
# Storefront opens at http://localhost:5173

# Start Server (Backend)
npm run dev:server
# Server listens at http://localhost:5000 (Health check at http://localhost:5000/api/health)
```

---

## 🔒 Security & Environment Architecture

1. **Root Git Hygiene**: Root and child `.gitignore` rules strictly prevent tracking of any `.env` or `.env.*` files.
2. **Fail-Fast Server**: Server immediately halts on startup with a descriptive error if critical environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`) are missing.
3. **CORS & Rate Limiting**: Express 5 enforces strict origin filtering via `CORS_ORIGIN` and restricts abuse via `express-rate-limit` (100 req / 15 min).
4. **Isolated Client Credentials**: Only `VITE_SUPABASE_ANON_KEY` is referenced in the frontend. `SUPABASE_SERVICE_ROLE_KEY` and database credentials are strictly forbidden and kept on the server only.

---

## 📋 Current Status & Known Limitations

The following items represent legacy mocked flows identified during the architectural audit and slated for resolution in upcoming development phases:

| Component | Current State | Target Future State |
| :--- | :--- | :--- |
| **Order Creation** | Saved only to browser `localStorage` (`jab_placed_orders`). Admin orders page reads Supabase `orders` table. | Storefront checkout writes directly to Supabase `orders` table with stock validation. |
| **Customer Auth** | Frontend localStorage mock (`jab_auth_user`). Accepts any email/password. | Migrate customer authentication to Supabase Auth. |
| **Payment Gateway** | Sandbox simulation in `paymentService.simulatePaymentProcessing` (always returns success). | PCI-compliant Stripe / PayPal / Wire transfer workflow with webhook status updates. |
| **Inventory / Stock** | Stock is read from Supabase products, but checkout does not decrement stock. | Transactional database stock check and decrement upon order placement. |
| **Multi-Currency** | Admin products default to PKR while storefront defaults to USD with hardcoded $150 free shipping threshold. | Dynamic multi-currency conversion with unified shipping calculation engine. |
| **Contact & Newsletter** | Client `setTimeout` simulated delay; submissions are not persisted. | Server-backed or Supabase-backed leads table and notification emails. |
| **CMS & Coupons** | Admin coupons and homepage CMS persist in local storage fallback. | Dedicated Supabase tables for dynamic homepage CMS blocks and promotional coupons. |
