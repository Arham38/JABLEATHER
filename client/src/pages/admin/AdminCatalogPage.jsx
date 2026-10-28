import React, { useState } from 'react';
import { FileText, Download, Send } from 'lucide-react';
import { catalogService } from '../../services/catalogService';
import { useToast } from '../../context/ToastContext';

export const AdminCatalogPage = () => {
  const catalog = catalogService.getCatalogDetails();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const toast = useToast();

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const csv = await catalogService.exportCatalogCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jab-leather-wholesale-catalog-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Wholesale product specifications exported.');
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  const handleSendCatalog = async (e) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setIsSending(true);
    try {
      const res = await catalogService.requestCatalogEmail(recipientEmail, companyName);
      toast.success(res.message);
      setRecipientEmail('');
      setCompanyName('');
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch catalog');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 block">
          B2B & Wholesale Exports
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Export Catalog Hub
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Distribute the verified 2026 Leather Garments & Goods Wholesale Specification Book.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Catalog Overview Card */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{catalog.title}</h3>
              <p className="text-xs text-slate-400">{catalog.edition}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Pages</span>
              <strong className="text-slate-200">{catalog.totalPages} Full-Color Pages</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Format</span>
              <strong className="text-slate-200">{catalog.format}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">File Size</span>
              <strong className="text-slate-200">{catalog.fileSize}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Languages</span>
              <strong className="text-slate-200">English, German, French</strong>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Product Catalog</span>
            </button>
          </div>
        </div>

        {/* Send Direct to B2B Buyer */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Send className="w-4 h-4 text-amber-500" />
            <span>Dispatch to Retailer or Distributor</span>
          </div>

          <form onSubmit={handleSendCatalog} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Company / Brand Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Nordic Moto Outfitter"
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Buyer Email Address *
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="buyer@outfitters.com"
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2"
            >
              {isSending ? 'Dispatching...' : 'Email Wholesale Catalog'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCatalogPage;
