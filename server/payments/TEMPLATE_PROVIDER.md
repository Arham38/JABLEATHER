# Template Payment Provider Guide: Adding a Production Gateway to JAB LEATHER

This document outlines the step-by-step architecture to integrate any production payment gateway (e.g., **Stripe**, **PayPal**, **Safepay**, **PayFast**, **JazzCash**, **Easypaisa**) into JAB LEATHER's provider-agnostic payment architecture without breaking existing checkout or order workflows.

---

## 1. Provider Contract

Every payment provider inherits from `server/payments/PaymentProvider.js` and implements three core methods:

```javascript
const PaymentProvider = require('./PaymentProvider');

class RealGatewayProvider extends PaymentProvider {
  constructor() {
    super('my_gateway');
  }

  // 1. Initialize checkout / intent with real gateway
  async createPayment(order) { ... }

  // 2. Cryptographically verify webhook signatures from gateway
  async verifyWebhook(rawBody, headers) { ... }

  // 3. Query gateway API for real-time status of transaction reference
  async getStatus(reference) { ... }
}

module.exports = new RealGatewayProvider();
```

---

## 2. Step-by-Step Implementation Checklist

### Step 1: Environment Variables
Add only variable **names** to `server/.env.example` and your production server environment (never hardcode secrets or commit `.env` files):
```env
# Example Gateway Configuration (Names Only)
MY_GATEWAY_API_KEY=
MY_GATEWAY_SECRET_KEY=
MY_GATEWAY_WEBHOOK_SECRET=
MY_GATEWAY_MERCHANT_ID=
MY_GATEWAY_MODE=sandbox # or 'live'
```

### Step 2: Implement `createPayment(order)`
1. Read verified amount and currency directly from `order` (`order.total`, `order.currency`, `order.order_number`).
2. Call the gateway's REST API or SDK to create a PaymentIntent, Checkout Session, or invoice.
3. Return:
   - `redirectUrl`: The URL to redirect the customer to (for hosted checkouts).
   - `clientSecret`: The client secret (for embedded elements like Stripe Elements or PayPal Buttons).
   - `providerReference`: The gateway's unique transaction identifier (e.g. `pi_123456`, `PAYID-XYZ`).

### Step 3: Implement `verifyWebhook(rawBody, headers)`
1. Retrieve signature header from `headers` (e.g., `stripe-signature`, `paypal-transmission-sig`).
2. Verify HMAC SHA256 signature using `rawBody` buffer and `process.env.MY_GATEWAY_WEBHOOK_SECRET`.
3. Normalize the event into the JAB LEATHER standard format:
   ```javascript
   return {
     eventId: payload.id, // Must be unique for idempotency
     eventType: payload.type, // e.g., 'charge.succeeded'
     orderNumber: payload.metadata.order_number,
     amount: payload.amount / 100, // Normalize to standard decimal units
     currency: payload.currency.toUpperCase(),
     status: 'paid', // 'paid', 'failed', 'cancelled', 'refunded'
     providerReference: payload.id,
   };
   ```

### Step 4: Register in `server/payments/index.js`
Import the new provider and register it in the `providers` map:
```javascript
const myGatewayProvider = require('./myGatewayProvider');

const providers = {
  manual: manualProvider,
  sandbox: sandboxProvider,
  my_gateway: myGatewayProvider,
};
```

### Step 5: Configure Storefront Gateway Option
In `client/src/pages/storefront/CheckoutPage.jsx`, add the option to the payment selector matching the provider key.

---

## 3. Strict Security Rules
1. **Never Trust Client Amounts**: The server endpoint `/api/payments/create` always queries the database to load `order.total`. Never accept `amount` or `currency` from client requests.
2. **Amount Mismatch Verification**: JAB LEATHER server verifies `paid_amount === order.total && paid_currency === order.currency`. If a customer attempts to pay \$1 instead of \$300, the system marks the transaction as `amount_mismatch` and does **not** fulfill the order.
3. **Idempotency**: All webhooks are checked against the `processed_webhook_events` table before processing. Duplicate webhook deliveries are safely acknowledged with HTTP 200 without duplicate state changes.
4. **Never Log Sensitive Data**: Never log card numbers, CVVs, expiration dates, or complete webhook payloads containing customer PII in console logs or error trackers.
