import React, { useState, useEffect } from 'react';
import supabaseAdminService from '../../services/supabaseAdminService';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabaseAdminService.getCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.message || 'Unable to load customers.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      `${c.name || ''} ${c.email || ''} ${c.role || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Registered Customers</h1>
            <p className="text-xs text-slate-400">
            Customer records from the existing users table. Authentication secrets are excluded.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg">
        <input
          type="text"
          placeholder="Search by customer name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && <tr><td colSpan="6" className="p-6 text-slate-400">Loading customers...</td></tr>}
              {error && <tr><td colSpan="6" role="alert" className="p-6 text-red-300">Unable to load customers: {error}</td></tr>}
              {!loading && !error && filtered.length === 0 && <tr><td colSpan="6" className="p-6 text-slate-400">No customer records found.</td></tr>}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-white">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    <div>{c.email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{c.role}</td>
                  <td className="py-3 px-4 text-slate-300">{c.is_verified ? 'Verified' : 'Unverified'}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomersPage;
