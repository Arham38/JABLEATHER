import { storage } from '../utils/storage';

const SETTINGS_KEY = 'jab_store_settings';

const defaultSettings = {
  general: {
    storeName: 'JAB Leather',
    businessType: 'Leather Manufacturer & Exporter',
    tagline: 'Premium Leather Jackets & Handcrafted Goods',
    supportEmail: 'jazibalisher@gmail.com',
    wholesaleEmail: 'export@jableather.com',
    phone: '+1 (929) 409-9845',
    whatsapp: '+1 (929) 409-9845',
    address: 'Georgia 30176, USA • Export Processing Zone, Sialkot, Punjab, Pakistan',
    currency: 'USD',
  },
  social: {
    instagram: 'https://www.instagram.com/jabthread/',
    facebook: 'https://facebook.com/jableather',
    linkedin: 'https://linkedin.com/company/jableather',
  },
  announcement: {
    text: 'Worldwide Shipping • Custom & Wholesale Orders Welcome',
    enabled: true,
  },
  shipping: {
    freeShippingThreshold: 150.00,
    standardRate: 25.00,
    expressRate: 35.00,
  },
};

export const settingsService = {
  getSettings: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(SETTINGS_KEY, defaultSettings);
  },

  updateSettings: async (newSettings) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = storage.get(SETTINGS_KEY, defaultSettings);
    const updated = { ...current, ...newSettings };
    storage.set(SETTINGS_KEY, updated);
    return updated;
  },
};

export default settingsService;
