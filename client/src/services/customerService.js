import supabase from '../utils/supabase';
import { orderService } from './orderService';

const mapAddress = (row) => ({
  id: row.id,
  firstName: row.first_name || '',
  lastName: row.last_name || '',
  phone: row.phone || '',
  address: row.address_line1 || '',
  addressLine2: row.address_line2 || '',
  city: row.city || '',
  state: row.state || '',
  postalCode: row.postal_code || '',
  country: row.country || 'United States',
  isDefault: Boolean(row.is_default),
  createdAt: row.created_at,
});

export const customerService = {
  // Fetch profile for authenticated user from Supabase profiles table
  getProfile: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && profile) {
        return {
          id: user.id,
          email: user.email,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          phone: profile.phone || '',
          avatar: profile.avatar_url || '',
        };
      }
    } catch {
      // Fallback to user_metadata if profiles table is not yet applied
    }

    const meta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email,
      firstName: meta.first_name || '',
      lastName: meta.last_name || '',
      phone: meta.phone || '',
      avatar: meta.avatar_url || '',
    };
  },

  // Update profile in Supabase profiles table and auth user metadata
  updateProfile: async (data) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Authentication required to update profile.');

    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

    // 1. Update public.profiles row
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: data.firstName?.trim() || '',
          last_name: data.lastName?.trim() || '',
          name: fullName || null,
          phone: data.phone?.trim() || '',
          avatar_url: data.avatar || '',
          updated_at: new Date().toISOString(),
        });
    } catch {
      // Graceful if profiles table is pending review
    }

    // 2. Sync user_metadata in Supabase Auth
    await supabase.auth.updateUser({
      data: {
        name: fullName,
        first_name: data.firstName?.trim() || '',
        last_name: data.lastName?.trim() || '',
        phone: data.phone?.trim() || '',
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      avatar: data.avatar || '',
    };
  },

  // Get addresses for authenticated user from Supabase addresses table
  getAddresses: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapAddress);
    } catch (err) {
      console.warn('Unable to load addresses from Supabase:', err.message);
      return [];
    }
  },

  // Insert or update address in Supabase addresses table
  saveAddress: async (addressData) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Authentication required to save addresses.');

    const isDefault = Boolean(addressData.isDefault);

    // If marked default, unset default on other addresses first
    if (isDefault) {
      try {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      } catch {
        // Continue
      }
    }

    const row = {
      user_id: user.id,
      first_name: addressData.firstName?.trim() || '',
      last_name: addressData.lastName?.trim() || '',
      phone: addressData.phone?.trim() || '',
      address_line1: (addressData.address || addressData.address_line1 || '').trim(),
      address_line2: (addressData.addressLine2 || addressData.address_line2 || '').trim(),
      city: addressData.city?.trim() || '',
      state: addressData.state?.trim() || '',
      postal_code: (addressData.postalCode || addressData.postal_code || '').trim(),
      country: addressData.country?.trim() || 'United States',
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    };

    const isExistingUuid = addressData.id && typeof addressData.id === 'string' && addressData.id.includes('-');

    if (isExistingUuid) {
      const { error } = await supabase
        .from('addresses')
        .update(row)
        .eq('id', addressData.id)
        .eq('user_id', user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('addresses')
        .insert(row);
      if (error) throw error;
    }

    return customerService.getAddresses();
  },

  // Delete address
  deleteAddress: async (id) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Authentication required to delete addresses.');

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return customerService.getAddresses();
  },

  // Customer order history from Supabase orders table
  getCustomerOrders: async () => {
    return orderService.getAllOrders();
  },

  // Get single order for customer
  getOrderById: async (orderNumber) => {
    return orderService.getOrderById(orderNumber);
  },
};

export default customerService;
