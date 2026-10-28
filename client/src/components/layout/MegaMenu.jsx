import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const MegaMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-full bg-white border-b border-[#DDD8D0] shadow-xl z-50 animate-fade-in"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-5 gap-8">
          {/* Column 1: Men */}
          <div>
            <Link
              to="/men"
              onClick={onClose}
              className="text-xs uppercase tracking-wider font-bold text-[#A66A3F] mb-4 flex items-center group"
            >
              <span>Men</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-0.5" />
            </Link>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              <li>
                <Link to="/category/biker-jackets" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Jackets
                </Link>
              </li>
              <li>
                <Link to="/category/vests" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Vests
                </Link>
              </li>
              <li>
                <Link to="/category/bags" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Bags
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pants&gender=men" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Pants
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shorts&gender=men" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Shorts
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Women */}
          <div>
            <Link
              to="/women"
              onClick={onClose}
              className="text-xs uppercase tracking-wider font-bold text-[#A66A3F] mb-4 flex items-center group"
            >
              <span>Women</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-0.5" />
            </Link>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              <li>
                <Link to="/category/womens-jackets" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Jackets
                </Link>
              </li>
              <li>
                <Link to="/category/vests" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Vests
                </Link>
              </li>
              <li>
                <Link to="/category/bags" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Bags
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Leather Goods */}
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#171717] mb-4 block">
              Leather Goods
            </span>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              <li>
                <Link to="/category/bags" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Bags
                </Link>
              </li>
              <li>
                <Link to="/category/belts-wallets" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Belts
                </Link>
              </li>
              <li>
                <Link to="/category/belts-wallets" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Wallets
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Hats
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Collections */}
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-[#171717] mb-4 block">
              Collections
            </span>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              <li>
                <Link to="/best-sellers" onClick={onClose} className="hover:text-[#A66A3F] transition font-medium">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" onClick={onClose} className="hover:text-[#A66A3F] transition font-medium">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/collections/riding-collection" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Riding Collection
                </Link>
              </li>
              <li>
                <Link to="/collections/cowhide-collection" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Cowhide Collection
                </Link>
              </li>
              <li>
                <Link to="/collections/custom-collection" onClick={onClose} className="hover:text-[#A66A3F] transition">
                  Custom Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Featured Spotlight Card */}
          <div className="bg-[#F7F5F0] p-4 rounded-sm border border-[#DDD8D0] flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A66A3F] block mb-1">
                Workshop Highlight
              </span>
              <h4 className="text-sm font-bold text-[#171717] leading-snug mb-2">
                Handcrafted in Sialkot, Pakistan
              </h4>
              <p className="text-xs text-[#6B665F] line-clamp-3 mb-3">
                Full-grain drum-dyed leather, precision saddle stitching, and antique solid brass hardware.
              </p>
            </div>
            <Link
              to="/about"
              onClick={onClose}
              className="text-xs font-bold text-[#171717] hover:text-[#A66A3F] flex items-center group transition"
            >
              <span>Our Artisanal Story</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
