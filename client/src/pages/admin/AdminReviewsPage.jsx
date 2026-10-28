import React, { useState, useEffect } from 'react';
import { Star, Check, X, ShieldCheck } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdminService';
import { useToast } from '../../context/ToastContext';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const toast = useToast();

  useEffect(() => {
    supabaseAdminService.getReviews().then(setReviews).catch(console.error);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await supabaseAdminService.updateReviewStatus(id, status);
      setReviews(reviews.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Review status updated to ${status}`);
    } catch {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Review Moderation</h1>
          <p className="text-xs text-slate-400">
            Moderate and verify customer product feedback and star ratings.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm mr-2">{r.author}</span>
                <span className="text-xs text-amber-500 font-semibold">• {r.productName}</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                r.status === 'Approved'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {r.status}
              </span>
            </div>

            <div className="flex text-amber-500 gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : 'text-slate-700'}`} />
              ))}
            </div>

            <h4 className="text-xs font-bold text-slate-200">"{r.title}"</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{r.comment}</p>

            <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
              <span className="text-slate-500">{r.date}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(r.id, 'Approved')}
                  className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-bold rounded transition text-[11px]"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(r.id, 'Rejected')}
                  className="px-3 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 font-bold rounded transition text-[11px]"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
