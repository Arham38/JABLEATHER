import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useUI } from '../../context/UIContext';
import { formatCurrency, calculateDiscountPercentage } from '../../utils/currency';
import Badge from '../common/Badge';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
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
    if (!isAuthenticated) {
      toast.warning('Please sign in to add items to your shopping bag.');
      navigate('/account/login');
      return;
    }
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
    if (!isAuthenticated) {
      toast.warning('Please sign in to your account to save favorites.');
      navigate('/account/login');
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-sm border border-stone-200/90 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-stone-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame with Luxury Dual-Image Preview */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-3/4 bg-stone-100 overflow-hidden"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
            isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            loading="lazy"
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {discount > 0 && <Badge variant="sale">Save {discount}%</Badge>}
          {!product.inStock && <Badge variant="default">Out of Stock</Badge>}
        </div>

        {/* Luxury Favorite Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-white text-rose-600 shadow-md ring-1 ring-rose-200 scale-105 active:scale-95'
              : 'bg-white/85 backdrop-blur-md text-stone-600 hover:text-rose-600 hover:bg-white shadow-xs hover:shadow-md hover:scale-105 active:scale-95'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              isWishlisted ? 'fill-rose-600 stroke-rose-600' : 'stroke-stone-700'
            }`}
          />
        </button>

        {/* Desktop Hover Quick Action Bar */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
          <button
            onClick={handleQuickView}
            className="flex-1 min-h-[40px] px-3 bg-white/95 backdrop-blur-md hover:bg-[#121212] hover:text-white text-xs uppercase tracking-wider font-bold text-[#121212] rounded-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="w-10 h-10 bg-[#121212] hover:bg-black text-white rounded-xs shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
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
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="uppercase tracking-widest font-extrabold text-[#A66A3F] text-[10px] truncate">
              {product.categoryName || 'Fine Leather'}
            </span>
            {product.rating != null && (
              <div className="flex items-center gap-1 text-amber-600 shrink-0">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="font-bold text-stone-900 text-xs">{product.rating}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-sm font-bold text-[#121212] hover:text-[#A66A3F] transition-colors line-clamp-1 mb-1"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Leather Specs Tagline */}
          <p className="text-[11px] text-stone-500 line-clamp-1 font-medium">
            {product.leatherType || product.material || 'Genuine Artisan Leather'}
          </p>
        </div>

        {/* Pricing & Mobile Action */}
        <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-extrabold text-[#121212]">
              {formatCurrency(product.price, product.currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={handleQuickView}
              className="p-2 text-stone-700 hover:text-black rounded-xs bg-stone-100 active:bg-stone-200 transition-colors"
              aria-label="Quick view product"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="p-2 bg-[#121212] text-white rounded-xs active:bg-black transition-colors disabled:opacity-50"
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
