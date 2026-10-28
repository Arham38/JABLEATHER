import { storage } from '../utils/storage';
import { mockOrders } from '../data/mockOrders';

const PROFILE_KEY = 'jab_customer_profile';
const ADDRESSES_KEY = 'jab_customer_addresses';

const initialProfile = {
  firstName: 'Alexander',
  lastName: 'Wright',
  email: 'alex.wright@example.com',
  phone: '+1 (555) 234-8901',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

const initialAddresses = [
  {
    id: 'addr-1',
    isDefault: true,
    firstName: 'Alexander',
    lastName: 'Wright',
    address: '742 Evergreen Terrace',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'United States',
    phone: '+1 (555) 234-8901',
  },
];

export const customerService = {
  getProfile: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(PROFILE_KEY, initialProfile);
  },

  updateProfile: async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const current = storage.get(PROFILE_KEY, initialProfile);
    const updated = { ...current, ...data };
    storage.set(PROFILE_KEY, updated);
    return updated;
  },

  getAddresses: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return storage.get(ADDRESSES_KEY, initialAddresses);
  },

  saveAddress: async (addressData) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const addresses = storage.get(ADDRESSES_KEY, initialAddresses);
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
    const addresses = storage.get(ADDRESSES_KEY, initialAddresses);
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
