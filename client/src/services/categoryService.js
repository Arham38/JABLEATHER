import supabase from '../utils/supabase';

const CATEGORY_COLUMNS = 'id,legacy_id,name,slug,description,image,parent_id,aliases,show_in_navbar,sort_order,status,created_at,updated_at';

const mapCategory = (row) => ({
  id: row.id,
  legacyId: row.legacy_id,
  name: row.name,
  slug: row.slug,
  gender: row.slug.startsWith('mens-') ? 'men' : row.slug.startsWith('womens-') ? 'women' : 'unisex',
  description: row.description || '',
  image: row.image || '',
  itemCount: null,
  featured: Boolean(row.show_in_navbar),
  parentId: row.parent_id,
  aliases: row.aliases || [],
  sortOrder: row.sort_order,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const fetchActiveCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST200' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      console.warn('Supabase categories table not found in schema cache. Run supabase/all_migrations_combined.sql in your Supabase SQL Editor.');
      return [];
    }
    throw new Error(`Could not load categories: ${error.message}`);
  }
  return (data || []).map(mapCategory);
};

export const categoryService = {
  getCategories: fetchActiveCategories,

  getCategoryBySlug: async (slug) => {
    const categories = await fetchActiveCategories();
    const cat = categories.find((category) => category.slug === slug);
    if (!cat) throw new Error(`Category not found: ${slug}`);
    return cat;
  },

  getFeaturedCategories: async () => {
    const categories = await fetchActiveCategories();
    return categories.filter((category) => category.featured);
  },
};

export default categoryService;
