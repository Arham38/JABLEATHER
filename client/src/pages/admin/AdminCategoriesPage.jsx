import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Search,
  ExternalLink,
} from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parent_id: '',
    aliases: [],
    show_in_navbar: true,
    sort_order: 0,
    status: 'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    let active = true;
    supabaseAdminService.getCategories()
      .then((data) => {
        if (active) setCategories(data || []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Unable to load categories.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const beginCreate = () => {
    setEditingCategory(null);
    setIsCreating(true);
    setForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      parent_id: '',
      aliases: [],
      show_in_navbar: true,
      sort_order: categories.length + 1,
      status: 'active',
    });
  };

  const beginEdit = (category) => {
    setEditingCategory(category.id);
    setIsCreating(false);
    setForm({
      ...category,
      parent_id: category.parent_id || '',
      aliases: category.aliases || [],
      sort_order: Number(category.sort_order) || 0,
    });
  };

  const handleNameChange = (val) => {
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || !editingCategory ? autoSlug : prev.slug,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await supabaseAdminService.uploadProductImage(file);
      setForm((prev) => ({ ...prev, image: url }));
      toast.success('Category banner image uploaded.');
    } catch (err) {
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      const slug = form.slug?.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const payload = {
        ...form,
        slug,
        id: editingCategory || undefined,
        sort_order: Number(form.sort_order) || 0,
      };

      const saved = await supabaseAdminService.saveCategory(payload);
      setCategories((current) => {
        const next = editingCategory
          ? current.map((c) => (c.id === saved.id ? saved : c))
          : [...current, saved];
        return next.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
      });

      setEditingCategory(null);
      setIsCreating(false);
      toast.success(editingCategory ? 'Category updated successfully.' : 'New category created successfully.');
    } catch (err) {
      toast.error(`Unable to save category: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete category "${name}"?\n\nSafe Protection: Any products assigned to this category will be preserved and unassigned (category set to None).`
      )
    ) {
      try {
        await supabaseAdminService.deleteCategory(id);
        setCategories((current) => current.filter((category) => category.id !== id));
        toast.success(`Deleted category "${name}" safely.`);
      } catch (err) {
        toast.error(`Unable to delete category: ${err.message}`);
      }
    }
  };

  const toggleStatus = async (category) => {
    const nextStatus = category.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await supabaseAdminService.saveCategory({
        ...category,
        status: nextStatus,
      });
      setCategories((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(`Category "${category.name}" marked ${nextStatus}.`);
    } catch (err) {
      toast.error(`Unable to update category status: ${err.message}`);
    }
  };

  const handleReorder = async (category, direction) => {
    const currentOrder = Number(category.sort_order) || 0;
    const newOrder = direction === 'up' ? Math.max(0, currentOrder - 1) : currentOrder + 1;
    try {
      const updated = await supabaseAdminService.saveCategory({
        ...category,
        sort_order: newOrder,
      });
      setCategories((current) =>
        current
          .map((c) => (c.id === updated.id ? updated : c))
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
      );
      toast.success(`Updated sort order for ${category.name}`);
    } catch (err) {
      toast.error(`Reorder notice: ${err.message}`);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return c.name?.toLowerCase().includes(q) || c.slug?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Categories &amp; Taxonomy</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage storefront collections, mega menu navigation structure, and leather departments.
          </p>
        </div>
        <button
          onClick={editingCategory || isCreating ? () => { setEditingCategory(null); setIsCreating(false); } : beginCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>{editingCategory || isCreating ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {/* Category Create / Edit Form Drawer/Card */}
      {(editingCategory || isCreating) && (
        <form onSubmit={handleSave} className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4 max-w-2xl animate-fade-in shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <span className="text-[10px] text-amber-500 font-mono">
              {form.slug ? `/category/${form.slug}` : 'Auto-generating slug'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                Category Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Leather Vests"
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                URL Handle / Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe this category for collection pages and SEO..."
              className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Image URL or Upload */}
          <div className="space-y-2">
            <label className="block text-xs uppercase font-bold text-slate-300">
              Banner / Thumbnail Image
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/... or upload"
                className="flex-1 text-xs p-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
              />
              <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
            </div>
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="w-24 h-14 object-cover rounded border border-slate-700 mt-2"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                Parent Category
              </label>
              <select
                value={form.parent_id || ''}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
                className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="">No Parent (Top Level)</option>
                {categories.filter((c) => c.id !== editingCategory).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                Navigation Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
                className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-slate-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full text-xs p-2 bg-slate-900 border border-slate-700 rounded text-white"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_in_navbar}
                onChange={(e) => setForm({ ...form, show_in_navbar: e.target.checked })}
                className="rounded text-amber-500 focus:ring-0"
              />
              <span>Display in Desktop Mega Menu &amp; Mobile Navigation</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { setEditingCategory(null); setIsCreating(false); }}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-950 p-4 border border-slate-800 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search categories by name, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-xs text-white rounded focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredCategories.length}</strong> categories
        </div>
      </div>

      {/* Categories Card Grid */}
      {loading && (
        <div className="p-8 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-2" />
          <span>Loading categories...</span>
        </div>
      )}

      {error && <p role="alert" className="p-4 text-xs text-red-300 bg-red-950/40 rounded border border-red-800">{error}</p>}

      {!loading && !error && filteredCategories.length === 0 && (
        <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">No categories found.</p>
        </div>
      )}

      {!loading && !error && filteredCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id || cat.slug}
              className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg flex flex-col justify-between gap-4 transition group"
            >
              <div className="flex items-start gap-3.5">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-14 h-14 object-cover rounded bg-slate-800 border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                    <FolderTree className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-sm font-bold text-white truncate" title={cat.name}>
                      {cat.name}
                    </h4>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                        cat.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    /category/{cat.slug}
                  </p>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Card Footer: Reorder & Controls */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="font-mono">Order: {cat.sort_order ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => handleReorder(cat, 'up')}
                    className="p-1 hover:text-white rounded hover:bg-slate-800"
                    title="Move up in order"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(cat, 'down')}
                    className="p-1 hover:text-white rounded hover:bg-slate-800"
                    title="Move down in order"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Edit, Storefront & Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleStatus(cat)}
                    className="text-[10px] text-slate-400 hover:text-amber-400 px-1 py-0.5"
                  >
                    {cat.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>

                  <a
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                    title="View on Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => beginEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
