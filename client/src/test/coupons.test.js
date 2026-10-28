import { describe, it, expect } from 'vitest';

// Helper to simulate the Postgres validate_coupon stored procedure in JavaScript
function simulateValidateCoupon(coupon, { subtotal, customerOrderCount = 0 }) {
  const now = new Date();

  if (!coupon || !coupon.isActive) {
    return { valid: false, error: 'Coupon code is invalid or disabled.' };
  }

  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { valid: false, error: 'Coupon is not yet active.' };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { valid: false, error: 'Coupon has expired.' };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount of $${coupon.minOrderAmount} required for this coupon.`,
    };
  }

  if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached.' };
  }

  if (coupon.perCustomerLimit && customerOrderCount >= coupon.perCustomerLimit) {
    return { valid: false, error: 'You have already used this coupon the maximum number of times.' };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === 'shipping') {
    discountAmount = 0; // Handled as free shipping
  }

  return {
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    minOrderAmount: coupon.minOrderAmount,
    freeShipping: coupon.discountType === 'shipping' || Boolean(coupon.freeShipping),
  };
}

describe('Coupon Validation Logic', () => {
  const baseCoupon = {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscountAmount: 100,
    usageLimit: 100,
    usageCount: 15,
    perCustomerLimit: 1,
    isActive: true,
    startsAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days later
  };

  it('validates and applies a percentage coupon correctly', () => {
    const result = simulateValidateCoupon(baseCoupon, { subtotal: 200, customerOrderCount: 0 });
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(20); // 10% of 200
  });

  it('rejects coupon when subtotal does not meet minOrderAmount', () => {
    const result = simulateValidateCoupon(baseCoupon, { subtotal: 40, customerOrderCount: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Minimum order amount');
  });

  it('rejects expired coupons', () => {
    const expiredCoupon = {
      ...baseCoupon,
      code: 'EXPIRED20',
      expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    };
    const result = simulateValidateCoupon(expiredCoupon, { subtotal: 100, customerOrderCount: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  it('rejects coupon if total usage limit is exceeded', () => {
    const exhaustedCoupon = {
      ...baseCoupon,
      code: 'EXHAUSTED',
      usageLimit: 50,
      usageCount: 50,
    };
    const result = simulateValidateCoupon(exhaustedCoupon, { subtotal: 100, customerOrderCount: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('usage limit reached');
  });

  it('rejects coupon if per-customer limit has been reached', () => {
    const result = simulateValidateCoupon(baseCoupon, { subtotal: 150, customerOrderCount: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('already used this coupon');
  });

  it('caps discount amount at maxDiscountAmount', () => {
    const cappedCoupon = {
      ...baseCoupon,
      code: 'BIGDISCOUNT',
      discountValue: 50, // 50%
      maxDiscountAmount: 75,
    };
    // 50% of 300 is 150, but cap is 75
    const result = simulateValidateCoupon(cappedCoupon, { subtotal: 300, customerOrderCount: 0 });
    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(75);
  });

  it('correctly handles free shipping coupons', () => {
    const freeShipCoupon = {
      code: 'FREESHIP',
      discountType: 'shipping',
      discountValue: 0,
      isActive: true,
      minOrderAmount: 0,
      freeShipping: true,
    };
    const result = simulateValidateCoupon(freeShipCoupon, { subtotal: 50, customerOrderCount: 0 });
    expect(result.valid).toBe(true);
    expect(result.freeShipping).toBe(true);
  });
});
