import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductGrid from '../product/ProductGrid';

export const FeaturedCollectionSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productService.getFeatured(4)
      .then(setFeaturedProducts)
      .catch((err) => setError(err.message || 'Could not load featured products.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#171717] text-white rounded-xs p-8 sm:p-12 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#A66A3F] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            The Leather Collection
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
            Explore timeless leather styles for everyday wear, riding, travel, and modern fashion. Handcrafted from full-grain hides in our Sialkot workshop.
          </p>
        </div>

        <div className="relative z-10">
          <Link
            to="/collections/the-leather-collection"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-[#A66A3F] hover:bg-[#8e5832] text-white text-sm font-bold rounded-xs transition gap-2 shadow-md"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Ambient subtle decorative circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-[#A66A3F]/10 pointer-events-none blur-3xl" />
      </div>

      {/* Featured Grid */}
      <ProductGrid
        products={featuredProducts}
        isLoading={isLoading}
        error={error}
        emptyMessage="No featured products are currently available."
      />
    </section>
  );
};

export default FeaturedCollectionSection;
