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

  // Close mega menu on route change
  useEffect(() => {
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

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
            <Link to="/" className="flex flex-col group">
              <span className="text-2xl font-extrabold tracking-[-0.03em] text-[#171717] group-hover:text-[#A66A3F] transition-colors">
                JAB LEATHER
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#6B665F] font-semibold">
                Sialkot • Pakistan
              </span>
            </Link>
          </div>

          {/* Desktop Center Navigation */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link
              to="/"
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
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
                className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] flex items-center gap-1 transition-colors"
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
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
            >
              Men
            </Link>
            <Link
              to="/women"
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
            >
              Women
            </Link>
            <Link
              to="/best-sellers"
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
            >
              Best Sellers
            </Link>
            <Link
              to="/new-arrivals"
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
            >
              New Arrivals
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-[#1C1C1C] hover:text-[#A66A3F] transition-colors py-2"
            >
              Contact
            </Link>
          </nav>

          {/* Right Ecommerce Controls */}
          <div className="hidden lg:flex items-center space-x-5">
            {/* Search Trigger */}
            <button
              onClick={openSearch}
              className="text-[#1C1C1C] hover:text-[#A66A3F] p-2 rounded-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Link */}
            <Link
              to={isAuthenticated ? '/account' : '/account/login'}
              className="text-[#1C1C1C] hover:text-[#A66A3F] p-2 rounded-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label={isAuthenticated ? `Account: ${customer?.name}` : 'Sign in'}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/account/wishlist"
              className="relative text-[#1C1C1C] hover:text-[#A66A3F] p-2 rounded-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#A66A3F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative text-[#1C1C1C] hover:text-[#A66A3F] p-2 rounded-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label={`Shopping bag with ${itemCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#171717] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
