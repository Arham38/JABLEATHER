import React from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';
import Button from '../common/Button';

export const ProductGrid = ({
  products = [],
  isLoading = false,
  error = '',
  emptyMessage = 'No products found matching your selected criteria.',
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="text-center py-12 px-4 my-6 border border-red-200 bg-red-50 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-xs border border-[#DDD8D0] my-6">
        <h3 className="text-lg font-bold text-[#171717] mb-2">No Products Available</h3>
        <p className="text-sm text-[#6B665F] max-w-md mx-auto mb-6">
          {emptyMessage}
        </p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
