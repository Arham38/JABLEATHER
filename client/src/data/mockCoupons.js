/**
 * Mock Coupons Data for Checkout & Admin Management.
 */

export const mockCoupons = [
  {
    id: 'coup-1',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 100,
    maxDiscountAmount: 50,
    expiresAt: '2026-12-31',
    isActive: true,
    description: '10% off for first-time orders over $100',
    usageCount: 42,
  },
  {
    id: 'coup-2',
    code: 'LEATHER15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 250,
    maxDiscountAmount: 75,
    expiresAt: '2026-06-30',
    isActive: true,
    description: '15% off orders over $250',
    usageCount: 19,
  },
  {
    id: 'coup-3',
    code: 'FREESHIP',
    discountType: 'shipping',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 25,
    expiresAt: '2026-12-31',
    isActive: true,
    description: 'Free expedited shipping',
    usageCount: 88,
  },
];
