import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import MegaMenu from './MegaMenu';

export const Header = () => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useUI();
  const { customer, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsMegaMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-shadow duration-300 border-b border-[#DDD8D0] ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col group py-1">
              <span className="text-2xl sm:text-[26px] font-black tracking-[-0.03em] text-[#121212] group-hover:text-[#A66A3F] transition-colors leading-none">
                JAB LEATHER
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-[#8A5832] font-bold mt-1">
                Sialkot • Atelier Est. 2026
              </span>
            </Link>
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link
              to="/"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Home
            </Link>

            {/* Shop with Mega Menu dropdown trigger */}
            <div
              className="relative py-2"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
            >
              <Link
                to="/shop"
                className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] flex items-center gap-1 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMegaMenuOpen ? 'rotate-180 text-[#A66A3F]' : ''
                  }`}
                />
              </Link>
            </div>

            <Link
              to="/men"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Men
            </Link>
            <Link
              to="/women"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Women
            </Link>
            <Link
              to="/best-sellers"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Best Sellers
            </Link>
            <Link
              to="/new-arrivals"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              New Arrivals
            </Link>
            <Link
              to="/about"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              About Atelier
            </Link>
            <Link
              to="/contact"
              className="text-xs uppercase tracking-widest font-bold text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#A66A3F] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Contact
            </Link>
          </nav>

          {/* Right Ecommerce Controls */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="text-[#1C1C1C] hover:text-[#A66A3F] p-2 rounded-full hover:bg-stone-100/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 group cursor-pointer"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </button>

            {/* Account Link */}
            <Link
              to={isAuthenticated ? '/account' : '/account/login'}
              className="inline-flex items-center gap-1.5 text-[#1C1C1C] hover:text-[#A66A3F] px-2.5 py-1.5 rounded-full hover:bg-stone-100/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 group"
              aria-label={isAuthenticated ? `Account: ${customer?.name}` : 'Sign in'}
            >
              <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {isAuthenticated && (
                <span className="text-[11px] font-bold text-stone-900 max-w-[90px] truncate">
                  {customer?.firstName || customer?.name?.split(' ')[0] || 'Account'}
                </span>
              )}
            </Link>

            {/* Wishlist Link (Fixed for unauthenticated + customer scoping) */}
            <Link
              to={isAuthenticated ? '/account/wishlist' : '/account/login'}
              className="relative text-[#1C1C1C] hover:text-rose-600 p-2 rounded-full hover:bg-rose-50/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 group"
              aria-label={isAuthenticated ? `Wishlist with ${wishlistCount} items` : 'Sign in to access wishlist'}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${
                  isAuthenticated && wishlistCount > 0
                    ? 'fill-rose-600 text-rose-600'
                    : 'text-stone-800'
                }`}
              />
              {isAuthenticated && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative text-[#1C1C1C] hover:text-[#A66A3F] p-2 rounded-full hover:bg-stone-100/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 group cursor-pointer"
              aria-label={`Shopping bag with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {isAuthenticated && itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#121212] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Mega Menu Dropdown */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
      />
    </header>
  );
};

export default Header;
