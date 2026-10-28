import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategoryAndProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cat = await categoryService.getCategoryBySlug(slug);
        setCategory(cat);

        const { products } = await productService.getProducts({
          category: slug,
          limit: 24,
        });
        setProducts(products);
      } catch (err) {
        console.error('Error loading category:', err);
        setError(err.message || 'Category not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryAndProducts();
  }, [slug]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-[#171717] mb-4">Category Not Found</h2>
        <p className="text-sm text-[#6B665F] mb-6">
          The leather category "{slug}" could not be located.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#171717] text-white text-xs font-bold uppercase tracking-wider rounded-xs"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Shop', to: '/shop' },
          { label: category?.name || slug },
        ]}
      />

      {/* Category Hero / Header */}
      {category && (
        <div className="relative rounded-xs overflow-hidden border border-[#DDD8D0] bg-[#171717] text-white my-6">
          <div className="absolute inset-0 z-0 opacity-40">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          </div>

          <div className="relative z-10 p-8 sm:p-14 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-2">
              JAB Leather Division
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg">
              {category.description}
            </p>
          </div>
        </div>
      )}

      {/* Product Grid Area */}
      <div className="pt-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
          <span className="text-xs uppercase tracking-wider font-bold text-[#6B665F]">
            Showing {products.length} Designs
          </span>
          <Link
            to="/shop"
            className="text-xs font-bold text-[#171717] hover:text-[#A66A3F]"
          >
            Explore All Categories →
          </Link>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyMessage={`No products are currently available in the ${category?.name || slug} category.`}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
