import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { categoryService } from '../../services/categoryService';

export const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    categoryService.getFeaturedCategories()
      .then((items) => setCategories(items.slice(0, 12)))
      .catch((err) => {
        console.warn('Could not load categories:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
            Curated Divisions
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            Shop By Category
          </h2>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#171717] hover:text-[#A66A3F] transition-colors mt-4 md:mt-0 group"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Categories Grid (Desktop 4 col, Tablet 3 col, Mobile 2 col) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading && Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="aspect-4/5 rounded-xs bg-stone-200 animate-pulse" aria-hidden="true" />
        ))}
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="group relative block aspect-4/5 bg-stone-200 overflow-hidden rounded-xs shadow-xs border border-[#DDD8D0] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Background Image */}
            {cat.image && (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* Dark Gradient Overlay for legible typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:from-black/90" />

            {/* Content Bottom Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#A66A3F] font-bold mb-1 opacity-90">
                {cat.itemCount ? `${cat.itemCount} Designs` : 'Genuine Leather'}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#A66A3F] transition-colors">
                {cat.name}
              </h3>
              <div className="flex items-center text-[11px] font-semibold text-stone-300 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                <span>Explore Designs</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByCategory;
