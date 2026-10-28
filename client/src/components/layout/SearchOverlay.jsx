import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/currency';
import { storage } from '../../utils/storage';

const RECENT_SEARCHES_KEY = 'jab_recent_searches';

export const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
      setRecentSearches(storage.get(RECENT_SEARCHES_KEY, ['Biker Jacket', 'Weekender Duffel', 'Belts', 'Lambskin']));
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  // Live search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    const timeout = setTimeout(async () => {
      try {
        const { products } = await productService.getProducts({ search: query, limit: 5 });
        setResults(products);
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Could not search the catalog.');
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearchSubmit = (searchQuery) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    // Save to recents
    const existing = storage.get(RECENT_SEARCHES_KEY, []);
    const updated = [q.trim(), ...existing.filter((s) => s.toLowerCase() !== q.trim().toLowerCase())].slice(0, 6);
    storage.set(RECENT_SEARCHES_KEY, updated);
    setRecentSearches(updated);

    closeSearch();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeSearch}
      />

      {/* Search Container Panel */}
      <div className="relative max-w-3xl mx-auto mt-12 sm:mt-20 px-4 z-10 animate-fade-in">
        <div className="bg-white rounded-sm shadow-2xl border border-[#DDD8D0] overflow-hidden">
          {/* Top Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit();
            }}
            className="flex items-center px-6 py-4 border-b border-[#DDD8D0] bg-[#F7F5F0]"
          >
            <Search className="w-5 h-5 text-[#A66A3F] shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search leather jackets, bags, vests, wallets, accessories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-base bg-transparent text-[#1C1C1C] placeholder-[#6B665F]/60 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-stone-400 hover:text-black p-1 mr-2"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeSearch}
              className="text-xs uppercase font-bold tracking-wider text-[#6B665F] hover:text-[#171717] px-2 py-1 rounded-sm"
            >
              ESC
            </button>
          </form>

          {/* Body Section */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Live Search Results */}
            {query.trim() !== '' ? (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-bold uppercase tracking-wider text-[#6B665F]">
                  <span>Product Results ({results.length})</span>
                  {isLoading && <span className="animate-pulse">Searching...</span>}
                </div>

                {error ? (
                  <p role="alert" className="py-6 text-center text-sm text-red-700">{error}</p>
                ) : results.length > 0 ? (
                  <div className="space-y-3">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 p-2 rounded-sm hover:bg-stone-50 transition border border-transparent hover:border-[#DDD8D0]"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-14 h-16 object-cover rounded-xs border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#171717] truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[#6B665F] truncate">{product.categoryName}</p>
                          <p className="text-xs font-bold text-[#A66A3F] mt-0.5">
                            {formatCurrency(product.price, product.currency)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                      </Link>
                    ))}

                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-3 mt-2 text-xs uppercase font-bold tracking-wider text-[#171717] bg-stone-100 hover:bg-stone-200 rounded-sm text-center transition"
                    >
                      View All Results for "{query}"
                    </button>
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8 text-sm text-[#6B665F]">
                    No products matched "<span className="font-semibold text-[#171717]">{query}</span>".
                    <div className="mt-2 text-xs">
                      Try searching for "Biker", "Bomber", "Belt", "Duffel", or "Cowhide".
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Suggestions & Recent Searches when query is empty */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Searches */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B665F] mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearchSubmit(s)}
                        className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 rounded-sm text-[#1C1C1C] transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B665F] mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#A66A3F]" />
                    <span>Popular Categories</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <Link
                      to="/category/biker-jackets"
                      onClick={closeSearch}
                      className="block text-[#1C1C1C] hover:text-[#A66A3F] transition"
                    >
                      Biker & Motorcycle Jackets
                    </Link>
                    <Link
                      to="/category/bomber-jackets"
                      onClick={closeSearch}
                      className="block text-[#1C1C1C] hover:text-[#A66A3F] transition"
                    >
                      Flight & Bomber Jackets
                    </Link>
                    <Link
                      to="/category/bags"
                      onClick={closeSearch}
                      className="block text-[#1C1C1C] hover:text-[#A66A3F] transition"
                    >
                      Weekender Leather Bags
                    </Link>
                    <Link
                      to="/category/belts-wallets"
                      onClick={closeSearch}
                      className="block text-[#1C1C1C] hover:text-[#A66A3F] transition"
                    >
                      Full-Grain Belts & Wallets
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
