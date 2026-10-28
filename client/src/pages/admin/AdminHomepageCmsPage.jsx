import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminHomepageCmsPage = () => {
  const [cms, setCms] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    adminService.getHomepageCms().then(setCms).catch(console.error);
  }, []);

  const handleToggle = (key) => {
    setCms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  };

  const handleFieldChange = (key, field, val) => {
    setCms((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminService.updateHomepageCms(cms);
      toast.success('Homepage CMS sections saved successfully');
    } catch {
      toast.error('Failed to save CMS settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!cms) return <p className="text-xs text-slate-400">Loading CMS...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Homepage CMS Manager</h1>
          <p className="text-xs text-slate-400">
            Control the visibility, titles, and banner messaging of all 17 homepage sections.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(cms).map(([key, sec]) => (
          <div
            key={key}
            className="p-5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white capitalize">
                  {key.replace(/([A-Z])/g, ' $1')} Section
                </h3>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-sm ${
                    sec.enabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {sec.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {sec.title && (
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => handleFieldChange(key, 'title', e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 mt-2"
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => handleToggle(key)}
              className={`px-4 py-2 text-xs font-bold rounded transition whitespace-nowrap ${
                sec.enabled
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-amber-600 text-white hover:bg-amber-500'
              }`}
            >
              {sec.enabled ? 'Disable Section' : 'Enable Section'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHomepageCmsPage;
