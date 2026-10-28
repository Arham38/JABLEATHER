import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductGrid from '../../components/product/ProductGrid';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export const GenderPage = ({ gender = 'men' }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isMen = gender === 'men';
  const title = isMen ? "Men's Leather Collection" : "Women's Leather Collection";
  const subtitle = isMen
    ? "Handcrafted full-grain biker, motorcycle, flight bombers, and bespoke tailoring engineered in Sialkot."
    : "Sleek, supple vegetable-tanned lambskin jackets, cropped riders, shearling coats, and luxury leather totes.";

  const heroImage = isMen
    ? 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1600&q=85'
    : 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1600&q=85';

  useEffect(() => {
    const loadGenderData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [prodRes, cats] = await Promise.all([
          productService.getProducts({ gender, limit: 20 }),
          categoryService.getCategories(),
        ]);
        setProducts(prodRes.products);
        setCategories(cats.filter((c) => c.gender === gender || c.gender === 'unisex'));
      } catch (err) {
        console.error('Error loading gender data:', err);
        setError(err.message || 'Could not load this collection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGenderData();
  }, [gender]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: title }]} />

      {/* Hero Banner */}
      <div className="relative rounded-xs overflow-hidden border border-[#DDD8D0] bg-[#171717] text-white my-6 min-h-[280px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-45">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 p-8 sm:p-14 max-w-xl">
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
            Handcrafted in Sialkot
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Category Shortcuts Strip */}
      <div className="mb-10">
        <span className="text-xs uppercase tracking-wider font-bold text-[#6B665F] block mb-3">
          Popular {isMen ? "Men's" : "Women's"} Categories
        </span>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="px-4 py-2 bg-white hover:bg-[#171717] hover:text-white text-xs font-bold rounded-xs border border-[#DDD8D0] text-[#1C1C1C] transition whitespace-nowrap shadow-xs"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
          <span className="text-xs uppercase tracking-wider font-bold text-[#6B665F]">
            {products.length} Products Available
          </span>
        </div>

        <ProductGrid products={products} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default GenderPage;
