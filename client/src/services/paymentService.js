import { apiClient } from '../api/apiClient';

/**
 * Payment Service (Client-Side)
 * Connects to the Express payment gateway endpoints.
 * Never handles, stores, or logs raw credit card numbers or CVV.
 */
export const paymentService = {
  getAvailableMethods: () => [
    { id: 'card', name: 'Credit / Debit Card (Sandbox Simulator)', icon: 'credit-card', provider: 'sandbox' },
    { id: 'wire', name: 'Bank Wire / TT (B2B & International Wire)', icon: 'landmark', provider: 'manual' },
    { id: 'cod', name: 'Cash on Delivery (Pakistan Only)', icon: 'truck', provider: 'manual' },
  ],

  /**
   * Initializes payment session on backend.
   * Total and currency are loaded securely server-side.
   *
   * @param {string} orderNumber
   * @param {string} provider - 'sandbox', 'manual', 'wire', 'cod'
   */
  createPayment: async (orderNumber, provider = 'sandbox') => {
    return apiClient.post('/api/payments/create', {
      orderNumber,
      provider,
    });
  },

  /**
   * Retrieves real-time payment and order status from the server.
   *
   * @param {string} orderNumber
   */
  getOrderStatus: async (orderNumber) => {
    return apiClient.get(`/api/orders/${encodeURIComponent(orderNumber)}/status`);
  },

  /**
   * Triggers sandbox webhook execution (for testing simulator).
   *
   * @param {Object} payload
   */
  triggerSandboxWebhook: async (payload) => {
    return apiClient.post('/api/payments/webhook', payload, {
      headers: {
        'x-payment-provider': 'sandbox',
      },
    });
  },

  /**
   * Administrative confirmation of manual wire or COD receipt.
   *
   * @param {string} orderNumber
   * @param {string} reference
   * @param {string} reason
   */
  confirmManualPayment: async (orderNumber, reference, reason) => {
    return apiClient.post('/api/payments/manual-confirm', {
      orderNumber,
      reference,
      reason,
    });
  },
};

export default paymentService;
