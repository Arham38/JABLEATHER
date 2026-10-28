import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService
      .getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message || 'Unable to load products.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await supabaseAdminService.deleteProduct(id);
        setProducts((current) => current.filter((product) => product.id !== id));
        toast.success(`Deleted product ${name}`);
      } catch (err) {
        toast.error(`Unable to delete product: ${err.message}`);
      }
    }
  };

  const handleStatusToggle = async (product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await supabaseAdminService.updateProduct(product.id, { ...product, status: nextStatus });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...updated, status: nextStatus } : item));
      toast.success(`Product ${nextStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(`Unable to update product status: ${err.message}`);
    }
  };

  const filteredProducts = products.filter(
    (p) => (statusFilter === 'all' || p.status === statusFilter)
      && `${p.name} ${p.sku || ''} ${p.categoryName || ''} ${p.slug}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Product Catalog</h1>
          <p className="text-xs text-slate-400">
            Manage inventory, pricing, specifications, and leather variants.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Search and Quick Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-4 border border-slate-800 rounded-lg">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-xs text-white rounded focus:outline-none focus:border-amber-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto text-xs px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredProducts.length}</span> of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        {loading && <p className="p-6 text-xs text-slate-400">Loading products from Supabase...</p>}
        {error && <p role="alert" className="p-6 text-xs text-red-300">Unable to load products: {error}</p>}
        {!loading && !error && filteredProducts.length === 0 && <p className="p-6 text-xs text-slate-400">No products match this search or status filter.</p>}
        {!loading && !error && filteredProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || undefined}
                      alt=""
                      className="w-10 h-12 object-cover rounded bg-slate-800 border border-slate-700 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-100 block">{p.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">{p.sku}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-400">{p.categoryName}</td>

                  <td className="py-3 px-4 font-bold text-slate-200">
                    {formatCurrency(p.salePrice && Number(p.salePrice) < p.price ? p.salePrice : p.price, p.currency)}
                    {p.salePrice && Number(p.salePrice) < p.price && (
                      <span className="block text-[10px] text-slate-500 line-through">
                        {formatCurrency(p.price, p.currency)}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        p.stockCount < 10 ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      {p.stockCount} in stock
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                        p.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-white"
                        title="View Live"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={() => handleStatusToggle(p)} className="text-[10px] text-slate-400 hover:text-amber-400" title={p.status === 'active' ? 'Deactivate product' : 'Activate product'}>
                        {p.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="p-1.5 text-slate-400 hover:text-amber-400"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-red-400"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
