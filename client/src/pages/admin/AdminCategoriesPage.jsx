import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', parent_id: '', aliases: [], show_in_navbar: true, sort_order: 0, status: 'active' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService.getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message || 'Unable to load categories.'))
      .finally(() => setLoading(false));
  }, []);

  const beginCreate = () => {
    setEditingCategory(null);
    setIsCreating(true);
    setForm({ name: '', slug: '', description: '', image: '', parent_id: '', aliases: [], show_in_navbar: true, sort_order: 0, status: 'active' });
  };

  const beginEdit = (category) => {
    setEditingCategory(category.id);
    setIsCreating(false);
    setForm({ ...category, parent_id: category.parent_id || '', aliases: category.aliases || [] });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const saved = await supabaseAdminService.saveCategory({ ...form, slug, id: editingCategory || undefined });
      setCategories((current) => editingCategory
        ? current.map((category) => category.id === saved.id ? saved : category)
        : [...current, saved].sort((a, b) => a.sort_order - b.sort_order));
      setEditingCategory(null);
      setIsCreating(false);
      toast.success(editingCategory ? 'Category updated successfully.' : 'Category created successfully.');
    } catch (err) {
      toast.error(`Unable to save category: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      try {
        await supabaseAdminService.deleteCategory(id);
        setCategories((current) => current.filter((category) => category.id !== id));
        toast.success(`Deleted category "${name}"`);
      } catch (err) {
        toast.error(`Unable to delete category: ${err.message}`);
      }
    }
  };

  const toggleStatus = async (category) => {
    try {
      const updated = await supabaseAdminService.saveCategory({ ...category, status: category.status === 'active' ? 'inactive' : 'active' });
      setCategories((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast.success(`Category ${updated.status}.`);
    } catch (err) {
      toast.error(`Unable to update category: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Categories Management</h1>
          <p className="text-xs text-slate-400">
            Structure your storefront taxonomy across jackets, luggage, and leather accessories.
          </p>
        </div>
        <button
          onClick={editingCategory || isCreating ? () => { setEditingCategory(null); setIsCreating(false); } : beginCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
        >
          <Plus className="w-4 h-4" />
          <span>{editingCategory || isCreating ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {(editingCategory || isCreating) && (
        <form onSubmit={handleSave} className="p-6 bg-slate-950 border border-slate-800 rounded-lg space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-white">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Motorcycle Vests"
              className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Generated from name if blank" className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short category summary..."
              className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Image URL</label>
            <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Parent category</label>
            <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white">
              <option value="">No parent</option>
              {categories.filter((category) => category.id !== editingCategory).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-slate-300 mb-1">Aliases (comma-separated)</label>
            <input value={form.aliases.join(', ')} onChange={(e) => setForm({ ...form, aliases: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-slate-300">Sort order<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="mt-1 w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white" /></label>
            <label className="text-xs text-slate-300">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded text-white"><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={form.show_in_navbar} onChange={(e) => setForm({ ...form, show_in_navbar: e.target.checked })} />Show in navbar</label>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded disabled:opacity-60">
            {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Save Category'}
          </button>
        </form>
      )}

      {loading && <p className="text-xs text-slate-400">Loading categories...</p>}
      {error && <p role="alert" className="text-xs text-red-300">Unable to load categories: {error}</p>}
      {!loading && !error && categories.length === 0 && <p className="text-xs text-slate-400">No categories found.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              {cat.image ? (
                <img src={cat.image} alt="" className="w-12 h-12 object-cover rounded bg-slate-800" />
              ) : (
                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-500">
                  <FolderTree className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                <p className="text-[11px] text-slate-500 font-mono">/category/{cat.slug}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-slate-500">{cat.status} • order {cat.sort_order}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleStatus(cat)} className="text-[10px] text-slate-400 hover:text-amber-400">{cat.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => beginEdit(cat)} className="text-slate-500 hover:text-amber-400 p-1.5" title="Edit Category" aria-label={`Edit ${cat.name}`}><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="text-slate-500 hover:text-red-400 p-1.5" title="Delete Category" aria-label={`Delete ${cat.name}`}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
