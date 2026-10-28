# JAB LEATHER — Luxury Fullstack E-Commerce Platform

> Handcrafted genuine leather jackets, outerwear, duffels, and bespoke accessories tailored in Sialkot, Pakistan. Engineered with modern fullstack architecture for international retail & wholesale export.

---

## 🏛️ Project Architecture

```
JABLEATHER/
├── client/                     # React 19 + Tailwind CSS 4 + Vite Single Page Application
│   ├── src/
│   │   ├── api/                # Axios API client & centralized endpoints
│   │   ├── assets/             # Logos, brand badges & media
│   │   ├── components/
│   │   │   ├── admin/          # Admin operations layout & navigation
│   │   │   ├── cart/           # Slide-over cart drawer & currency conversions
│   │   │   ├── common/         # Button, Badge, Modal, Input, Pagination, etc.
│   │   │   ├── home/           # Editorial banners, hero, workshop story, etc.
│   │   │   ├── layout/         # Storefront header, mega menu, footer, announcements
│   │   │   └── product/        # Product cards, responsive grids, quick-view modals
│   │   ├── context/            # Auth, Cart, Wishlist, UI, and Toast providers
│   │   ├── data/               # Standalone mock datasets (products, orders, reviews)
│   │   ├── pages/
│   │   │   ├── admin/          # 16 admin operations pages (Dashboard, CMS, Orders)
│   │   │   ├── customer/       # Customer authentication & client portal pages
│   │   │   └── storefront/     # Catalog, product details, checkout, about, contact
│   │   ├── services/           # Services layer with mock fallback & backend sync
│   │   ├── utils/              # Local storage, currency formatting, helpers
│   │   ├── App.jsx             # Comprehensive routing & context tree
│   │   ├── index.css           # Tailwind CSS 4 & luxury brand typography styling
│   │   └── main.jsx
├── server/                     # Node.js + Express + MongoDB REST API backend
│   ├── .env                    # Environment variables (Port, Mongo URI, JWT secret)
│   ├── server.js               # Express server entry point & health check
│   └── package.json
└── package.json                # Monorepo root automation scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Running the Frontend (Client)
```bash
# From root directory:
npm run dev:client

# Or navigate directly to client:
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

### 3. Running the Backend (Server)
```bash
# From root directory:
npm run dev:server

# Or navigate directly to server:
cd server
npm run dev
```
The server will start at **http://localhost:5000** with the `/api/health` endpoint active.

---

## ✨ Features

### 🛍️ Luxury Storefront
- **Dynamic Homepage**: High-impact editorial hero, category showcase, workshop story from Sialkot atelier, customer testimonials, and newsletter signup.
- **Interactive Mega Menu**: Desktop dropdown with direct links to men's, women's, riding, and cowhide collections.
- **Product Filtering & Sorting**: Filter by category, gender, leather finish, and price with real-time responsive grid.
- **Quick-View & Full Detail Page**: Multi-angle image carousels, size selection, specifications, and leather care instructions.
- **Persistent Shopping Cart**: Slide-out cart drawer with free shipping progress bar, promo coupon engine, and local storage persistence.
- **Multi-Step Checkout**: Shipping calculation, payment method selection, and instant order confirmation.

### 👤 Customer Portal (`/account`)
- Customer signup and login.
- Real-time order history tracking and shipment status.
- Saved addresses, customer profile, and wishlist management.

### 🛡️ Admin Operations (`/admin`)
- **Dashboard**: Executive metrics, revenue trend graphs, low-stock warnings, and recent dispatches.
- **Product Management**: Full product listing with filtering, status toggle, and create/edit forms.
- **Order Processing**: Track payment and fulfillment status with inspectable details.
- **Homepage CMS**: Custom live text and banner controls.
- **B2B Export Catalog**: Wholesale catalog distribution to international buyers.
- **Media Library & Analytics**: Image assets library and export performance metrics.
