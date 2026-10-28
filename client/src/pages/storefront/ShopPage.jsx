import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Pagination from '../../components/common/Pagination';
import Drawer from '../../components/common/Drawer';
import Button from '../../components/common/Button';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter & sorting states
  const [categories, setCategories] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  // Active filters
  const categoryParam = searchParams.get('category') || 'all';
  const genderParam = searchParams.get('gender') || 'all';
  const sortParam = searchParams.get('sort') || 'featured';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const leatherTypeParam = searchParams.get('leatherType') || '';
  const inStockParam = searchParams.get('inStock') === 'true';

  const [priceRange, setPriceRange] = useState([0, Infinity]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

  // Load categories
  useEffect(() => {
    categoryService.getCategories()
      .then(setCategories)
      .catch((err) => setCatalogError(err.message || 'Could not load categories.'));
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchFiltered = async () => {
      setIsLoading(true);
      setCatalogError('');
      try {
        const res = await productService.getProducts({
          category: categoryParam !== 'all' ? categoryParam : null,
          gender: genderParam !== 'all' ? genderParam : null,
          sort: sortParam,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          leatherType: leatherTypeParam || null,
          inStockOnly: inStockParam,
          page: pageParam,
          limit: 12,
        });

        setProducts(res.products);
        setCurrency(res.currency);
        setTotalCount(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Error fetching shop products:', err);
        setCatalogError(err.message || 'Could not load products.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiltered();
  }, [categoryParam, genderParam, sortParam, priceRange, leatherTypeParam, inStockParam, pageParam]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setPriceRange([0, Infinity]);
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'best-selling', label: 'Best Selling' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Shop All Products' }]} />

      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between py-6 border-b border-[#DDD8D0] mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#A66A3F] block mb-1">
            Handcrafted Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            All Leather Products
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6B665F] mt-2 md:mt-0 font-medium">
          Showing <span className="text-[#171717] font-bold">{totalCount}</span> genuine leather products
        </p>
      </div>

      {/* Mobile Filter & Sort Control Buttons */}
      <div className="lg:hidden flex items-center gap-3 mb-6">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex-1 py-3 px-4 bg-white border border-[#DDD8D0] rounded-xs text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#A66A3F]" />
          <span>Filters</span>
        </button>

        <button
          onClick={() => setIsSortDrawerOpen(true)}
          className="flex-1 py-3 px-4 bg-white border border-[#DDD8D0] rounded-xs text-xs font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center justify-center gap-2"
        >
          <ArrowUpDown className="w-4 h-4 text-[#A66A3F]" />
          <span>Sort</span>
        </button>
      </div>

      {/* Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-xs border border-[#DDD8D0] sticky top-28">
          <ProductFilters
            categories={categories}
            selectedCategory={categoryParam}
            onSelectCategory={(cat) => updateParam('category', cat)}
            selectedGender={genderParam}
            onSelectGender={(g) => updateParam('gender', g)}
            priceRange={priceRange}
            currency={currency}
            onSelectPriceRange={(range) => setPriceRange(range)}
            selectedLeatherType={leatherTypeParam}
            onSelectLeatherType={(type) => updateParam('leatherType', type)}
            inStockOnly={inStockParam}
            onToggleInStock={(checked) => updateParam('inStock', checked ? 'true' : 'false')}
            onResetAll={handleResetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {/* Desktop Sort Bar */}
          <div className="hidden lg:flex items-center justify-end gap-3 mb-6 pb-3 border-b border-stone-200">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B665F]">
              Sort By:
            </span>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs bg-white border border-[#DDD8D0] rounded-xs px-3 py-2 font-medium text-[#1C1C1C] focus:outline-none focus:border-[#171717]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            error={catalogError}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination */}
          <Pagination
            currentPage={pageParam}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Products"
        side="bottom"
      >
        <div className="pb-8">
          <ProductFilters
            categories={categories}
            selectedCategory={categoryParam}
            onSelectCategory={(cat) => {
              updateParam('category', cat);
              setIsFilterDrawerOpen(false);
            }}
            selectedGender={genderParam}
            onSelectGender={(g) => {
              updateParam('gender', g);
              setIsFilterDrawerOpen(false);
            }}
            priceRange={priceRange}
            currency={currency}
            onSelectPriceRange={(range) => {
              setPriceRange(range);
              setIsFilterDrawerOpen(false);
            }}
            selectedLeatherType={leatherTypeParam}
            onSelectLeatherType={(type) => {
              updateParam('leatherType', type);
              setIsFilterDrawerOpen(false);
            }}
            inStockOnly={inStockParam}
            onToggleInStock={(checked) => {
              updateParam('inStock', checked ? 'true' : 'false');
              setIsFilterDrawerOpen(false);
            }}
            onResetAll={() => {
              handleResetFilters();
              setIsFilterDrawerOpen(false);
            }}
          />
        </div>
      </Drawer>

      {/* Mobile Sort Bottom Sheet */}
      <Drawer
        isOpen={isSortDrawerOpen}
        onClose={() => setIsSortDrawerOpen(false)}
        title="Sort Products"
        side="bottom"
      >
        <div className="space-y-2 py-4">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                updateParam('sort', opt.value);
                setIsSortDrawerOpen(false);
              }}
              className={`w-full py-3 px-4 text-left text-sm font-semibold rounded-xs transition ${
                sortParam === opt.value
                  ? 'bg-[#171717] text-white'
                  : 'text-[#1C1C1C] hover:bg-stone-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

export default ShopPage;
