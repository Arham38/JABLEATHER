import { storage } from '../utils/storage';
import { mockOrders } from '../data/mockOrders';

const PROFILE_KEY = 'jab_customer_profile';
const ADDRESSES_KEY = 'jab_customer_addresses';

const defaultProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: '',
};

const defaultAddresses = [];

export const customerService = {
  getProfile: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(PROFILE_KEY, defaultProfile);
  },

  updateProfile: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = storage.get(PROFILE_KEY, defaultProfile);
    const updated = { ...current, ...data };
    storage.set(PROFILE_KEY, updated);
    return updated;
  },

  getAddresses: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADDRESSES_KEY, defaultAddresses);
  },

  saveAddress: async (addressData) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const addresses = storage.get(ADDRESSES_KEY, defaultAddresses);
    let updated;
    if (addressData.id) {
      updated = addresses.map((a) => (a.id === addressData.id ? addressData : a));
    } else {
      updated = [...addresses, { ...addressData, id: 'addr-' + Date.now() }];
    }
    storage.set(ADDRESSES_KEY, updated);
    return updated;
  },

  deleteAddress: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const addresses = storage.get(ADDRESSES_KEY, defaultAddresses);
    const updated = addresses.filter((a) => a.id !== id);
    storage.set(ADDRESSES_KEY, updated);
    return updated;
  },

  getCustomerOrders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...mockOrders];
  },

  getOrderById: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const order = mockOrders.find((o) => o.id === id);
    if (!order) throw new Error(`Order ${id} not found`);
    return order;
  },
};

export default customerService;
