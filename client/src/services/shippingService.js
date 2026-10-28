export const shippingService = {
  getShippingMethods: () => [
    {
      id: 'ship-std',
      name: 'Standard Worldwide Courier',
      description: 'Estimated 5–8 business days via DHL / FedEx',
      cost: 0,
      minThresholdForFree: 150,
      standardCost: 25.00,
    },
    {
      id: 'ship-exp',
      name: 'Priority Air Express',
      description: 'Estimated 2–4 business days with signature required',
      cost: 35.00,
    },
  ],

  calculateShipping: (subtotal, selectedMethodId = 'ship-std') => {
    if (selectedMethodId === 'ship-exp') return 35.00;
    return subtotal >= 150 ? 0.00 : 25.00;
  },
};

export default shippingService;
