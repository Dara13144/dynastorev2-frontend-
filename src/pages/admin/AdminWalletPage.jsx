import React, { useState, useEffect } from 'react';
import { Wallet, Search, PlusCircle, MinusCircle, ShieldAlert, History, Check, X, Loader2 } from 'lucide-react';
import API from '../../utils/api.js';
import { TableSkeleton } from '../../components/SkeletonLoader.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminWalletPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [isDeduction, setIsDeduction] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users for wallet management:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAdjustModal = (user) => {
    setSelectedUser(user);
    setAmount('');
    setIsDeduction(false);
    setReason('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    if (!reason.trim()) {
      toast.error('An audited reason is mandatory for manual balance adjustments');
      return;
    }

    const finalAmount = isDeduction ? -numAmount : numAmount;

    try {
      setSubmitting(true);
      const res = await API.post('/admin/wallet/adjust', {
        userId: selectedUser.id,
        amount: finalAmount,
        reason: reason.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Wallet adjusted successfully');
        setAdjustModalOpen(false);
        await fetchUsers();
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white font-display">Wallet Ledger & Adjustments</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review customer digital balances and perform strict, audited balance corrections
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gamer by name or email..."
            className="w-full bg-background-card text-xs text-white rounded-xl pl-9 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} Users</span>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Gamer Account</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Current Balance</th>
                  <th className="p-4 text-right">Audited Adjustment</th>
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
                          className="w-8 h-8 rounded-lg bg-slate-800 object-cover"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{u.username}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono text-[10px] uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-brand-cyan font-display text-base">
                        ${Number(u.balance || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openAdjustModal(u)}
                        className="px-3 py-1.5 rounded-xl bg-brand-purple/20 hover:bg-brand-purple/30 text-purple-300 border border-brand-purple/40 text-xs font-bold transition-all shadow-sm"
                      >
                        Adjust Balance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Adjustment Modal */}
      {adjustModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/15 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Audited Wallet Adjustment</h3>
                <p className="text-xs text-slate-400 mt-0.5">User: {selectedUser.username}</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Current Balance</span>
                <span className="text-base font-black text-white font-display">
                  ${Number(selectedUser.balance || 0).toFixed(2)}
                </span>
              </div>

              {/* Add vs Deduct switch */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeduction(false)}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    !isDeduction
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Credit (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeduction(true)}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    isDeduction
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Deduct (-)</span>
                </button>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Adjustment Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 20.00"
                  className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan font-display text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Mandatory Audit Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Compensation for customer support inquiry #4892..."
                  className="w-full bg-background-card text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl gradient-btn font-bold flex items-center gap-1.5 shadow-neon-cyan"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
