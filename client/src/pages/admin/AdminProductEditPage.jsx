import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
  Eye,
  Globe,
  CheckCircle2,
  FileEdit,
  X,
  UploadCloud,
} from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { formatCurrency } from '../../utils/currency';
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
    description: '',
    price: 0,
    salePrice: '',
    currency: 'USD',
    categoryId: '',
    subcategoryId: '',
    gender: 'unisex',
    stockCount: 10,
    low_stock_threshold: 3,
    status: 'draft',
    material: 'Genuine Full-Grain Leather',
    leatherType: 'Cowhide',
    lining: 'Quilted Thermal Satin',
    closure: 'Heavy-Duty Brass YKK Zipper',
    fit: 'Regular Fit',
    care: 'Professional leather dry clean only',
    images: [],
    colors: [{ name: 'Black', hex: '#111111' }],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [],
    tags: ['leather', 'handcrafted'],
    seo: {
      title: '',
      description: '',
    },
    isBestSeller: false,
    isNewArrival: true,
    featured: false,
    showOnHomepage: true,
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [newSize, setNewSize] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      supabaseAdminService.getCategories(),
      isNew ? Promise.resolve(null) : supabaseAdminService.getProductById(id),
    ])
      .then(([categoryRows, product]) => {
        if (!active) return;
        setCategories(categoryRows || []);
        if (product) {
          setForm({
            ...product,
            name: product.name || '',
            slug: product.slug || '',
            sku: product.sku || '',
            short_description: product.short_description || product.shortDescription || '',
            description: product.description || '',
            price: Number(product.price) || 0,
            salePrice: product.salePrice ?? (product.compareAtPrice || ''),
            currency: product.currency || 'USD',
            categoryId: product.categoryId || product.category_id || '',
            subcategoryId: product.subcategoryId || product.subcategory_id || '',
            gender: product.gender || 'unisex',
            stockCount: Number(product.stockCount ?? product.stock ?? 10),
            low_stock_threshold: Number(product.low_stock_threshold ?? product.lowStockThreshold ?? 3),
            status: product.status || 'draft',
            material: product.material || 'Genuine Full-Grain Leather',
            leatherType: product.leatherType || product.leather_type || '',
            lining: product.lining || '',
            closure: product.closure || '',
            fit: product.fit || '',
            care: product.care || product.care_instructions || '',
            images: product.images || [],
            colors: Array.isArray(product.colors) ? product.colors : [],
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            variants: Array.isArray(product.variants) ? product.variants : [],
            tags: Array.isArray(product.tags) ? product.tags : [],
            seo: product.seo || {
              title: product.name || '',
              description: product.short_description || '',
            },
            isBestSeller: Boolean(product.isBestSeller ?? product.best_seller),
            isNewArrival: Boolean(product.isNewArrival ?? product.new_arrival),
            featured: Boolean(product.featured),
            showOnHomepage: Boolean(product.showOnHomepage ?? product.show_on_homepage),
          });
        }
      })
      .catch((err) => {
        setLoadError(err.message || 'Unable to load product editor data.');
      });
    return () => { active = false; };
  }, [id, isNew]);

  // Auto-generate slug and SEO title if untouched
  const handleNameChange = (val) => {
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || isNew ? autoSlug : prev.slug,
      seo: {
        ...prev.seo,
        title: prev.seo?.title || val,
      },
    }));
  };

  const handleSave = async (targetStatus) => {
    if (!form.name?.trim()) {
      toast.error('Product title is required.');
      return;
    }

    if (form.price < 0) {
      toast.error('Selling price cannot be negative.');
      return;
    }

    setIsLoading(true);
    try {
      const finalStatus = targetStatus || form.status || 'draft';
      const finalSlug = form.slug?.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const finalSku = form.sku?.trim() || `JAB-${Date.now().toString(36).toUpperCase()}`;

      const payload = {
        ...form,
        slug: finalSlug,
        sku: finalSku,
        status: finalStatus,
        stockCount: Number(form.stockCount) || 0,
        price: Number(form.price) || 0,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
      };

      if (isNew) {
        await supabaseAdminService.createProduct(payload);
        toast.success(`Product created as ${finalStatus === 'active' ? 'Published' : finalStatus}.`);
      } else {
        await supabaseAdminService.updateProduct(id, payload);
        toast.success(`Product updated (${finalStatus === 'active' ? 'Published' : finalStatus}).`);
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(`Unable to save product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(
        files.map((file) => supabaseAdminService.uploadProductImage(file))
      );
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded successfully.`);
    } catch (err) {
      toast.error(`Image upload notice: ${err.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setForm((prev) => {
      const nextImages = [...prev.images];
      const [chosen] = nextImages.splice(index, 1);
      nextImages.unshift(chosen);
      return { ...prev, images: nextImages };
    });
    toast.success('Primary image updated.');
  };

  const handleRemoveImage = async (url) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
    try {
      await supabaseAdminService.deleteProductImage(url);
    } catch {
      // Storage cleanup notice non-blocking
    }
    toast.success('Image removed.');
  };

  // Variants management (Generate variants from sizes & colors)
  const handleAddSize = () => {
    if (!newSize.trim()) return;
    const clean = newSize.trim().toUpperCase();
    if (!form.sizes.includes(clean)) {
      setForm((prev) => ({ ...prev, sizes: [...prev.sizes, clean] }));
    }
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName('');
  };

  const handleRemoveColor = (index) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().toLowerCase();
    if (!form.tags.includes(clean)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            aria-label="Back to products list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {isNew ? 'New Product' : form.name || 'Edit Product'}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  form.status === 'active'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : form.status === 'draft'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {form.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isNew ? 'Create and publish leather goods to your storefront' : `SKU: ${form.sku || 'Unassigned'}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold rounded transition hover:bg-slate-800"
          >
            <Eye className="w-4 h-4 text-slate-400" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded transition disabled:opacity-50"
          >
            <FileEdit className="w-4 h-4 text-amber-400" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSave('active')}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-lg disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Product</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300">
          {loadError}
        </div>
      )}

      {/* Main 8-Section Shopify Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Primary Column (8 cols): Info, Media, Pricing, Inventory, Variants, SEO */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              1. Basic Information
            </h2>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Product Title <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Vintage Cafe Racer Buffalo Leather Jacket"
                className="w-full text-sm px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Short Description (Catalog subtitle)
              </label>
              <input
                type="text"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="Brief 1-line hook, e.g. Classic asymmetrical silhouette in 1.2mm drum-dyed cowhide."
                className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Full Craftsmanship Description
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe hide origin, tanning process, lining, zippers, stitching, and pocket architecture..."
                className="w-full text-xs p-3 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Media & Imagery */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300">
                2. Product Media
              </h2>
              <span className="text-[10px] text-slate-500">
                First image is primary (thumbnail on storefront)
              </span>
            </div>

            {/* Drop / Upload Zone */}
            <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/80 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-900/50 hover:bg-slate-900">
              <UploadCloud className="w-8 h-8 text-amber-500/80" />
              <div className="text-center">
                <span className="text-xs font-bold text-white block">
                  {isUploading ? 'Uploading to Supabase Storage...' : 'Click or drop files to upload product photography'}
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG, WEBP up to 5MB each. Direct to Supabase `product-images` bucket.
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>

            {/* Gallery Grid with Primary Selector */}
            {form.images?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {form.images.map((img, idx) => (
                  <div
                    key={img}
                    className="relative group aspect-3/4 rounded-md overflow-hidden bg-slate-900 border border-slate-800"
                  >
                    <img
                      src={img}
                      alt={`Product view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge on primary */}
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-1.5 py-0.5 rounded-xs shadow">
                        Primary
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="p-1 text-slate-300 hover:text-rose-400 bg-black/50 rounded"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="w-full py-1 text-[9px] font-bold uppercase tracking-wider bg-white/90 hover:bg-white text-black rounded transition"
                        >
                          Set Primary
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Pricing */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              3. Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Price <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Compare-at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || '' })}
                    placeholder="e.g. 450.00"
                    className="w-full text-sm pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">To show strike-through discount</span>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Store Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs.)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Inventory */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              4. Inventory Management
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g. JAB-MBK-001"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Available Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stockCount}
                  onChange={(e) => setForm({ ...form, stockCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                  Low-Stock Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value, 10) || 0 })}
                  className="w-full text-sm px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Variants (Sizes & Colors) */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300">
                6. Product Variants
              </h2>
              <span className="text-[10px] text-slate-500">
                Options available to storefront shoppers
              </span>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {form.sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(s)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="e.g. XXL, 42, Custom"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
                  className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white"
                >
                  Add Size
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="pt-3 border-t border-slate-900">
              <label className="block text-xs uppercase font-bold text-slate-300 mb-2">
                Leather Finishes &amp; Color Swatches
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {form.colors.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-medium text-white"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/40"
                      style={{ backgroundColor: c.hex || '#111' }}
                    />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
                  title="Pick swatch color"
                />
                <input
                  type="text"
                  placeholder="Color name (e.g. Vintage Oxblood)"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); } }}
                  className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white shrink-0"
                >
                  Add Color
                </button>
              </div>
            </div>
          </div>

          {/* Section 7: Search Engine Optimization (SEO) */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>7. Search Engine Information (SEO)</span>
              <Globe className="w-4 h-4 text-slate-500" />
            </h2>

            {/* Google SERP Preview Card */}
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 text-left font-sans">
              <span className="text-[11px] text-emerald-400 block truncate">
                https://jableather.com/product/{form.slug || 'url-slug'}
              </span>
              <h4 className="text-sm text-sky-400 font-medium hover:underline cursor-pointer line-clamp-1">
                {form.seo?.title || form.name || 'Product Page Title — JAB Leather'}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                {form.seo?.description || form.short_description || form.description?.slice(0, 150) || 'Handcrafted leather goods from Sialkot, Pakistan.'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                  URL Handle / Slug <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">/product/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full text-xs pl-20 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                  Page SEO Title
                </label>
                <input
                  type="text"
                  value={form.seo?.title || ''}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                  placeholder="Defaults to product title"
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={form.seo?.description || ''}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                  placeholder="Meta description for search engine listings..."
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (4 cols): Status, Organization, Leather Specs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 8: Status & Publishing */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              8. Status &amp; Visibility
            </h2>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                  form.status === 'active'
                    ? 'bg-emerald-950/40 border-emerald-800 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="productStatus"
                  value="active"
                  checked={form.status === 'active'}
                  onChange={() => setForm({ ...form, status: 'active' })}
                  className="mt-0.5 text-emerald-500"
                />
                <div>
                  <span className="font-bold text-xs block text-white">Active / Published</span>
                  <span className="text-[11px] text-slate-400 block">
                    Product is publicly visible and purchasable in the storefront.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                  form.status === 'draft'
                    ? 'bg-amber-950/40 border-amber-800 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="productStatus"
                  value="draft"
                  checked={form.status === 'draft'}
                  onChange={() => setForm({ ...form, status: 'draft' })}
                  className="mt-0.5 text-amber-500"
                />
                <div>
                  <span className="font-bold text-xs block text-white">Draft</span>
                  <span className="text-[11px] text-slate-400 block">
                    Hidden from storefront and public browsing until published.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                  form.status === 'archived'
                    ? 'bg-slate-800/80 border-slate-700 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="productStatus"
                  value="archived"
                  checked={form.status === 'archived'}
                  onChange={() => setForm({ ...form, status: 'archived' })}
                  className="mt-0.5 text-slate-400"
                />
                <div>
                  <span className="font-bold text-xs block text-white">Archived</span>
                  <span className="text-[11px] text-slate-400 block">
                    Removed from sales channels; preserved in history.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 5: Organization & Categorization */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              5. Product Organization
            </h2>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={form.categoryId || ''}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">No Category Selected</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Department / Target
              </label>
              <select
                value={form.gender || 'unisex'}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="men">Men's Leather</option>
                <option value="women">Women's Leather</option>
                <option value="unisex">Unisex / Universal</option>
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. vintage, cowhide"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  className="text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Merchandising Badges */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBestSeller}
                  onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">Best Seller badge</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">New Arrival badge</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">Featured in curated highlights</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showOnHomepage}
                  onChange={(e) => setForm({ ...form, showOnHomepage: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">Feature on homepage grid</span>
              </label>
            </div>
          </div>

          {/* Artisanal Specifications */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-3.5">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
              Artisanal Leather Specifications
            </h2>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Primary Material
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Leather Grade &amp; Type
              </label>
              <input
                type="text"
                value={form.leatherType}
                onChange={(e) => setForm({ ...form, leatherType: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Lining
              </label>
              <input
                type="text"
                value={form.lining}
                onChange={(e) => setForm({ ...form, lining: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Hardware &amp; Zippers
              </label>
              <input
                type="text"
                value={form.closure}
                onChange={(e) => setForm({ ...form, closure: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-400 mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={form.care}
                onChange={(e) => setForm({ ...form, care: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-stone-900 rounded-sm max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-black text-white">
                  Storefront Preview
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  Status: <strong className="uppercase">{form.status}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 text-stone-500 hover:text-black"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
              <div className="aspect-3/4 rounded-xs overflow-hidden bg-stone-100 border border-stone-200">
                {form.images?.[0] ? (
                  <img
                    src={form.images[0]}
                    alt={form.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                    <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                    <span>No image uploaded yet</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#A66A3F] block">
                    {categories.find((c) => c.id === form.categoryId)?.name || 'Leather Catalog'}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#171717] mt-1 leading-snug">
                    {form.name || 'Untitled Leather Product'}
                  </h3>
                  <span className="text-stone-400 font-mono text-[10px] block mt-0.5">
                    SKU: {form.sku || 'N/A'}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 py-2 border-y border-stone-200">
                  <span className="text-2xl font-black text-[#171717]">
                    {formatCurrency(form.price, form.currency)}
                  </span>
                  {form.salePrice && Number(form.salePrice) > form.price && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatCurrency(form.salePrice, form.currency)}
                    </span>
                  )}
                </div>

                <p className="text-stone-600 leading-relaxed text-xs">
                  {form.short_description || form.description || 'No description provided.'}
                </p>

                {form.colors?.length > 0 && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-1.5">
                      Finish / Color
                    </label>
                    <div className="flex items-center gap-2">
                      {form.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border border-black/30 shadow-xs"
                          style={{ backgroundColor: c.hex || '#111' }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {form.sizes?.length > 0 && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-1.5">
                      Sizes
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {form.sizes.map((s) => (
                        <span key={s} className="px-2.5 py-1 text-xs font-bold border border-stone-300 rounded-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 text-stone-500 text-[11px] space-y-1">
                  <p>• Stock Availability: <strong className="text-stone-900">{form.stockCount} units</strong></p>
                  <p>• Material: <strong className="text-stone-900">{form.material}</strong></p>
                  <p>• Leather Grade: <strong className="text-stone-900">{form.leatherType || 'Full-Grain'}</strong></p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-bold rounded-xs hover:bg-stone-50"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => { setIsPreviewOpen(false); handleSave('active'); }}
                className="px-5 py-2 bg-[#171717] hover:bg-[#A66A3F] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductEditPage;
