import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, ChevronDown, User, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    shop: false,
    men: false,
    women: false,
    leatherGoods: false,
    collections: false,
  });

  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { openSearch } = useUI();
  const { customer, isAuthenticated } = useAuth();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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
            {itemCount > 0 && (
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
                to="/account/wishlist"
                className="flex items-center gap-1.5 text-[#1C1C1C] font-semibold hover:text-[#A66A3F]"
              >
                <Heart className="w-4 h-4 text-[#A66A3F]" />
                <span>Wishlist ({wishlistCount})</span>
              </Link>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {/* Home */}
              <div>
                <Link
                  to="/"
                  className="block py-2 text-base font-bold text-[#171717] hover:text-[#A66A3F]"
                >
                  Home
                </Link>
              </div>

              {/* Accordion: Men */}
              <div className="border-b border-stone-100 pb-2">
                <button
                  onClick={() => toggleAccordion('men')}
                  className="w-full py-2 flex items-center justify-between text-base font-bold text-[#171717] hover:text-[#A66A3F] text-left"
                >
                  <span>Men's Leather</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAccordions.men ? 'rotate-180 text-[#A66A3F]' : ''
                    }`}
                  />
                </button>
                {openAccordions.men && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-[#6B665F]">
                    <Link to="/men" className="block hover:text-[#171717] py-1 font-medium">All Men's</Link>
                    <Link to="/category/biker-jackets" className="block hover:text-[#171717] py-1">Biker Jackets</Link>
                    <Link to="/category/motorcycle-jackets" className="block hover:text-[#171717] py-1">Motorcycle Jackets</Link>
                    <Link to="/category/bomber-jackets" className="block hover:text-[#171717] py-1">Bomber Jackets</Link>
                    <Link to="/category/aviator-jackets" className="block hover:text-[#171717] py-1">Aviator & Shearling</Link>
                    <Link to="/category/leather-blazers" className="block hover:text-[#171717] py-1">Leather Blazers</Link>
                    <Link to="/category/vests" className="block hover:text-[#171717] py-1">Riding Vests</Link>
                  </div>
                )}
              </div>

              {/* Accordion: Women */}
              <div className="border-b border-stone-100 pb-2">
                <button
                  onClick={() => toggleAccordion('women')}
                  className="w-full py-2 flex items-center justify-between text-base font-bold text-[#171717] hover:text-[#A66A3F] text-left"
                >
                  <span>Women's Leather</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAccordions.women ? 'rotate-180 text-[#A66A3F]' : ''
                    }`}
                  />
                </button>
                {openAccordions.women && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-[#6B665F]">
                    <Link to="/women" className="block hover:text-[#171717] py-1 font-medium">All Women's</Link>
                    <Link to="/category/womens-jackets" className="block hover:text-[#171717] py-1">Tailored Jackets</Link>
                    <Link to="/category/biker-jackets" className="block hover:text-[#171717] py-1">Asymmetric Riders</Link>
                    <Link to="/category/bags" className="block hover:text-[#171717] py-1">Leather Totes</Link>
                  </div>
                )}
              </div>

              {/* Accordion: Leather Goods */}
              <div className="border-b border-stone-100 pb-2">
                <button
                  onClick={() => toggleAccordion('leatherGoods')}
                  className="w-full py-2 flex items-center justify-between text-base font-bold text-[#171717] hover:text-[#A66A3F] text-left"
                >
                  <span>Leather Goods & Accessories</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAccordions.leatherGoods ? 'rotate-180 text-[#A66A3F]' : ''
                    }`}
                  />
                </button>
                {openAccordions.leatherGoods && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-[#6B665F]">
                    <Link to="/category/bags" className="block hover:text-[#171717] py-1">Weekender Bags & Luggage</Link>
                    <Link to="/category/belts-wallets" className="block hover:text-[#171717] py-1">Solid Brass Belts</Link>
                    <Link to="/category/belts-wallets" className="block hover:text-[#171717] py-1">Saddle-Stitched Wallets</Link>
                    <Link to="/category/accessories" className="block hover:text-[#171717] py-1">Hats & Gloves</Link>
                  </div>
                )}
              </div>

              {/* Accordion: Collections */}
              <div className="border-b border-stone-100 pb-2">
                <button
                  onClick={() => toggleAccordion('collections')}
                  className="w-full py-2 flex items-center justify-between text-base font-bold text-[#171717] hover:text-[#A66A3F] text-left"
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAccordions.collections ? 'rotate-180 text-[#A66A3F]' : ''
                    }`}
                  />
                </button>
                {openAccordions.collections && (
                  <div className="pl-3 py-2 space-y-2 text-sm text-[#6B665F]">
                    <Link to="/best-sellers" className="block hover:text-[#171717] py-1">Best Sellers</Link>
                    <Link to="/new-arrivals" className="block hover:text-[#171717] py-1">New Arrivals</Link>
                    <Link to="/collections/riding-collection" className="block hover:text-[#171717] py-1">Riding Gear</Link>
                    <Link to="/collections/cowhide-collection" className="block hover:text-[#171717] py-1">Cowhide Collection</Link>
                    <Link to="/collections/custom-collection" className="block hover:text-[#171717] py-1">Custom & Wholesale B2B</Link>
                  </div>
                )}
              </div>

              {/* Static links */}
              <div>
                <Link to="/shop" className="block py-2 text-base font-bold text-[#171717] hover:text-[#A66A3F]">
                  All Products
                </Link>
              </div>
              <div>
                <Link to="/about" className="block py-2 text-base font-bold text-[#171717] hover:text-[#A66A3F]">
                  About Our Workshop
                </Link>
              </div>
              <div>
                <Link to="/contact" className="block py-2 text-base font-bold text-[#171717] hover:text-[#A66A3F]">
                  Contact & Custom Quotes
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
