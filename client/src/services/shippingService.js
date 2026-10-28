import supabase from '../utils/supabase';
import { settingsService } from './settingsService';

export const shippingService = {
  // Fetch active shipping methods from Supabase shipping_methods table
  getShippingMethods: async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((m) => ({
          id: m.code,
          databaseId: m.id,
          name: m.name,
          code: m.code,
          description: `Estimated ${m.estimated_days} via DHL / FedEx`,
          cost: Number(m.rate) || 0,
          standardCost: Number(m.rate) || 0,
          minThresholdForFree: m.free_above_subtotal ? Number(m.free_above_subtotal) : null,
          estimatedDays: m.estimated_days,
        }));
      }
    } catch (err) {
      console.warn('Could not load shipping methods from database:', err.message);
    }

    // Fallback to store_settings configuration
    const settings = await settingsService.getSection('shipping');
    const freeThreshold = Number(settings.freeShippingThreshold ?? settings.free_shipping_threshold) || 150.00;
    const stdRate = Number(settings.standardRate ?? settings.standard_rate) || 25.00;
    const expRate = Number(settings.expressRate ?? settings.express_rate) || 35.00;

    return [
      {
        id: 'standard',
        name: 'Standard International Air',
        description: 'Estimated 5–8 business days via DHL / FedEx',
        cost: stdRate,
        standardCost: stdRate,
        minThresholdForFree: freeThreshold,
        estimatedDays: '5–8 business days',
      },
      {
        id: 'express',
        name: 'Priority Air Express',
        description: 'Estimated 2–4 business days via DHL Express',
        cost: expRate,
        standardCost: expRate,
        minThresholdForFree: null,
        estimatedDays: '2–4 business days',
      },
    ];
  },

  // Calculate dynamic shipping cost for a given subtotal
  calculateShipping: async (subtotal, selectedMethodCode = 'standard') => {
    const methods = await shippingService.getShippingMethods();
    const method = methods.find((m) => m.id === selectedMethodCode || m.code === selectedMethodCode) || methods[0];
    if (!method) return 0.00;

    if (method.minThresholdForFree !== null && subtotal >= method.minThresholdForFree) {
      return 0.00;
    }

    return method.cost;
  },

  // Synchronous calculation helper using dynamic store settings
  computeShippingFee: (
    subtotal,
    selectedMethodCode = 'standard',
    threshold = 150.00,
    stdRate = 25.00,
    expRate = 35.00
  ) => {
    if (selectedMethodCode === 'express' || selectedMethodCode === 'ship-exp') {
      return expRate;
    }
    return subtotal >= threshold ? 0.00 : stdRate;
  },
};

export default shippingService;
