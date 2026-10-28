import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { collectionService } from '../../services/collectionService';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export const CollectionPage = ({ forcedSlug = null }) => {
  const params = useParams();
  const location = useLocation();

  // Determine collection slug from prop or url param or path
  let collectionSlug = forcedSlug || params.slug;
  if (!collectionSlug) {
    if (location.pathname.includes('/best-sellers')) collectionSlug = 'best-sellers';
    else if (location.pathname.includes('/new-arrivals')) collectionSlug = 'new-arrivals';
    else collectionSlug = 'the-leather-collection';
  }

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const col = await collectionService.getCollectionBySlug(collectionSlug);
        setCollection(col);

        let prods = [];
        if (collectionSlug === 'best-sellers') {
          prods = await productService.getBestSellers(20);
        } else if (collectionSlug === 'new-arrivals') {
          prods = await productService.getNewArrivals(20);
        } else {
          const res = await productService.getProducts({ limit: 20 });
          prods = res.products;
        }
        setProducts(prods);
      } catch (err) {
        console.error('Error loading collection:', err);
        setError(err.message || 'Could not load this collection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [collectionSlug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: collection?.name || 'Collection' }]} />

      {/* Collection Banner */}
      {collection && (
        <div className="relative rounded-xs overflow-hidden border border-[#DDD8D0] bg-[#171717] text-white my-6 min-h-[260px] flex items-center">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src={collection.bannerImage}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
              {collection.tagline}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
              {collection.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {collection.description}
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="pt-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
          <span className="text-xs uppercase tracking-wider font-bold text-[#6B665F]">
            {products.length} Curated Items
          </span>
        </div>

        <ProductGrid products={products} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default CollectionPage;
