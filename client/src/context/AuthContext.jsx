import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import supabase from '../utils/supabase';

const AuthContext = createContext(null);

const formatCustomer = (user) => {
  if (!user) return null;
  const isAdmin = user.app_metadata?.role === 'admin';
  const meta = user.user_metadata || {};
  const fullName = meta.name || (meta.first_name ? `${meta.first_name} ${meta.last_name || ''}`.trim() : '');

  return {
    id: user.id,
    email: user.email,
    name: fullName || user.email?.split('@')[0] || 'Valued Customer',
    firstName: meta.first_name || '',
    lastName: meta.last_name || '',
    phone: meta.phone || '',
    role: isAdmin ? 'admin' : 'customer',
    isAdmin,
    appMetadata: user.app_metadata || {},
    userMetadata: meta,
    rawUser: user,
  };
};

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const syncSession = (session) => {
      if (!isMounted) return;
      const user = session?.user || null;
      if (user) {
        const isAdmin = user.app_metadata?.role === 'admin';
        setCustomer(formatCustomer(user));
        setAdmin(isAdmin ? user : null);
      } else {
        setCustomer(null);
        setAdmin(null);
      }
      setLoading(false);
    };

    // 1. Initial Session Check
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        syncSession(session);
      })
      .catch((err) => {
        console.warn('Initial session check error:', err.message);
        if (isMounted) {
          setCustomer(null);
          setAdmin(null);
          setLoading(false);
        }
      });

    // 2. Realtime Auth State Listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loginCustomer = async ({ email, password }) => {
    try {
      const { user } = await authService.login({ email, password });
      const formatted = formatCustomer(user);
      setCustomer(formatted);
      toast.success(`Welcome back, ${formatted.name}`);
      return user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const signupCustomer = async (data) => {
    try {
      const result = await authService.signup(data);
      if (result.needsEmailVerification) {
        toast.info('Account created! Please check your email to verify your address.');
      } else if (result.user) {
        const formatted = formatCustomer(result.user);
        setCustomer(formatted);
        toast.success(`Welcome to JAB Leather, ${formatted.name}`);
      }
      return result;
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      throw err;
    }
  };

  const logoutCustomer = async () => {
    try {
      await authService.logout();
      setCustomer(null);
      setAdmin(null);
      toast.info('You have been signed out');
    } catch (err) {
      toast.error(err.message || 'Sign out failed');
    }
  };

  const loginAdmin = async ({ email, password }) => {
    try {
      const { user } = await authService.adminLogin({ email, password });
      setAdmin(user);
      setCustomer(formatCustomer(user));
      toast.success('Admin portal access granted');
      return user;
    } catch (err) {
      toast.error(err.message || 'Admin authentication failed');
      throw err;
    }
  };

  const logoutAdmin = async () => {
    try {
      await authService.adminLogout();
      setAdmin(null);
      setCustomer(null);
      toast.info('Admin logged out');
    } catch (err) {
      toast.error(err.message || 'Admin logout failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        admin,
        isAuthenticated: !!customer,
        isAdminAuthenticated: !!admin,
        loading,
        loginCustomer,
        signupCustomer,
        logoutCustomer,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
