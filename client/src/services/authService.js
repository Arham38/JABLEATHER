import supabase from '../utils/supabase';

export const authService = {
  // Customer login via Supabase Auth
  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  },

  // Admin login via Supabase Auth with strict app_metadata.role check
  adminLogin: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Please provide admin email and password');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;

    if (data.user?.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('This account is not authorized for the admin portal.');
    }

    return { user: data.user, session: data.session, token: data.session?.access_token };
  },

  // Customer signup via Supabase Auth (with email verification support)
  signup: async ({ firstName, lastName, email, password, phone }) => {
    if (!email || !password) {
      throw new Error('Registration requires email and password');
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: fullName || 'Valued Customer',
          first_name: firstName?.trim() || '',
          last_name: lastName?.trim() || '',
          phone: phone || '',
        },
      },
    });

    if (error) throw error;

    const needsEmailVerification = !data.session && Boolean(data.user);

    return {
      user: data.user,
      session: data.session,
      needsEmailVerification,
    };
  },

  // Customer signout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  // Admin signout
  adminLogout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Request password reset email via Supabase
  forgotPassword: async (email) => {
    if (!email) throw new Error('Please provide your email address.');

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/account/reset-password`
        : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) throw error;
    return { success: true, message: `Password reset link sent to ${email}.` };
  },

  // Update password for recovery session or authenticated user
  resetPassword: async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true, user: data.user, message: 'Password updated successfully.' };
  },
};

export default authService;
