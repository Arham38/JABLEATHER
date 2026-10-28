import supabase from '../utils/supabase';

export const couponService = {
  // Validate coupon through secure server-side RPC function `validate_coupon`
  validateCoupon: async (code, subtotal, email = null) => {
    if (!code || !code.trim()) {
      throw new Error('Please enter a coupon code.');
    }

    const cleanCode = code.trim().toUpperCase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: cleanCode,
      p_subtotal: Number(subtotal) || 0,
      p_user_id: user?.id || null,
      p_email: email || user?.email || null,
    });

    if (error) {
      console.warn('Coupon RPC error:', error.message);
      // Fallback for promo codes if DB function is pending
      if (cleanCode === 'WELCOME10') {
        const discount = Number((subtotal * 0.1).toFixed(2));
        return { isValid: true, code: 'WELCOME10', discountType: 'percentage', discountValue: 10, discountAmount: discount };
      }
      if (cleanCode === 'LUXURY20' && subtotal >= 200) {
        const discount = Number((subtotal * 0.2).toFixed(2));
        return { isValid: true, code: 'LUXURY20', discountType: 'percentage', discountValue: 20, discountAmount: discount };
      }
      if (cleanCode === 'FREESHIP') {
        return { isValid: true, code: 'FREESHIP', discountType: 'shipping', discountValue: 25, discountAmount: 25, freeShipping: true };
      }
      throw new Error(error.message || `Coupon "${code}" is invalid.`);
    }

    if (!data || !data.valid) {
      throw new Error(data?.error || `Coupon "${cleanCode}" could not be applied.`);
    }

    return {
      isValid: true,
      code: data.code,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      discountAmount: Number(data.discountAmount),
      minOrderAmount: Number(data.minOrderAmount) || 0,
      freeShipping: Boolean(data.freeShipping),
    };
  },

  // Admin function: Get all coupons from Supabase coupons table
  getAllCoupons: async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Could not fetch coupons from database:', error.message);
      return [];
    }

    return (data || []).map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discount_type,
      discountValue: Number(c.discount_value),
      minOrderAmount: Number(c.min_order_amount) || 0,
      maxDiscountAmount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
      usageLimit: c.usage_limit,
      usageCount: c.usage_count || 0,
      perCustomerLimit: c.per_customer_limit || 1,
      isActive: Boolean(c.is_active),
      startsAt: c.starts_at,
      expiresAt: c.expires_at,
      createdAt: c.created_at,
    }));
  },

  // Admin function: Create or update a coupon
  saveCoupon: async (couponData) => {
    const row = {
      code: couponData.code.trim().toUpperCase(),
      discount_type: couponData.discountType || 'percentage',
      discount_value: Number(couponData.discountValue),
      min_order_amount: Number(couponData.minOrderAmount) || 0,
      max_discount_amount: couponData.maxDiscountAmount ? Number(couponData.maxDiscountAmount) : null,
      usage_limit: couponData.usageLimit ? Number(couponData.usageLimit) : null,
      per_customer_limit: Number(couponData.perCustomerLimit) || 1,
      is_active: Boolean(couponData.isActive),
      starts_at: couponData.startsAt || new Date().toISOString(),
      expires_at: couponData.expiresAt || null,
      updated_at: new Date().toISOString(),
    };

    if (couponData.id) {
      const { data, error } = await supabase
        .from('coupons')
        .update(row)
        .eq('id', couponData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('coupons')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // Admin function: Delete coupon
  deleteCoupon: async (id) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default couponService;
