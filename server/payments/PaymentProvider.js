/**
 * JAB LEATHER – Provider-Agnostic Payment Provider Interface
 *
 * All payment providers (sandbox, manual, Stripe, PayPal, etc.)
 * must inherit from or implement this contract.
 */

class PaymentProvider {
  constructor(name) {
    if (new.target === PaymentProvider) {
      throw new TypeError('Cannot construct PaymentProvider abstract instances directly');
    }
    this.name = name;
  }

  /**
   * Initializes a payment session for an order.
   *
   * @param {Object} order - Canonical order object loaded directly from database
   * @param {string} order.order_number - Canonical order number (e.g., JAB-000101)
   * @param {number} order.total - Verified order total amount
   * @param {string} order.currency - 3-letter currency code (e.g., USD)
   * @param {Object} order.customer - Customer details (email, name)
   * @returns {Promise<{ redirectUrl?: string, clientSecret?: string, providerReference: string, metadata?: Object }>}
   */
  async createPayment(order) {
    throw new Error(`createPayment() not implemented by provider "${this.name}"`);
  }

  /**
   * Verifies incoming webhook payloads from gateway and returns standardized event.
   *
   * @param {Buffer|string} rawBody - Raw body buffer/string for HMAC signature check
   * @param {Object} headers - Request headers (e.g., stripe-signature, x-sandbox-signature)
   * @returns {Promise<{
   *   eventId: string,
   *   eventType: string,
   *   orderNumber: string,
   *   amount: number,
   *   currency: string,
   *   status: 'paid' | 'failed' | 'cancelled' | 'refunded',
   *   providerReference: string
   * }>}
   */
  async verifyWebhook(rawBody, headers) {
    throw new Error(`verifyWebhook() not implemented by provider "${this.name}"`);
  }

  /**
   * Queries provider for real-time status of a transaction reference.
   *
   * @param {string} reference - Provider reference identifier
   * @returns {Promise<{ status: string, amount?: number, currency?: string, providerReference: string }>}
   */
  async getStatus(reference) {
    throw new Error(`getStatus() not implemented by provider "${this.name}"`);
  }
}

module.exports = PaymentProvider;
