import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import supabase from '../utils/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const curCustomer = authService.getCurrentUser();
    if (curCustomer) setCustomer(curCustomer);

    let isMounted = true;
    const setAdminFromSession = (user) => {
      if (!isMounted) return;
      setAdmin(user?.app_metadata?.role === 'admin' ? user : null);
      setLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        setAdminFromSession(data.session?.user || null);
      })
      .catch(() => setAdminFromSession(null));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminFromSession(session?.user || null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginCustomer = async ({ email, password }) => {
    try {
      const { user } = await authService.login({ email, password });
      setCustomer(user);
      toast.success(`Welcome back, ${user.name}`);
      return user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const signupCustomer = async (data) => {
    try {
      const { user } = await authService.signup(data);
      setCustomer(user);
      toast.success(`Welcome to JAB Leather, ${user.name}`);
      return user;
    } catch (err) {
      toast.error(err.message || 'Signup failed');
      throw err;
    }
  };

  const logoutCustomer = async () => {
    await authService.logout();
    setCustomer(null);
    toast.info('You have been signed out');
  };

  const loginAdmin = async ({ email, password }) => {
    try {
      const { user } = await authService.adminLogin({ email, password });
      setAdmin(user);
      toast.success('Admin portal access granted');
      return user;
    } catch (err) {
      toast.error(err.message || 'Admin authentication failed');
      throw err;
    }
  };

  const logoutAdmin = async () => {
    await authService.adminLogout();
    setAdmin(null);
    toast.info('Admin logged out');
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
