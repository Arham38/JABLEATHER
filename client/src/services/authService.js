import { storage } from '../utils/storage';
import supabase from '../utils/supabase';

const AUTH_USER_KEY = 'jab_auth_user';
const AUTH_TOKEN_KEY = 'jab_auth_token';

export const authService = {
  // Mock customer login
  login: async ({ email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const mockUser = {
      id: 'usr-101',
      name: email.split('@')[0] || 'Valued Customer',
      email: email,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    const mockToken = 'mock_jwt_token_' + Date.now();
    storage.set(AUTH_USER_KEY, mockUser);
    storage.set(AUTH_TOKEN_KEY, mockToken);

    return { user: mockUser, token: mockToken };
  },

  adminLogin: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('This account is not authorized for the admin portal.');
    }

    storage.remove('jab_admin_user');
    storage.remove('jab_admin_token');
    return { user: data.user, token: data.session.access_token };
  },

  signup: async ({ firstName, lastName, email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (!email || !password) {
      throw new Error('Registration requires name, email and password');
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: `${firstName} ${lastName}`.trim() || 'New Customer',
      email: email,
      role: 'customer',
    };

    const token = 'mock_jwt_token_' + Date.now();
    storage.set(AUTH_USER_KEY, newUser);
    storage.set(AUTH_TOKEN_KEY, token);

    return { user: newUser, token };
  },

  logout: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    storage.remove(AUTH_USER_KEY);
    storage.remove(AUTH_TOKEN_KEY);
    return true;
  },

  adminLogout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    storage.remove('jab_admin_user');
    storage.remove('jab_admin_token');
    return true;
  },

  getCurrentUser: () => {
    return storage.get(AUTH_USER_KEY, null);
  },

  getCurrentAdmin: () => {
    return null;
  },

  forgotPassword: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true, message: `Reset link sent to ${email} (simulated)` };
  },

  resetPassword: async (token, newPassword) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true, message: 'Password updated successfully (simulated)' };
  },
};

export default authService;
