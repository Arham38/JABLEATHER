export const mediaService = {
  getMediaLibrary: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [
      { id: 'm-1', title: 'Biker Jacket Shoot 1', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', size: '1.2 MB', category: 'Products' },
      { id: 'm-2', title: 'Atelier Women Rider', url: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=800&q=80', size: '1.8 MB', category: 'Products' },
      { id: 'm-3', title: 'Sialkot Workshop Stitching', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', size: '2.4 MB', category: 'Workshop' },
      { id: 'm-4', title: 'Natural Veg-Tan Hide', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', size: '980 KB', category: 'Materials' },
      { id: 'm-5', title: 'Weekender Travel Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', size: '1.5 MB', category: 'Products' },
      { id: 'm-6', title: 'Motorcycle Highway Highway', url: 'https://images.unsplash.com/photo-1509539662397-116cb90542f1?auto=format&fit=crop&w=800&q=80', size: '2.1 MB', category: 'Hero' },
    ];
  },

  mockUpload: async (file) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id: 'm-' + Date.now(),
      title: file.name,
      url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      category: 'Uploads',
    };
  },
};

export default mediaService;
