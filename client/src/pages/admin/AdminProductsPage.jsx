import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewProduct, setPreviewProduct] = useState(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([
      supabaseAdminService.getProducts(),
      supabaseAdminService.getCategories(),
    ])
      .then(([prods, cats]) => {
        if (active) {
          setProducts(prods || []);
          setCategories(cats || []);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load catalog.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) {
      try {
        await supabaseAdminService.deleteProduct(id);
        setProducts((current) => current.filter((p) => p.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success(`Deleted product "${name}"`);
      } catch (err) {
        toast.error(`Unable to delete product: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (product, newStatus) => {
    try {
      const updated = await supabaseAdminService.updateProduct(product.id, {
        ...product,
        status: newStatus,
      });
      setProducts((current) =>
        current.map((p) => (p.id === product.id ? { ...p, ...updated, status: newStatus } : p))
      );
      toast.success(`Product status updated to ${newStatus}`);
    } catch (err) {
      toast.error(`Status update failed: ${err.message}`);
    }
  };

  // Safe Bulk Actions
  const handleBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${ids.length} selected product(s)?`)) return;
    }

    setIsBulkProcessing(true);
    try {
      if (action === 'delete') {
        await supabaseAdminService.bulkDeleteProducts(ids);
        setProducts((current) => current.filter((p) => !ids.includes(p.id)));
        toast.success(`Deleted ${ids.length} products`);
      } else {
        const nextStatus = action === 'publish' ? 'active' : action === 'draft' ? 'draft' : 'archived';
        await supabaseAdminService.bulkUpdateProductStatus(ids, nextStatus);
        setProducts((current) =>
          current.map((p) => (ids.includes(p.id) ? { ...p, status: nextStatus } : p))
        );
        toast.success(`Updated ${ids.length} products to ${nextStatus}`);
      }
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(`Bulk operation failed: ${err.message}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Filter calculation
  const filteredProducts = products.filter((p) => {
    // Status tab filter
    if (statusTab === 'active' && p.status !== 'active') return false;
    if (statusTab === 'draft' && p.status !== 'draft') return false;
    if (statusTab === 'archived' && p.status !== 'archived') return false;
    if (statusTab === 'low-stock' && Number(p.stockCount ?? p.stock) > Number(p.low_stock_threshold ?? p.lowStockThreshold ?? 5)) return false;

    // Category filter
    if (categoryFilter !== 'all' && p.categoryId !== categoryFilter && p.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const countActive = products.filter((p) => p.status === 'active').length;
  const countDraft = products.filter((p) => p.status === 'draft').length;
  const countArchived = products.filter((p) => p.status === 'archived').length;
  const countLowStock = products.filter((p) => Number(p.stockCount ?? p.stock) <= Number(p.low_stock_threshold ?? p.lowStockThreshold ?? 5)).length;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage inventory, publish status, pricing, variants, and leather specifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs (Shopify Style) */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-800 pb-2">
        <button
          onClick={() => { setStatusTab('all'); setSelectedIds(new Set()); }}
          className={`px-3 py-1.5 text-xs font-bold rounded transition ${
            statusTab === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => { setStatusTab('active'); setSelectedIds(new Set()); }}
          className={`px-3 py-1.5 text-xs font-bold rounded transition ${
            statusTab === 'active'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active ({countActive})
        </button>
        <button
          onClick={() => { setStatusTab('draft'); setSelectedIds(new Set()); }}
          className={`px-3 py-1.5 text-xs font-bold rounded transition ${
            statusTab === 'draft'
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Drafts ({countDraft})
        </button>
        <button
          onClick={() => { setStatusTab('archived'); setSelectedIds(new Set()); }}
          className={`px-3 py-1.5 text-xs font-bold rounded transition ${
            statusTab === 'archived'
              ? 'bg-slate-800 text-slate-300'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Archived ({countArchived})
        </button>
        <button
          onClick={() => { setStatusTab('low-stock'); setSelectedIds(new Set()); }}
          className={`px-3 py-1.5 text-xs font-bold rounded transition ${
            statusTab === 'low-stock'
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Low Stock ({countLowStock})
        </button>
      </div>

      {/* Search, Category Filter & Bulk Actions Bar */}
      <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, SKU, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-xs text-white rounded focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (Visible when 1 or more items checked) */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-950/40 border border-amber-900/60 rounded-md animate-fade-in">
            <span className="text-xs font-bold text-amber-300">
              {selectedIds.size} of {filteredProducts.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('publish')}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
              >
                Publish
              </button>
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('draft')}
                className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
              >
                Set to Draft
              </button>
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('archive')}
                className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
              >
                Archive
              </button>
              <button
                type="button"
                disabled={isBulkProcessing}
                onClick={() => handleBulkAction('delete')}
                className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        {loading && (
          <div className="p-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
            <span>Loading products from catalog...</span>
          </div>
        )}
        {error && <p role="alert" className="p-6 text-xs text-red-300">Unable to load products: {error}</p>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-400">No products match this filter or search.</p>
            <Link to="/admin/products/new" className="text-xs text-amber-500 hover:underline font-bold inline-block">
              + Create a new product
            </Link>
          </div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                      onChange={handleSelectAll}
                      className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Inventory</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map((p) => {
                  const isChecked = selectedIds.has(p.id);
                  const isLowStock = Number(p.stockCount ?? p.stock) <= Number(p.low_stock_threshold ?? p.lowStockThreshold ?? 5);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-900/50 transition ${isChecked ? 'bg-slate-900/40' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                          aria-label={`Select ${p.name}`}
                        />
                      </td>

                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80'}
                          alt=""
                          className="w-10 h-12 object-cover rounded bg-slate-800 border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/${p.id}`}
                            className="font-bold text-slate-100 hover:text-amber-400 block truncate"
                            title={p.name}
                          >
                            {p.name}
                          </Link>
                          <span className="text-slate-500 font-mono text-[10px] block">
                            SKU: {p.sku || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {p.categoryName || 'Uncategorized'}
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-200">
                        {formatCurrency(p.salePrice && Number(p.salePrice) < p.price ? p.salePrice : p.price, p.currency || 'USD')}
                        {p.salePrice && Number(p.salePrice) < p.price && (
                          <span className="block text-[10px] text-slate-500 line-through">
                            {formatCurrency(p.price, p.currency || 'USD')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            isLowStock ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span>{p.stockCount ?? p.stock} available</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={p.status || 'draft'}
                          onChange={(e) => handleStatusChange(p, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded border bg-transparent cursor-pointer ${
                            p.status === 'active'
                              ? 'text-emerald-300 border-emerald-800 bg-emerald-950/60'
                              : p.status === 'draft'
                              ? 'text-amber-300 border-amber-800 bg-amber-950/60'
                              : 'text-slate-400 border-slate-700 bg-slate-900/60'
                          }`}
                        >
                          <option value="active" className="bg-slate-900 text-emerald-300">Active</option>
                          <option value="draft" className="bg-slate-900 text-amber-300">Draft</option>
                          <option value="archived" className="bg-slate-900 text-slate-400">Archived</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Preview Modal Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Quick Preview"
                            aria-label={`Preview ${p.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Live Storefront Link */}
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800"
                            title="View on Storefront"
                            aria-label={`View ${p.name} on storefront`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit Link */}
                          <Link
                            to={`/admin/products/${p.id}`}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800"
                            title="Edit Product"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                            title="Delete Product"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Shopify-Style Preview
                </span>
                <span className="text-xs text-slate-400 font-mono">Status: {previewProduct.status}</span>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="aspect-3/4 rounded bg-slate-900 overflow-hidden border border-slate-800">
                <img
                  src={previewProduct.images?.[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'}
                  alt={previewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500">{previewProduct.categoryName || 'Leather Catalog'}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{previewProduct.name}</h3>
                  <span className="text-slate-400 font-mono text-[10px]">SKU: {previewProduct.sku}</span>
                </div>

                <div className="flex items-baseline gap-2 py-2 border-y border-slate-800">
                  <span className="text-xl font-black text-white">
                    {formatCurrency(previewProduct.price, previewProduct.currency || 'USD')}
                  </span>
                  {previewProduct.compareAtPrice && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatCurrency(previewProduct.compareAtPrice, previewProduct.currency || 'USD')}
                    </span>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {previewProduct.shortDescription || previewProduct.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 pt-2 text-slate-400">
                  <p>• Stock: <strong className="text-white">{previewProduct.stockCount ?? previewProduct.stock} units</strong></p>
                  <p>• Material: <strong className="text-white">{previewProduct.material || 'Full-Grain Leather'}</strong></p>
                  {previewProduct.sizes?.length > 0 && (
                    <p>• Sizes: <strong className="text-white">{previewProduct.sizes.join(', ')}</strong></p>
                  )}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Link
                    to={`/admin/products/${previewProduct.id}`}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                  >
                    Edit Product
                  </Link>
                  <Link
                    to={`/product/${previewProduct.slug}`}
                    target="_blank"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded transition"
                  >
                    Open Live
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
