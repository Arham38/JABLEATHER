import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, ExternalLink, Sparkles } from 'lucide-react';
import { collectionService } from '../../services/collectionService';

export const AdminCollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collectionService.getCollections()
      .then(setCollections)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
            Merchandising
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Curated Collections
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showcase themed product edits, seasonal drops, and wholesale catalogs.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-xs">Loading collections...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col group hover:border-slate-700 transition"
            >
              <div className="h-44 relative overflow-hidden bg-slate-900">
                <img
                  src={col.bannerImage}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {col.tagline}
                  </span>
                  <h3 className="text-lg font-extrabold text-white">{col.name}</h3>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {col.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-mono text-slate-500">/{col.slug}</span>
                  <Link
                    to={`/collection/${col.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 font-semibold"
                  >
                    <span>View Public</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCollectionsPage;
