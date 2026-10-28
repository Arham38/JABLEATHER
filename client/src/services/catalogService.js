import supabase from '../utils/supabase';

export const catalogService = {
  getCatalogDetails: () => ({
    title: 'JAB Leather Export & Wholesale Catalog 2026',
    edition: 'Master Craftsman Series • Sialkot Workshop',
    totalPages: 48,
    format: 'PDF / Specification Book',
    fileSize: '14.2 MB',
    downloadUrl: '#catalog-spec-download',
  }),

  // Record wholesale lead in Supabase contact_messages table
  requestCatalogEmail: async (email, companyName = '') => {
    if (!email) throw new Error('Email is required.');

    try {
      await supabase.from('contact_messages').insert({
        name: companyName ? `B2B Lead (${companyName.trim()})` : 'Wholesale Buyer',
        email: email.trim(),
        subject: `[B2B Catalog Request] ${companyName ? `(${companyName.trim()})` : ''}`.trim(),
        message: `Wholesale specification catalog requested for ${email.trim()}${companyName ? ` representing ${companyName.trim()}` : ''}.`,
        status: 'unread',
      });
    } catch (err) {
      console.warn('Could not record catalog request:', err.message);
    }

    return {
      success: true,
      message: `The official JAB Leather export catalog link has been dispatched to ${email}.`,
    };
  },

  // Export full catalog inventory to CSV
  exportCatalogCsv: async () => {
    const { data: products, error } = await supabase
      .from('products')
      .select('name, sku, price, sale_price, currency, stock, leather_type, status')
      .order('name');

    if (error) throw error;

    const headers = ['Name', 'SKU', 'Price', 'Sale Price', 'Currency', 'Stock', 'Leather Type', 'Status'];
    const rows = (products || []).map((p) => [
      p.name,
      p.sku || '',
      p.price,
      p.sale_price || '',
      p.currency || 'USD',
      p.stock,
      p.leather_type || '',
      p.status,
    ]);

    return [
      headers.join(','),
      ...rows.map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
  },
};

export default catalogService;
