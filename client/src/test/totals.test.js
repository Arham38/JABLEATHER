import { describe, it, expect } from 'vitest';
import { shippingService } from '../services/shippingService';
import { formatCurrency } from '../utils/currency';

describe('Totals & Dynamic Shipping Threshold', () => {
  describe('USD Store Currency', () => {
    const usdThreshold = 150.0;
    const usdStdRate = 25.0;
    const usdExpRate = 35.0;

    it('charges standard shipping when subtotal is below threshold in USD', () => {
      const fee = shippingService.computeShippingFee(100.0, 'standard', usdThreshold, usdStdRate, usdExpRate);
      expect(fee).toBe(25.0);
    });

    it('gives free standard shipping when subtotal meets or exceeds threshold in USD', () => {
      const feeExact = shippingService.computeShippingFee(150.0, 'standard', usdThreshold, usdStdRate, usdExpRate);
      expect(feeExact).toBe(0.0);

      const feeAbove = shippingService.computeShippingFee(250.0, 'standard', usdThreshold, usdStdRate, usdExpRate);
      expect(feeAbove).toBe(0.0);
    });

    it('charges express shipping regardless of subtotal', () => {
      const fee = shippingService.computeShippingFee(300.0, 'express', usdThreshold, usdStdRate, usdExpRate);
      expect(fee).toBe(35.0);
    });
  });

  describe('PKR Currency Scenario (Regression Bug: shipping was always free)', () => {
    // In old code, threshold was hardcoded to 150 without currency conversion.
    // In PKR, an order of Rs. 500 would have been >= 150 and got free shipping!
    // With dynamic store currency settings or currency rate conversion (e.g. 1 USD = 278.50 PKR),
    // the threshold in PKR is 150 * 278.50 = 41,775 PKR.
    const pkrRate = 278.5;
    const pkrThreshold = 150.0 * pkrRate; // 41,775 PKR
    const pkrStdRate = 25.0 * pkrRate; // 6,962.50 PKR
    const pkrExpRate = 35.0 * pkrRate;

    it('does NOT give free shipping for a small PKR order like 500 PKR', () => {
      const fee = shippingService.computeShippingFee(500.0, 'standard', pkrThreshold, pkrStdRate, pkrExpRate);
      expect(fee).toBe(pkrStdRate);
      expect(fee).toBe(6962.5);
    });

    it('charges standard shipping for order below PKR threshold (e.g. 25,000 PKR)', () => {
      const fee = shippingService.computeShippingFee(25000.0, 'standard', pkrThreshold, pkrStdRate, pkrExpRate);
      expect(fee).toBe(pkrStdRate);
    });

    it('gives free shipping once order meets PKR threshold (e.g. 50,000 PKR >= 41,775 PKR)', () => {
      const fee = shippingService.computeShippingFee(50000.0, 'standard', pkrThreshold, pkrStdRate, pkrExpRate);
      expect(fee).toBe(0.0);
    });
  });

  describe('Order Total Calculations', () => {
    it('calculates subtotal, percentage discount, and shipping fee correctly', () => {
      const items = [
        { price: 100, quantity: 2 }, // 200
        { price: 50, quantity: 1 },  // 50
      ];
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      expect(subtotal).toBe(250);

      // 10% coupon
      const discount = subtotal * 0.1;
      expect(discount).toBe(25);

      // Free shipping threshold = 150, subtotal 250 >= 150 -> shipping = 0
      const shipping = shippingService.computeShippingFee(subtotal, 'standard', 150, 25, 35);
      expect(shipping).toBe(0);

      const total = subtotal - discount + shipping;
      expect(total).toBe(225);
    });

    it('formats currency with symbol according to selected currency code', () => {
      expect(formatCurrency(250, 'USD')).toContain('$250');
      expect(formatCurrency(250, 'PKR')).toContain('PKR');
    });
  });
});
