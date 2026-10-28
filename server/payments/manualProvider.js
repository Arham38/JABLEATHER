const PaymentProvider = require('./PaymentProvider');

/**
 * Manual Payment Provider (Bank Wire Transfer / Cash On Delivery)
 *
 * Does not use automated external gateways or webhooks.
 * Orders remain unpaid/pending until an administrator manually verifies
 * wire receipt or COD delivery in the admin portal.
 */
class ManualProvider extends PaymentProvider {
  constructor() {
    super('manual');
  }

  async createPayment(order) {
    const method = order.payment_method || 'wire';
    const timestamp = Date.now().toString().slice(-4);
    const providerReference = `MANUAL-${method.toUpperCase()}-${order.order_number}-${timestamp}`;

    return {
      redirectUrl: null,
      clientSecret: null,
      providerReference,
      metadata: {
        paymentMethod: method,
        awaitingAdminConfirmation: true,
        instructions:
          method === 'wire'
            ? 'Direct wire transfer to JAB Leather Treasury Account (Sialkot Export Processing Zone).'
            : 'Payment collected in cash upon courier delivery.',
      },
    };
  }

  async verifyWebhook(_rawBody, _headers) {
    throw new Error('Manual payment provider does not receive webhooks; settlements are confirmed via admin portal.');
  }

  async getStatus(reference) {
    return {
      status: 'pending',
      providerReference: reference,
    };
  }
}

module.exports = new ManualProvider();
