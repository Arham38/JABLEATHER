import supabase from '../utils/supabase';

const DEFAULT_SETTINGS = {
  general: {
    storeName: 'JAB LEATHER',
    tagline: 'Luxury Handcrafted Leather Goods from Sialkot, Pakistan',
    baseCurrency: 'USD',
    supportedCurrencies: ['USD', 'PKR', 'EUR', 'GBP'],
    exchangeRates: {
      USD: 1.0,
      PKR: 278.50,
      EUR: 0.92,
      GBP: 0.79,
    },
    supportEmail: 'concierge@jableather.com',
    wholesaleEmail: 'export@jableather.com',
    phone: '+92 300 1234567',
    address: 'Atelier District, Sialkot 51310, Punjab, Pakistan',
    freeShippingThreshold: 150.00,
  },
  shipping: {
    freeShippingThreshold: 150.00,
    standardRate: 25.00,
    expressRate: 35.00,
    originFacility: 'Export Processing Zone, Sialkot, Pakistan',
    defaultCarrier: 'DHL Express / FedEx Air',
  },
  payments: {
    stripeEnabled: true,
    wireTransferEnabled: true,
    codEnabled: false,
    sandboxMode: true,
    defaultCurrency: 'USD',
    settlementAccount: 'Standard Chartered Pakistan - JAB LEATHER (PVT) LTD',
    wireInstructions: 'Bank: Standard Chartered Pakistan\nAccount Title: JAB LEATHER (PVT) LTD\nIBAN: PK36SCBL0000001123456701\nSWIFT: SCBLPKKA',
  },
  announcement: {
    enabled: true,
    message: 'Handcrafted in Sialkot, Pakistan • Complimentary Worldwide DHL Express Shipping on Orders Over $150',
    link: '/shop',
  },
  social: {
    instagram: 'https://www.instagram.com/jableather/',
    facebook: 'https://facebook.com/jableather',
    linkedin: 'https://linkedin.com/company/jableather',
  },
};

let cachedSettings = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

export const settingsService = {
  // Fetch all or specific store settings from Supabase `store_settings` table
  getSettings: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cachedSettings && (now - cacheTimestamp < CACHE_TTL_MS)) {
      return cachedSettings;
    }

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const merged = { ...DEFAULT_SETTINGS };
        for (const row of data) {
          if (row.key && row.value) {
            merged[row.key] = {
              ...(DEFAULT_SETTINGS[row.key] || {}),
              ...row.value,
            };
          }
        }
        cachedSettings = merged;
        cacheTimestamp = now;
        return merged;
      }
    } catch (err) {
      console.warn('Could not load store_settings from Supabase, using default configuration:', err.message);
    }

    cachedSettings = DEFAULT_SETTINGS;
    cacheTimestamp = now;
    return DEFAULT_SETTINGS;
  },

  // Get single setting section e.g. 'general', 'shipping', 'payments'
  getSection: async (sectionKey) => {
    const all = await settingsService.getSettings();
    return all[sectionKey] || DEFAULT_SETTINGS[sectionKey] || {};
  },

  // Update a setting section in Supabase (requires admin session)
  updateSection: async (sectionKey, newValues) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || user?.app_metadata?.role !== 'admin') {
      throw new Error('Administrative privileges required to update store settings.');
    }

    const currentSection = await settingsService.getSection(sectionKey);
    const updatedValues = { ...currentSection, ...newValues };

    const { error } = await supabase
      .from('store_settings')
      .upsert({
        key: sectionKey,
        value: updatedValues,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`Failed to update ${sectionKey} settings:`, error);
      throw error;
    }

    // Invalidate cache
    cachedSettings = null;
    cacheTimestamp = 0;
    return settingsService.getSettings(true);
  },

  // Save all settings (used by admin settings page)
  updateSettings: async (allSettings) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || user?.app_metadata?.role !== 'admin') {
      throw new Error('Administrative privileges required to update store settings.');
    }

    const entries = Object.entries(allSettings);
    for (const [key, val] of entries) {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          key,
          value: val,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
    }

    cachedSettings = null;
    cacheTimestamp = 0;
    return settingsService.getSettings(true);
  },
};

export default settingsService;
