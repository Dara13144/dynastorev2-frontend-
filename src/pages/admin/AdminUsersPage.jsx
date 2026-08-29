import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserX, UserCheck, Wallet, ShieldAlert, Check } from 'lucide-react';
import API from '../../utils/api.js';
import { TableSkeleton } from '../../components/SkeletonLoader.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await API.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.info(`Account status toggled for ${user.username}`);
      await fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleChangeRole = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Change role of ${user.username} to ${newRole}?`)) return;

    try {
      await API.put(`/admin/users/${user.id}`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      await fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">Gamers & User Accounts</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage gamer accounts, roles, access statuses, and balances
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full bg-background-card text-xs text-white rounded-xl pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} Gamers</span>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt="Avatar"
                          className="w-9 h-9 rounded-xl bg-slate-800 object-cover"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{u.username}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-black text-white font-display text-sm">
                      ${Number(u.balance || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.is_active !== false
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {u.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleChangeRole(u)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold"
                          title="Change Role"
                        >
                          Toggle Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                            u.is_active !== false
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                          title={u.is_active !== false ? 'Disable Account' : 'Enable Account'}
                        >
                          {u.is_active !== false ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
