export const catalogService = {
  getCatalogDetails: () => ({
    title: 'JAB Leather Export & Wholesale Catalog 2026',
    edition: 'Spring/Summer & Permanent Classics',
    totalPages: 48,
    format: 'PDF (Interactive High-Res)',
    fileSize: '14.2 MB',
    downloadUrl: '#catalog-download-placeholder',
  }),

  requestCatalogEmail: async (email, companyName) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      success: true,
      message: `The official JAB Leather export catalog link has been dispatched to ${email}.`,
    };
  },
};

export default catalogService;
