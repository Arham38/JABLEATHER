# JAB LEATHER – Payment Architecture & Integration Guide

This document details the provider-agnostic payment architecture designed for JAB LEATHER, including test flows, local webhook simulation, security controls, and a step-by-step production go-live checklist.

---

## 1. Architecture Flow Diagram (ASCII)

```
[ STOREFRONT / CHECKOUT ]
         |
         | 1. Customer places order (Items, Address, Method)
         v
[ SUPABASE DATABASE ] <----------------------------------------+
   - RPC: create_order()                                       |
   - Locks product inventory (FOR UPDATE)                      |
   - Inserts order: payment_status = 'unpaid', 'pending'       |
         |                                                     |
         | 2. Order # & canonical total returned               |
         v                                                     |
[ EXPRESS BACKEND API: /api/payments/create ]                  |
   - Loads canonical total from DB (NEVER trusts client)       |
   - Resolves provider (sandbox | manual | stripe | paypal)    |
   - Inserts into `payments` table (status: 'pending')         |
         |                                                     |
         +--------------------------+                          |
         |                          |                          |
    (If Sandbox)               (If Manual Wire)                |
         |                          |                          |
         v                          v                          |
[ /sandbox-payment ]       [ /checkout/success ]               |
   Simulator UI:              Awaiting Wire Settlement         |
   - Success                  (IBAN, SWIFT, EPZ Treasury)      |
   - Decline                         |                         |
   - Tamper Attack                   v                         |
         |                   [ ADMIN PORTAL ]                  |
         |                      Confirm Wire                   |
         |                           |                         |
         v                           v                         |
[ EXPRESS BACKEND API: /api/payments/webhook OR /api/payments/manual-confirm ]
   - Cryptographic signature check (x-sandbox-signature / stripe-signature)
   - Idempotency check via `processed_webhook_events` table
   - Strict Amount & Currency verification:
       * Does paid_amount == order.total?
       * Does paid_currency == order.currency?
   - IF VALID:
       * Updates `orders`: payment_status = 'paid', order_status = 'confirmed'
       * Updates `payments`: status = 'paid'
       * Writes to `payment_audit_log`
       * Dispatches customer confirmation email via Mailer
   - IF MISMATCH (Tampered):
       * Flags `payments`: status = 'amount_mismatch'
       * Notes order anomaly; leaves order unpaid
       * Writes alert to `payment_audit_log`
```

---

## 2. Environment Variables (Names Only)

Add these variable names to your production environment or local test files:

### Server (`server/.env`):
```env
# Server Core
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://jableather.com,https://admin.jableather.com

# Supabase Database & Auth
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> # Kept strictly on server
JWT_SECRET=<32-character-secret>

# Payment Gateway (Sandbox & Testing)
SANDBOX_WEBHOOK_SECRET=<your-hmac-sha256-secret>

# Production Gateway Placeholders (When Ready)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

### Client (`client/.env.local`):
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://api.jableather.com/api
```

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or webhook secrets in `/client`. Vite bundles `VITE_` variables directly into public JavaScript.

---

## 3. How to Test Webhooks Locally

### 3.1 Interactive Sandbox Simulator (Browser)
1. In the storefront, add any jacket or bag to your cart and proceed to checkout.
2. Select **"Credit / Debit Card (Sandbox Simulator)"**.
3. Place the order. You will be redirected to:
   `http://localhost:5173/sandbox-payment?order=JAB-XXXXXX&amount=349.00&currency=USD`
4. Test all three automated scenarios:
   - **Simulate Successful Payment**: Triggers `payment.succeeded` webhook, marks order as paid, and transitions to receipt.
   - **Simulate Payment Decline**: Simulates an issuer decline; order remains unpaid.
   - **Simulate Amount Mismatch Attack**: Sends a tampered payload paying \$1.00 instead of \$349.00. The server detects the attack, rejects the payment, and marks the payment as `amount_mismatch` in the audit log.

### 3.2 Command-Line Webhook Testing (`curl` / Postman)
You can trigger the webhook endpoint directly with `curl` or PowerShell:

```bash
curl -X POST http://localhost:5000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-payment-provider: sandbox" \
  -d '{
    "eventId": "evt_test_1001",
    "eventType": "payment.succeeded",
    "orderNumber": "JAB-000101",
    "amount": 349.00,
    "currency": "USD",
    "status": "paid",
    "providerReference": "TXN-987654321"
  }'
```

Expected Response:
```json
{
  "status": "success",
  "eventId": "evt_test_1001",
  "orderNumber": "JAB-000101",
  "newPaymentStatus": "paid"
}
```

Duplicate submission test (Idempotency):
Submit the exact same `curl` command again. The server immediately returns:
```json
{
  "status": "duplicate_ignored",
  "eventId": "evt_test_1001",
  "message": "Event was previously processed"
}
```

---

## 4. How to Add a Real Payment Gateway

See full template instructions in [`server/payments/TEMPLATE_PROVIDER.md`](../server/payments/TEMPLATE_PROVIDER.md).

Quick Summary:
1. Create `server/payments/<gateway>Provider.js` extending `PaymentProvider`.
2. Implement:
   - `createPayment(order)`: Create a session with the gateway using the server-loaded `order.total`.
   - `verifyWebhook(rawBody, headers)`: Cryptographically verify gateway signature (e.g. Stripe HMAC or PayPal verification).
   - `getStatus(reference)`: Query the gateway API for status.
3. Register the new provider in `server/payments/index.js`.
4. Set webhook endpoint in your gateway dashboard to:
   `https://api.jableather.com/api/payments/webhook`

---

## 5. Production Go-Live Checklist for Payments

- [ ] **HTTPS Enforced**: All payment endpoints, webhooks, and client redirects operate exclusively over HTTPS.
- [ ] **Environment Separation**: Test and Sandbox keys removed from production environment. Live gateway API keys stored securely in hosting environment (e.g. Railway, Render, Fly.io, or AWS Secrets Manager).
- [ ] **Webhook Signature Verification**: Production webhook secret (`STRIPE_WEBHOOK_SECRET` / `PAYPAL_WEBHOOK_ID`) configured and validated on raw request body.
- [ ] **Idempotency Verified**: Confirm `processed_webhook_events` table is active to prevent double-crediting on network retries.
- [ ] **Amount & Currency Validation**: Keep strict server-side verification active to prevent currency-conversion or client-side price tampering.
- [ ] **Zero Sensitive Card Logging**: Verify no logs print CVVs, full card numbers, or full raw payloads containing credit card details.
- [ ] **Order Abandonment Cleanup**: Schedule a recurring cron job calling `POST /api/payments/expire-abandoned` or the Supabase RPC `cancel_abandoned_orders(24)` daily to restock inventory from expired carts.
- [ ] **Email Dispatcher**: Connect a production transactional email service (Resend, SendGrid, Postmark) in `server/mailer/mailer.js`.
