import React from 'react';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export const ProductFilters = ({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  selectedGender = 'all',
  onSelectGender,
  priceRange = [0, 1000],
  onSelectPriceRange,
  selectedLeatherType = '',
  onSelectLeatherType,
  inStockOnly = false,
  currency = 'USD',
  onToggleInStock,
  onResetAll,
}) => {
  const leatherTypes = [
    'All Types',
    'Cowhide',
    'Lambskin',
    'Goatskin',
    'Vegetable-Tanned',
    'Shearling',
    'Suede',
  ];

  const priceOptions = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: `Under ${formatCurrency(100, currency)}`, min: 0, max: 100 },
    { label: `${formatCurrency(100, currency)} to ${formatCurrency(250, currency)}`, min: 100, max: 250 },
    { label: `${formatCurrency(250, currency)} to ${formatCurrency(400, currency)}`, min: 250, max: 400 },
    { label: `${formatCurrency(400, currency)} & Above`, min: 400, max: Infinity },
  ];

  return (
    <div className="space-y-6 text-sm text-[#1C1C1C]">
      {/* Active Filters / Reset Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD8D0]">
        <span className="font-bold text-xs uppercase tracking-wider text-[#171717]">
          Filter Products
        </span>
        <button
          onClick={onResetAll}
          className="text-xs text-[#A66A3F] hover:underline font-semibold"
        >
          Reset All
        </button>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#6B665F] mb-2.5">
          Department
        </h4>
        <div className="flex flex-wrap gap-2">
          {['all', 'men', 'women'].map((g) => (
            <button
              key={g}
              onClick={() => onSelectGender(g)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xs border transition capitalize ${
                selectedGender === g
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-white text-[#1C1C1C] border-[#DDD8D0] hover:border-black'
              }`}
            >
              {g === 'all' ? 'All' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#6B665F] mb-2.5">
          Category
        </h4>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
              selectedCategory === 'all'
                ? 'font-bold text-[#A66A3F]'
                : 'text-[#6B665F] hover:text-[#171717]'
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'font-bold text-[#A66A3F]'
                  : 'text-[#6B665F] hover:text-[#171717]'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#6B665F] mb-2.5">
          Price Range
        </h4>
        <div className="space-y-1.5">
          {priceOptions.map((opt, idx) => {
            const isSelected =
              priceRange[0] === opt.min && priceRange[1] === opt.max;
            return (
              <button
                key={idx}
                onClick={() => onSelectPriceRange([opt.min, opt.max])}
                className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'font-bold text-[#A66A3F]'
                    : 'text-[#6B665F] hover:text-[#171717]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leather Type Filter */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#6B665F] mb-2.5">
          Leather Type
        </h4>
        <div className="space-y-1.5">
          {leatherTypes.map((type) => {
            const isSelected =
              type === 'All Types'
                ? !selectedLeatherType
                : selectedLeatherType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                onClick={() =>
                  onSelectLeatherType(type === 'All Types' ? '' : type)
                }
                className={`w-full text-left py-1 text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'font-bold text-[#A66A3F]'
                    : 'text-[#6B665F] hover:text-[#171717]'
                }`}
              >
                <span>{type}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* In Stock Only Checkbox */}
      <div className="pt-2 border-t border-[#DDD8D0]">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1C1C1C]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 rounded-xs border-[#DDD8D0] text-[#171717] focus:ring-[#171717]"
          />
          <span>In-Stock Only</span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
