import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { messagingService } from '../../services/messagingService';
import { useToast } from '../../context/ToastContext';

export const AdminSubscribersPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    messagingService.getNewsletterSubscribers()
      .then(setSubscribers)
      .catch((err) => toast.error(err.message || 'Failed to load subscribers'))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleExportCsv = () => {
    if (subscribers.length === 0) {
      toast.info('No subscribers to export.');
      return;
    }
    const csvData = messagingService.exportSubscribersCsv(subscribers);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jab-leather-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriber list exported as CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Newsletter Audience</h1>
          <p className="text-xs text-slate-400">
            Registered subscribers from the homepage and storefront newsletter blocks.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={subscribers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded transition"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading subscribers...</p>
      ) : subscribers.length === 0 ? (
        <p className="text-xs text-slate-400">No subscribers registered yet.</p>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">{s.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-sm uppercase ${
                      s.status === 'subscribed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 capitalize">{s.source || 'Website'}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribersPage;
