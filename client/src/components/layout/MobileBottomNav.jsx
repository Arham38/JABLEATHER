import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useUI();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DDD8D0] shadow-lg safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center transition-colors ${
            isActive('/') ? 'text-[#A66A3F]' : 'text-[#6B665F] hover:text-[#171717]'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center transition-colors ${
            isActive('/shop') ? 'text-[#A66A3F]' : 'text-[#6B665F] hover:text-[#171717]'
          }`}
        >
          <Compass className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium tracking-tight">Shop</span>
        </Link>

        {/* 3. Search */}
        <button
          onClick={openSearch}
          className="flex flex-col items-center justify-center text-[#6B665F] hover:text-[#171717] transition-colors"
          aria-label="Open search dialog"
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium tracking-tight">Search</span>
        </button>

        {/* 4. Wishlist */}
        <Link
          to="/account/wishlist"
          className={`relative flex flex-col items-center justify-center transition-colors ${
            isActive('/account/wishlist') ? 'text-[#A66A3F]' : 'text-[#6B665F] hover:text-[#171717]'
          }`}
        >
          <Heart className="w-5 h-5 mb-1" />
          {wishlistCount > 0 && (
            <span className="absolute top-2 right-4 bg-[#A66A3F] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] font-medium tracking-tight">Wishlist</span>
        </Link>

        {/* 5. Cart */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center text-[#6B665F] hover:text-[#171717] transition-colors"
          aria-label="Open cart drawer"
        >
          <ShoppingBag className="w-5 h-5 mb-1" />
          {itemCount > 0 && (
            <span className="absolute top-2 right-4 bg-[#171717] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
          <span className="text-[10px] font-medium tracking-tight">Cart</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
