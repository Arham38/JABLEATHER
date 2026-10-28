import React, { useState, useEffect } from 'react';
import { CheckCircle, Archive } from 'lucide-react';
import { messagingService } from '../../services/messagingService';
import { useToast } from '../../context/ToastContext';

export const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    messagingService.getContactMessages()
      .then(setMessages)
      .catch((err) => toast.error(err.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleStatus = async (id, newStatus) => {
    try {
      await messagingService.updateMessageStatus(id, newStatus);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m));
      toast.success(`Message marked as ${newStatus}`);
    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white">Contact & Wholesale Inquiries</h1>
        <p className="text-xs text-slate-400">
          Messages sent via the storefront contact form stored in Supabase.
        </p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading inquiries...</p>
      ) : messages.length === 0 ? (
        <p className="text-xs text-slate-400">No contact messages received yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{m.subject}</h3>
                  <p className="text-xs text-slate-400">
                    From <strong className="text-slate-200">{m.name}</strong> ({m.email}) {m.phone && `• Tel: ${m.phone}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${
                    m.status === 'replied'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : m.status === 'archived'
                      ? 'bg-slate-900 text-slate-400 border border-slate-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {m.status}
                  </span>
                  {m.status !== 'replied' && (
                    <button
                      onClick={() => handleStatus(m.id, 'replied')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-emerald-900/40 hover:bg-emerald-800 text-emerald-200 rounded border border-emerald-700/50 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Mark Handled</span>
                    </button>
                  )}
                  {m.status !== 'archived' && (
                    <button
                      onClick={() => handleStatus(m.id, 'archived')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 flex items-center gap-1"
                    >
                      <Archive className="w-3 h-3" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {m.message}
              </div>

              <div className="text-[10px] text-slate-500">
                Received on {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;
