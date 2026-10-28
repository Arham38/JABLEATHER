import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminProductEditPage = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    short_description: '',
    price: 0,
    salePrice: '',
    currency: 'PKR',
    categoryId: '',
    subcategoryId: '',
    gender: 'unisex',
    stockCount: 0,
    low_stock_threshold: 5,
    status: 'draft',
    material: '',
    leatherType: '',
    lining: '',
    closure: '',
    fit: '',
    care: '',
    description: '',
    images: [],
    colors: [],
    sizes: [],
    isBestSeller: false,
    isNewArrival: false,
    featured: false,
    showOnHomepage: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      supabaseAdminService.getCategories(),
      isNew ? Promise.resolve(null) : supabaseAdminService.getProductById(id),
    ])
      .then(([categoryRows, product]) => {
        if (!active) return;
        setCategories(categoryRows);
        if (product) setForm((current) => ({ ...current, ...product }));
      })
      .catch((err) => setLoadError(err.message || 'Unable to load product editor data.'));
    return () => { active = false; };
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error('Product name is required.');
      return;
    }

    setIsLoading(true);
    try {
      const slug = form.slug?.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const payload = { ...form, slug };
      if (isNew) await supabaseAdminService.createProduct(payload);
      else await supabaseAdminService.updateProduct(id, payload);
      toast.success(isNew ? 'Product saved successfully.' : 'Product updated successfully.');
      navigate('/admin/products');
    } catch (err) {
      toast.error(`Unable to save product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map((file) => supabaseAdminService.uploadProductImage(file)));
      setForm((current) => ({ ...current, images: [...(current.images || []), ...urls] }));
      toast.success(`${urls.length} image${urls.length === 1 ? '' : 's'} uploaded.`);
    } catch (err) {
      toast.error(`Unable to upload image: ${err.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleImageRemove = async (url) => {
    if (!window.confirm('Remove this image from the product and Storage?')) return;
    try {
      await supabaseAdminService.deleteProductImage(url);
      setForm((current) => ({ ...current, images: current.images.filter((image) => image !== url) }));
      toast.success('Image removed.');
    } catch (err) {
      toast.error(`Unable to remove image: ${err.message}`);
    }
  };

  const handleListField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value.split(',').map((item) => item.trim()).filter(Boolean) }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 text-slate-400 hover:text-white rounded">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {isNew ? 'Create New Product' : `Edit: ${form.name}`}
            </h1>
            <p className="text-xs text-slate-400">
              Configure product details, specifications, and pricing.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
        </button>
      </div>

      {loadError && <p role="alert" className="text-sm text-red-300">Unable to load editor data: {loadError}</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              General Information
            </h3>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sialkot Masterpiece Biker Jacket"
                className="w-full text-sm px-3 py-2.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="text-xs text-slate-300">Slug<input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white" required /></label>
              <label className="text-xs text-slate-300">SKU<input value={form.sku || ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white" /></label>
              <label className="text-xs text-slate-300">Gender<select value={form.gender || 'unisex'} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select></label>
            </div>

            <label className="block text-xs uppercase font-bold text-slate-300">Short description<textarea rows={2} value={form.short_description || ''} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="mt-1 w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded text-white" /></label>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the cut, leather thickness, lining, and craftsmanship details..."
                className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Sale Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.salePrice || ''}
                  onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || '' })}
                  placeholder="Optional sale price"
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Stock Units Available
                </label>
                <input
                  type="number"
                  value={form.stockCount ?? 0}
                  onChange={(e) => setForm({ ...form, stockCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs uppercase font-bold text-slate-300">Currency<input value={form.currency || 'PKR'} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white" maxLength={3} /></label>
              <label className="block text-xs uppercase font-bold text-slate-300">Low stock threshold<input type="number" min="0" value={form.low_stock_threshold ?? 5} onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white" /></label>
            </div>
          </div>

          {/* Leather Specifications */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              Leather Specifications (Artisanal Sialkot Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Primary Material
                </label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Leather Grade & Thickness
                </label>
                <input
                  type="text"
                  value={form.leatherType || ''}
                  onChange={(e) => setForm({ ...form, leatherType: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Interior Lining
                </label>
                <input
                  type="text"
                  value={form.lining}
                  onChange={(e) => setForm({ ...form, lining: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Zippers & Hardware
                </label>
                <input
                  type="text"
                  value={form.closure}
                  onChange={(e) => setForm({ ...form, closure: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy & Media (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Classification */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              Taxonomy
            </h3>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
                className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="">No category</option>
                {categories.filter((category) => !category.parent_id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">Subcategory</label>
              <select value={form.subcategoryId || ''} onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })} className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded text-white">
                <option value="">None</option>
                {categories.filter((category) => category.parent_id === form.categoryId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBestSeller || false}
                  onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>Best Seller Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewArrival || false}
                  onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                  className="rounded text-amber-500"
                />
                <span>New Arrival Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.status === 'active'}
                  onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })}
                  className="rounded text-amber-500"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured || false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded text-amber-500" />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.showOnHomepage || false} onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })} className="rounded text-amber-500" />
                <span>Show on homepage</span>
              </label>
            </div>

            <label className="block text-xs uppercase font-bold text-slate-300">Colors (comma-separated)<input value={(form.colors || []).join(', ')} onChange={(e) => handleListField('colors', e.target.value)} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white" /></label>
            <label className="block text-xs uppercase font-bold text-slate-300">Sizes (comma-separated)<input value={(form.sizes || []).join(', ')} onChange={(e) => handleListField('sizes', e.target.value)} className="mt-1 w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white" /></label>
          </div>

          {/* Image Preview */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              Product Photography
            </h3>
            <label className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-700 rounded text-xs text-slate-200 cursor-pointer hover:border-amber-500">
              <ImageIcon className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload product images'}</span>
              <input type="file" accept="image/*" multiple disabled={isUploading} onChange={handleImageUpload} className="sr-only" />
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(form.images || []).map((image) => (
                <div key={image} className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded">
                  <img src={image} alt="Product" className="w-14 h-16 object-cover rounded" />
                  <span className="flex-1 min-w-0 truncate text-[10px] text-slate-400">{image.split('/').pop()}</span>
                  <button type="button" onClick={() => handleImageRemove(image)} className="p-2 text-slate-400 hover:text-red-400" aria-label="Remove image"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {form.images?.length === 0 && <p className="text-xs text-slate-500">No product images uploaded.</p>}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEditPage;
