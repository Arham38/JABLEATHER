import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { categoryService } from '../../services/categoryService';

export const MegaMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    categoryService.getCategories()
      .then((cats) => {
        if (active) {
          // Filter to active categories that should be shown in navbar
          const visible = (cats || []).filter((c) => c.status === 'active' && c.show_in_navbar !== false);
          setCategories(visible);
        }
      })
      .catch((err) => console.warn('Could not load categories in MegaMenu:', err));
    return () => { active = false; };
  }, [isOpen]);

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

  // Group categories logically into columns, while ensuring every category is rendered
  const jacketGroup = categories.filter((c) =>
    ['mens-leather-jackets', 'womens-leather-jackets', 'leather-vests', 'leather-coats', 'mens-jackets', 'womens-jackets', 'biker-jackets', 'bomber-jackets'].includes(c.slug)
  );

  const motorcycleGroup = categories.filter((c) =>
    ['motorcycle-leather-suits', 'leather-pants', 'leather-gloves'].includes(c.slug)
  );

  const goodsGroup = categories.filter((c) =>
    ['leather-bags', 'leather-wallets', 'leather-belts', 'leather-accessories', 'bags-luggage'].includes(c.slug)
  );

  const bespokeGroup = categories.filter((c) =>
    ['cowhide-rugs', 'custom-leather-products', 'wholesale-orders'].includes(c.slug)
  );

  // Catch any newly added or custom admin categories not matched in predefined buckets
  const coveredSlugs = new Set([
    ...jacketGroup.map((c) => c.slug),
    ...motorcycleGroup.map((c) => c.slug),
    ...goodsGroup.map((c) => c.slug),
    ...bespokeGroup.map((c) => c.slug),
  ]);
  const otherCategories = categories.filter((c) => !coveredSlugs.has(c.slug));

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-full bg-white border-b border-[#DDD8D0] shadow-2xl z-50 animate-fade-in"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Jackets & Vests */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#A66A3F]">
                Outerwear &amp; Vests
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              {jacketGroup.length > 0 ? (
                jacketGroup.map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="hover:text-[#A66A3F] transition-colors flex items-center justify-between group py-0.5"
                    >
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                        {cat.name}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-400">Loading outerwear...</li>
              )}
            </ul>
          </div>

          {/* Column 2: Motorcycle & Riding Gear */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#A66A3F]">
                Motorcycle &amp; Riding
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              {motorcycleGroup.length > 0 ? (
                motorcycleGroup.map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="hover:text-[#A66A3F] transition-colors flex items-center justify-between group py-0.5"
                    >
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                        {cat.name}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-400">Loading riding gear...</li>
              )}
            </ul>
          </div>

          {/* Column 3: Leather Goods & Accessories */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#A66A3F]">
                Goods &amp; Accessories
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              {goodsGroup.length > 0 ? (
                goodsGroup.map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      to={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="hover:text-[#A66A3F] transition-colors flex items-center justify-between group py-0.5"
                    >
                      <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                        {cat.name}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-400">Loading leather goods...</li>
              )}
            </ul>
          </div>

          {/* Column 4: Specialty, Bespoke & Wholesale */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[#A66A3F]">
                Bespoke &amp; Specialty
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-[#1C1C1C]">
              {bespokeGroup.map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="hover:text-[#A66A3F] transition-colors flex items-center justify-between group py-0.5"
                  >
                    <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                      {cat.name}
                    </span>
                    {(cat.slug === 'custom-leather-products' || cat.slug === 'wholesale-orders') && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-xs">
                        B2B / MTM
                      </span>
                    )}
                  </Link>
                </li>
              ))}

              {/* Dynamic admin-added categories that don't match the 4 standard groups */}
              {otherCategories.map((cat) => (
                <li key={cat.id || cat.slug}>
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="hover:text-[#A66A3F] transition-colors flex items-center justify-between group py-0.5"
                  >
                    <span className="font-medium group-hover:translate-x-0.5 transition-transform">
                      {cat.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Featured Atelier Spotlight */}
          <div className="bg-stone-50 border border-stone-200 rounded-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A66A3F] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atelier Sialkot</span>
              </div>
              <h4 className="text-sm font-extrabold text-[#171717] leading-snug mb-2">
                Genuine Full-Grain Hides &amp; Artisan Craftsmanship
              </h4>
              <p className="text-xs text-[#6B665F] leading-relaxed mb-4">
                Explore our full catalog of handcrafted leather apparel, accessories, and bespoke goods.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-200">
              <Link
                to="/shop"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-[#171717] hover:bg-[#A66A3F] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/category/custom-leather-products"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 border border-stone-300 hover:border-black text-[#171717] text-xs font-semibold rounded-xs transition-colors bg-white"
              >
                <span>Request Custom Order</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
