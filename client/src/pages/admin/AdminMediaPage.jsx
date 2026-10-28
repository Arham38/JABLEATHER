import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Check, Copy } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminMediaPage = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService.getMediaLibrary()
      .then(setMediaList)
      .catch((err) => setError(err.message || 'Unable to load Storage objects.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Image URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      await Promise.all(files.map((file) => supabaseAdminService.uploadProductImage(file)));
      setMediaList(await supabaseAdminService.getMediaLibrary());
      toast.success(`${files.length} image${files.length === 1 ? '' : 's'} uploaded.`);
    } catch (err) {
      setError(err.message || 'Unable to upload image.');
      toast.error(`Unable to upload image: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete image "${item.name}" from product-images?`)) return;
    try {
      await supabaseAdminService.deleteMediaObject(item.path);
      setMediaList((current) => current.filter((media) => media.id !== item.id));
      toast.success('Image deleted from Storage.');
    } catch (err) {
      toast.error(`Unable to delete image: ${err.message}`);
    }
  };

  const categories = ['All', 'Product Images'];
  const filtered = filter === 'All' ? mediaList : mediaList.filter((m) => m.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
            Digital Assets
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Media Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
              Files stored in the existing public product-images Supabase bucket.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              filter === cat
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-xs">Loading media assets...</div>
      ) : (
        <>
        {error && <p role="alert" className="text-xs text-red-300">Unable to load Storage objects: {error}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group hover:border-slate-700 transition flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-900">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleCopyUrl(item.url, item.id)}
                    className="p-1.5 bg-slate-950/80 hover:bg-slate-900 text-white rounded text-xs shadow-md backdrop-blur-sm"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button onClick={() => handleDelete(item)} className="ml-1 p-1.5 bg-slate-950/80 hover:bg-red-900 text-white rounded text-xs shadow-md backdrop-blur-sm" title="Delete image" aria-label={`Delete ${item.name}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                  <span>{item.category}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!error && !loading && filtered.length === 0 && <p className="py-8 text-center text-xs text-slate-400">No files are stored in product-images yet.</p>}
        </>
      )}
    </div>
  );
};

export default AdminMediaPage;
