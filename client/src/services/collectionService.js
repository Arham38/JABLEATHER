import supabase from '../utils/supabase';

export const collectionService = {
  // Fetch active collections from Supabase collections table
  getCollections: async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((c) => ({
        id: c.id,
        name: c.title,
        title: c.title,
        slug: c.slug,
        description: c.description || '',
        image: c.image || '',
        bannerImage: c.banner_image || c.image || '',
        sortOrder: c.sort_order || 0,
      }));
    } catch (err) {
      console.warn('Could not load collections from Supabase:', err.message);
      return [
        {
          id: 'c-biker',
          name: 'Biker & Moto Classics',
          title: 'Biker & Moto Classics',
          slug: 'biker-classics',
          description: 'Rugged, tailored asymmetric leather riding jackets.',
          image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
        },
        {
          id: 'c-bomber',
          name: 'Aviator & Shearling Bombers',
          title: 'Aviator & Shearling Bombers',
          slug: 'aviator-shearling',
          description: 'Heavyweight sheepskin shearling jackets designed for arctic cold and timeless style.',
          image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop',
        },
      ];
    }
  },

  // Lookup single collection by slug
  getCollectionBySlug: async (slug) => {
    if (!slug) throw new Error('Collection slug is required.');

    // Virtual collection fallbacks
    if (slug === 'best-sellers') {
      return {
        id: 'virt-best-sellers',
        name: 'Atelier Best Sellers',
        title: 'Atelier Best Sellers',
        slug: 'best-sellers',
        description: 'Our most celebrated handcrafted leather jackets, exported globally.',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
      };
    }

    if (slug === 'new-arrivals') {
      return {
        id: 'virt-new-arrivals',
        name: 'New Season Arrivals',
        title: 'New Season Arrivals',
        slug: 'new-arrivals',
        description: 'Fresh leather cuts, vintage washed finishes, and modern tailoring.',
        image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&auto=format&fit=crop',
      };
    }

    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.title,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          image: data.image || '',
          bannerImage: data.banner_image || data.image || '',
        };
      }
    } catch {
      // Continue to fallback
    }

    return {
      id: slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      slug,
      description: 'Exclusive handcrafted leather goods from our Sialkot workshop.',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop',
    };
  },
};

export default collectionService;
