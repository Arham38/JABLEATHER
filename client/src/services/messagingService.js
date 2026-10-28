import supabase from '../utils/supabase';
import { isValidEmail } from '../utils/validation';

const LAST_CONTACT_SUBMISSION_KEY = 'jab_last_contact_ts';
const RATE_LIMIT_COOLDOWN_MS = 20000; // 20s cooldown between contact submissions

export const messagingService = {
  // Submit contact message to Supabase contact_messages table
  submitContactMessage: async ({ name, email, subject, message, phone = '', honeypot = '' }) => {
    // 1. Bot prevention via honeypot field
    if (honeypot && honeypot.trim() !== '') {
      console.warn('Bot submission blocked via honeypot.');
      return { success: true };
    }

    // 2. Client-side rate limiting
    try {
      const lastTs = localStorage.getItem(LAST_CONTACT_SUBMISSION_KEY);
      if (lastTs && Date.now() - Number(lastTs) < RATE_LIMIT_COOLDOWN_MS) {
        throw new Error('Please wait a few seconds before submitting another inquiry.');
      }
    } catch (e) {
      if (e.message.includes('Please wait')) throw e;
    }

    // 3. Validation & Length limits
    const cleanName = (name || '').trim().slice(0, 150);
    const cleanEmail = (email || '').trim().slice(0, 255);
    const cleanSubject = (subject || 'General Inquiry').trim().slice(0, 200);
    const cleanMessage = (message || '').trim().slice(0, 5000);
    const cleanPhone = (phone || '').trim().slice(0, 50);

    if (cleanName.length < 2) {
      throw new Error('Please enter a valid name (at least 2 characters).');
    }

    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (cleanMessage.length < 10) {
      throw new Error('Please provide at least 10 characters in your message.');
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        phone: cleanPhone || null,
        status: 'unread',
      })
      .select()
      .single();

    if (error) {
      console.error('Contact message error:', error);
      throw new Error(error.message || 'Unable to deliver message.');
    }

    try {
      localStorage.setItem(LAST_CONTACT_SUBMISSION_KEY, Date.now().toString());
    } catch {
      // Continue
    }

    return { success: true, id: data?.id };
  },

  // Subscribe to newsletter in Supabase newsletter_subscribers table
  subscribeNewsletter: async (email, source = 'homepage', honeypot = '') => {
    if (honeypot && honeypot.trim() !== '') {
      return { success: true };
    }

    const cleanEmail = (email || '').trim().toLowerCase().slice(0, 255);
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: cleanEmail,
        status: 'subscribed',
        source: source.slice(0, 100),
        created_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.error('Newsletter error:', error);
      throw new Error(error.message || 'Unable to subscribe to updates.');
    }

    return { success: true, email: data?.email };
  },

  // Unsubscribe from newsletter
  unsubscribeNewsletter: async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('email', cleanEmail);

    if (error) {
      throw new Error(error.message || 'Failed to process unsubscribe request.');
    }

    return { success: true };
  },

  // Admin function: Get all contact messages
  getContactMessages: async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Admin function: Update message status (unread / replied / archived)
  updateMessageStatus: async (id, status, notes = null) => {
    const updateObj = { status };
    if (notes !== null) updateObj.notes = notes;

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updateObj)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin function: Get all newsletter subscribers
  getNewsletterSubscribers: async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Export subscribers to CSV string
  exportSubscribersCsv: (subscribers) => {
    const headers = ['Email', 'Status', 'Source', 'Subscribed At', 'Unsubscribed At'];
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      s.source || '',
      s.created_at || '',
      s.unsubscribed_at || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
  },
};

export default messagingService;
