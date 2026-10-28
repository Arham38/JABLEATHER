import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductGrid from '../../components/product/ProductGrid';
import Breadcrumbs from '../../components/common/Breadcrumbs';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (prevQuery !== query) {
    setPrevQuery(query);
    setInputVal(query);
  }

  useEffect(() => {
    if (!query.trim()) return;

    let isMounted = true;
    const runSearch = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { products: fetched } = await productService.getProducts({
          search: query,
          limit: 24,
        });
        if (isMounted) setProducts(fetched);
      } catch (err) {
        if (isMounted) {
          console.error('Search query error:', err);
          setError(err.message || 'Could not search the catalog.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    runSearch();
    return () => {
      isMounted = false;
    };
  }, [query]);

  const displayedProducts = query.trim() ? products : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Search Results' }]} />

      {/* Search Header Bar */}
      <div className="max-w-2xl mx-auto py-10 text-center">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171717] mb-6">
          Search the JAB Leather Catalog
        </h1>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-[#A66A3F]" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search biker jackets, travel bags, vests, wallets..."
            className="w-full text-sm pl-12 pr-28 py-3.5 bg-white border border-[#DDD8D0] rounded-xs shadow-xs focus:outline-none focus:border-[#171717]"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 bg-[#171717] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs transition"
          >
            Search
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-[#6B665F]">
          <span>Popular:</span>
          {['Biker', 'Bomber', 'Aviator', 'Duffel', 'Belt', 'Lambskin', 'Riding'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setInputVal(term);
                setSearchParams({ q: term });
              }}
              className="px-2.5 py-1 bg-stone-200/70 hover:bg-stone-300 rounded-xs text-[#1C1C1C] transition"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {query && (
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
          <p className="text-xs uppercase tracking-wider font-bold text-[#6B665F]">
            Showing results for "<span className="text-[#171717]">{query}</span>" ({displayedProducts.length} found)
          </p>
        </div>
      )}

      {/* Grid */}
      <ProductGrid
        products={displayedProducts}
        isLoading={isLoading}
        error={error}
        emptyMessage={`No products found matching "${query}". Try checking your spelling or searching for a generic category like "Jackets" or "Bags".`}
      />
    </div>
  );
};

export default SearchPage;
