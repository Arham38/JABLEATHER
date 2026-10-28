import { mockCoupons } from '../data/mockCoupons';

export const couponService = {
  validateCoupon: async (code, subtotal) => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!code) {
      throw new Error('Please enter a coupon code');
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = mockCoupons.find((c) => c.code === cleanCode && c.isActive);

    if (!coupon) {
      throw new Error(`Coupon "${code}" is invalid or expired.`);
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new Error(
        `Minimum order of $${coupon.minOrderAmount} required for coupon ${coupon.code}.`
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'shipping') {
      discountAmount = 25.00; // Free shipping value
    }

    return {
      isValid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      description: coupon.description,
    };
  },

  getAllCoupons: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [...mockCoupons];
  },
};

export default couponService;
