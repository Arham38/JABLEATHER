import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/currency';
import Badge from '../common/Badge';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useUI();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const isWishlisted = isInWishlist(product.id);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, {
      size: product.sizes?.[0] || 'Standard',
      color: product.colors?.[0] || null,
      quantity: 1,
    });
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xs border border-[#DDD8D0] overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#171717]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-3/4 bg-stone-100 overflow-hidden"
      >
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {discount > 0 && <Badge variant="sale">Save {discount}%</Badge>}
          {!product.inStock && <Badge variant="default">Out of Stock</Badge>}
        </div>

        {/* Wishlist Button (Always accessible top right) */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isWishlisted
              ? 'bg-white text-red-600'
              : 'bg-white/80 backdrop-blur-xs text-stone-700 hover:bg-white hover:text-black'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600' : ''}`} />
        </button>

        {/* Desktop Hover Quick Action Bar */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickView}
            className="flex-1 min-h-[40px] px-3 bg-white/95 backdrop-blur-xs hover:bg-[#171717] hover:text-white text-xs font-bold text-[#171717] rounded-xs shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="w-10 h-10 bg-[#171717] hover:bg-black text-white rounded-xs shadow-md flex items-center justify-center transition disabled:opacity-50"
            aria-label="Quick add to bag"
            title="Add to bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#6B665F] mb-1">
            <span className="uppercase tracking-wider font-semibold truncate">
              {product.categoryName}
            </span>
            {product.rating != null && (
              <div className="flex items-center gap-1 text-amber-600 shrink-0">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="font-bold text-stone-900">{product.rating}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-bold text-[#171717] hover:text-[#A66A3F] transition-colors line-clamp-1 mb-1.5"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Leather Specs Tagline */}
          <p className="text-[11px] text-[#6B665F] line-clamp-1">
            {product.leatherType || product.material}
          </p>
        </div>

        {/* Pricing & Mobile Action */}
        <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-[#171717]">
              {formatCurrency(product.price, product.currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add / Quick View trigger */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={handleQuickView}
              className="p-2 text-stone-600 hover:text-black rounded-xs bg-stone-100"
              aria-label="Quick view product"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="p-2 bg-[#171717] text-white rounded-xs disabled:opacity-50"
              aria-label="Add to bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
