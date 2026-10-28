import supabase from '../utils/supabase';
import { BASELINE_CATEGORIES } from '../data/baselineCatalog';

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

let cachedCategories = null;
let lastCategoriesFetch = 0;
const CACHE_TTL_MS = 60000;

const fetchActiveCategories = async () => {
  if (cachedCategories && Date.now() - lastCategoriesFetch < CACHE_TTL_MS) {
    return cachedCategories;
  }
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(CATEGORY_COLUMNS)
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase categories fetch notice:', error.message);
      cachedCategories = BASELINE_CATEGORIES;
      lastCategoriesFetch = Date.now();
      return BASELINE_CATEGORIES;
    }

    if (data && data.length > 0) {
      cachedCategories = data.map(mapCategory);
      lastCategoriesFetch = Date.now();
      return cachedCategories;
    }
    cachedCategories = BASELINE_CATEGORIES;
    lastCategoriesFetch = Date.now();
    return BASELINE_CATEGORIES;
  } catch (err) {
    console.warn('Using baseline categories fallback:', err.message);
    cachedCategories = BASELINE_CATEGORIES;
    lastCategoriesFetch = Date.now();
    return BASELINE_CATEGORIES;
  }
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
