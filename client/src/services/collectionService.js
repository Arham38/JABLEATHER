import { mockCollections } from '../data/mockCollections';

export const collectionService = {
  getCollections: async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    return [...mockCollections];
  },

  getCollectionBySlug: async (slug) => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    const col = mockCollections.find((c) => c.slug === slug);
    if (!col) throw new Error(`Collection not found: ${slug}`);
    return col;
  },
};

export default collectionService;
