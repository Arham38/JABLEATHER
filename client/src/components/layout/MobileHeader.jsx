import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, ChevronDown, User, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';

export const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openAccordions, setOpenAccordions] = useState({
    shop: true,
    men: false,
    women: false,
    collections: false,
  });

  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useUI();
  const { customer, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    categoryService.getCategories()
      .then((cats) => {
        if (active) {
          setCategories((cats || []).filter((c) => c.status === 'active'));
        }
      })
      .catch((err) => console.warn('Could not load mobile categories:', err));
    return () => { active = false; };
  }, [isOpen]);

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsOpen(false);
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleAccordion = (section) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DDD8D0]">
      {/* Mobile Top Bar */}
      <div className="px-4 py-3.5 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex flex-col">
          <span className="text-xl font-extrabold tracking-tight text-[#171717]">
            JAB LEATHER
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-[#6B665F] font-semibold">
            Sialkot • Pakistan
          </span>
        </Link>

        {/* Right: Search, Cart, Hamburger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={openSearch}
            className="p-2 text-[#1C1C1C] hover:text-[#A66A3F] focus:outline-none"
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={openCart}
            className="relative p-2 text-[#1C1C1C] hover:text-[#A66A3F] focus:outline-none"
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {isAuthenticated && itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#171717] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-[#1C1C1C] hover:text-[#A66A3F] focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Slide-out Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-fade-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#DDD8D0] flex items-center justify-between bg-[#F7F5F0]">
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#171717]">JAB LEATHER</span>
                <span className="text-[9px] uppercase tracking-widest text-[#6B665F]">Navigation</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#6B665F] hover:text-[#171717] focus:outline-none"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Quick Bar */}
            <div className="px-5 py-3.5 bg-stone-50 border-b border-[#DDD8D0] flex items-center justify-between text-xs">
              <Link
                to={isAuthenticated ? '/account' : '/account/login'}
                className="flex items-center gap-2 text-[#1C1C1C] font-semibold hover:text-[#A66A3F]"
              >
                <User className="w-4 h-4 text-[#A66A3F]" />
                <span>{isAuthenticated ? customer?.name : 'Sign In / Register'}</span>
              </Link>
              <Link
                to={isAuthenticated ? '/account/wishlist' : '/account/login'}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 text-[#1C1C1C] font-semibold hover:text-[#A66A3F]"
              >
                <Heart className={`w-4 h-4 ${isAuthenticated && wishlistCount > 0 ? 'text-rose-600 fill-rose-600' : 'text-[#A66A3F]'}`} />
                <span>Wishlist ({isAuthenticated ? wishlistCount : 0})</span>
              </Link>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {/* Home */}
              <div>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-base font-bold text-[#171717] hover:text-[#A66A3F]"
                >
                  Home
                </Link>
              </div>

              {/* Accordion: All Categories */}
              <div className="border-b border-stone-200 pb-2">
                <button
                  onClick={() => toggleAccordion('shop')}
                  className="w-full py-2 flex items-center justify-between text-base font-bold text-[#171717] hover:text-[#A66A3F] text-left"
                >
                  <span className="flex items-center gap-2">
                    <span>Shop All Categories</span>
                    <span className="text-[10px] font-bold bg-[#A66A3F]/15 text-[#A66A3F] px-1.5 py-0.5 rounded-xs">
                      {categories.length}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAccordions.shop ? 'rotate-180 text-[#A66A3F]' : ''
                    }`}
                  />
                </button>
                {openAccordions.shop && (
                  <div className="pl-2 py-2 space-y-1.5 text-sm text-[#6B665F]">
                    <Link
                      to="/shop"
                      onClick={() => setIsOpen(false)}
                      className="block py-1.5 px-2 font-bold text-[#A66A3F] hover:bg-stone-50 rounded-xs"
                    >
                      Browse Entire Catalog →
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id || cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="block py-1.5 px-2 hover:text-[#171717] hover:bg-stone-50 rounded-xs transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Shortcut Links */}
              <div className="border-b border-stone-100 pb-2 space-y-1">
                <Link
                  to="/men"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#1C1C1C] hover:text-[#A66A3F]"
                >
                  Men's Collection
                </Link>
                <Link
                  to="/women"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#1C1C1C] hover:text-[#A66A3F]"
                >
                  Women's Collection
                </Link>
                <Link
                  to="/best-sellers"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#1C1C1C] hover:text-[#A66A3F]"
                >
                  Best Sellers
                </Link>
                <Link
                  to="/new-arrivals"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#1C1C1C] hover:text-[#A66A3F]"
                >
                  New Arrivals
                </Link>
              </div>

              {/* Informational */}
              <div className="space-y-1">
                <Link
                  to="/about"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#1C1C1C] hover:text-[#A66A3F]"
                >
                  About Our Sialkot Atelier
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block py-2 text-sm font-semibold text-[#1C1C1C] hover:text-[#A66A3F]"
                >
                  Custom Orders &amp; Wholesale B2B
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-[#DDD8D0] bg-[#F7F5F0] text-xs text-[#6B665F]">
              <p className="font-semibold text-[#171717] mb-1">Sialkot, Pakistan</p>
              <p>Custom OEM & Wholesale Manufacturing</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;
