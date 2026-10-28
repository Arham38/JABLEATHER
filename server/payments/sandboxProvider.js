const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');

/**
 * Sandbox Test Provider
 *
 * For local and staging tests. Simulates success, failure, cancellation,
 * and refunds on demand without live financial cards or real money.
 */
class SandboxProvider extends PaymentProvider {
  constructor() {
    super('sandbox');
    this.secret = process.env.SANDBOX_WEBHOOK_SECRET || 'jab_sandbox_webhook_secret_dev';
  }

  /**
   * Generates a sandbox checkout session redirecting to the storefront sandbox simulator.
   */
  async createPayment(order) {
    const timestamp = Date.now().toString().slice(-4);
    const providerReference = `SB-${order.order_number}-${timestamp}`;

    // Prefer configured CORS origin or fallback to localhost
    const clientBaseUrl = (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')[0]
      .trim();

    // Security: Only pass reference and identifiers; client simulation triggers server webhook or completion
    const redirectUrl = `${clientBaseUrl}/sandbox-payment?order=${encodeURIComponent(
      order.order_number
    )}&ref=${encodeURIComponent(providerReference)}&amount=${encodeURIComponent(
      order.total
    )}&currency=${encodeURIComponent(order.currency)}`;

    return {
      redirectUrl,
      clientSecret: `sb_sec_${crypto.randomBytes(12).toString('hex')}`,
      providerReference,
      metadata: {
        mode: 'sandbox_test_mode',
        simulatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Verifies incoming sandbox webhook payload and returns standardized event.
   */
  async verifyWebhook(rawBody, headers) {
    const rawString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
    const signature = headers['x-sandbox-signature'] || headers['x-signature'];

    // If signature provided, verify HMAC SHA256
    if (signature) {
      const expected = crypto.createHmac('sha256', this.secret).update(rawString).digest('hex');
      if (signature !== expected) {
        throw new Error('Sandbox webhook signature verification failed');
      }
    }

    let payload;
    try {
      payload = JSON.parse(rawString);
    } catch {
      throw new Error('Invalid JSON payload in sandbox webhook');
    }

    const {
      eventId = `sb_evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      eventType = 'payment.succeeded',
      orderNumber,
      amount,
      currency = 'USD',
      status = 'paid',
      providerReference,
    } = payload;

    if (!orderNumber) {
      throw new Error('Missing required orderNumber in sandbox webhook payload');
    }

    return {
      eventId,
      eventType,
      orderNumber,
      amount: Number(amount),
      currency: String(currency).toUpperCase(),
      status, // 'paid', 'failed', 'cancelled', 'refunded'
      providerReference: providerReference || `SB-${orderNumber}`,
      rawPayload: payload,
    };
  }

  async getStatus(reference) {
    return {
      status: 'pending',
      providerReference: reference,
    };
  }
}

module.exports = new SandboxProvider();
