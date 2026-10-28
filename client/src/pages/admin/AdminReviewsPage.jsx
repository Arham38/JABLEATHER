import React, { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService
      .getReviews()
      .then(setReviews)
      .catch((err) => toast.error(err.message || 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await supabaseAdminService.updateReviewStatus(id, status);
      setReviews(reviews.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Review status updated to ${status}`);
    } catch (err) {
      toast.error(`Status update failed: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await supabaseAdminService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Review Moderation</h1>
          <p className="text-xs text-slate-400">
            Moderate and verify customer product feedback and star ratings stored in Supabase.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-400">No customer reviews submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm mr-2">{r.customerName || r.author}</span>
                  <span className="text-xs text-amber-500 font-semibold">• {r.productName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm capitalize ${
                    r.status?.toLowerCase() === 'approved'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : r.status?.toLowerCase() === 'rejected'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {r.status}
                  </span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex text-amber-500 gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : 'text-slate-700'}`} />
                ))}
              </div>

              <h4 className="text-xs font-bold text-slate-200">"{r.title}"</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{r.comment}</p>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {r.date ? new Date(r.date).toLocaleDateString() : ''} • {r.customerEmail}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'approved')}
                    className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-bold rounded transition text-[11px]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'rejected')}
                    className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 font-bold rounded transition text-[11px]"
                  >
                    Reject
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

export default AdminReviewsPage;
