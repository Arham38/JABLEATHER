export const paymentService = {
  getAvailableMethods: () => [
    { id: 'card', name: 'Credit / Debit Card (Simulated Gateway)', icon: 'credit-card' },
    { id: 'paypal', name: 'PayPal (Simulated)', icon: 'wallet' },
    { id: 'wire', name: 'Bank Wire / TT (B2B & Wholesale Orders)', icon: 'landmark' },
  ],

  simulatePaymentProcessing: async (_paymentDetails) => {
    // Artificial latency for realistic checkout feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Client-side verification only; NEVER store CVV or sensitive raw card data
    return {
      success: true,
      transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      timestamp: new Date().toISOString(),
      message: 'Simulated payment authorized successfully',
    };
  },
};

export default paymentService;
