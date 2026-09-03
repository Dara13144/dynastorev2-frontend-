import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Copy,
  Percent,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Save,
} from 'lucide-react';
import API from '../../utils/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'PERCENTAGE',
  discount_value: 20,
  min_spend: 0,
  max_discount: '',
  usage_limit: 100,
  expires_at: '',
  is_active: true,
};

export default function AdminDiscountsPage() {
  const toast = useToast();

  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalTimesUsed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Modal state (shared for Create & Edit)
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
        setStats(res.data.stats || { totalCoupons: 0, activeCoupons: 0, totalTimesUsed: 0 });
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to fetch discount codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Helpers
  const handleGenerateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: `DINA-${rand}` }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...EMPTY_FORM, code: `DINA-${rand}` });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setModalMode('edit');
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'PERCENTAGE',
      discount_value: Number(coupon.discount_value) || 0,
      min_spend: Number(coupon.min_spend) || 0,
      max_discount: coupon.max_discount ? String(coupon.max_discount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      expires_at: coupon.expires_at
        ? new Date(coupon.expires_at).toISOString().split('T')[0]
        : '',
      is_active: coupon.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  // Quick Presets
  const handleQuickCreate = async (preset) => {
    try {
      const res = await API.post('/admin/coupons', {
        code: preset.code,
        description: preset.description,
        discount_type: preset.discount_type,
        discount_value: preset.discount_value,
        min_spend: preset.min_spend || 0,
        usage_limit: preset.usage_limit || 1000,
        is_active: true,
        expires_at: null,
      });
      if (res.data.success) {
        toast.success(`✅ Code '${preset.code}' created — ${preset.label}`);
        fetchCoupons();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.formattedMessage || 'Failed to create preset code';
      toast.error(msg);
    }
  };

  const PRESETS = [
    { code: '1%', label: '1% Off', description: '1% discount on all games', discount_type: 'PERCENTAGE', discount_value: 1, min_spend: 0, textColor: 'text-sky-400', borderColor: 'border-sky-500/30', bg: 'bg-sky-500/10', display: '1%' },
    { code: '2%', label: '2% Off', description: '2% discount on all games', discount_type: 'PERCENTAGE', discount_value: 2, min_spend: 0, textColor: 'text-teal-400', borderColor: 'border-teal-500/30', bg: 'bg-teal-500/10', display: '2%' },
    { code: '3%', label: '3% Off', description: '3% discount on all games', discount_type: 'PERCENTAGE', discount_value: 3, min_spend: 0, textColor: 'text-indigo-400', borderColor: 'border-indigo-500/30', bg: 'bg-indigo-500/10', display: '3%' },
    { code: '4%', label: '4% Off', description: '4% discount on all games', discount_type: 'PERCENTAGE', discount_value: 4, min_spend: 0, textColor: 'text-amber-400', borderColor: 'border-amber-500/30', bg: 'bg-amber-500/10', display: '4%' },
    { code: '0.05', label: '0.05 (5% Off)', description: '5% discount on all games', discount_type: 'PERCENTAGE', discount_value: 5, min_spend: 0, textColor: 'text-brand-cyan', borderColor: 'border-cyan-500/30', bg: 'bg-cyan-500/10', display: '0.05' },
    { code: '0.10', label: '0.10 (10% Off)', description: '10% discount on all games', discount_type: 'PERCENTAGE', discount_value: 10, min_spend: 0, textColor: 'text-purple-400', borderColor: 'border-purple-500/30', bg: 'bg-purple-500/10', display: '0.10' },
    { code: '0.15', label: '0.15 (15% Off)', description: '15% discount on all games', discount_type: 'PERCENTAGE', discount_value: 15, min_spend: 0, textColor: 'text-rose-400', borderColor: 'border-rose-500/30', bg: 'bg-rose-500/10', display: '0.15' },
    { code: '5$', label: '5$ ($5.00 Off)', description: '$5 instant discount on orders over $5', discount_type: 'FIXED', discount_value: 5, min_spend: 5, textColor: 'text-emerald-400', borderColor: 'border-emerald-500/30', bg: 'bg-emerald-500/10', display: '$5' },
  ];

  // Submit (Create or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Please specify a promo code');
      return;
    }
    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      toast.error('Please enter a valid discount value greater than 0');
      return;
    }

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_value: Number(formData.discount_value),
      min_spend: Number(formData.min_spend || 0),
      max_discount: formData.max_discount ? Number(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    };

    try {
      setModalLoading(true);
      if (modalMode === 'edit' && editingId) {
        const res = await API.put(`/admin/coupons/${editingId}`, payload);
        if (res.data.success) {
          toast.success(`✏️ Code '${payload.code}' updated successfully!`);
          closeModal();
          fetchCoupons();
        }
      } else {
        const res = await API.post('/admin/coupons', payload);
        if (res.data.success) {
          toast.success(res.data.message || 'Discount code created!');
          closeModal();
          fetchCoupons();
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.formattedMessage ||
        `Failed to ${modalMode === 'edit' ? 'update' : 'create'} discount code`
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const updatedStatus = !coupon.is_active;
      const res = await API.put(`/admin/coupons/${coupon.id}`, { is_active: updatedStatus });
      if (res.data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: updatedStatus } : c))
        );
        toast.success(`Code '${coupon.code}' ${updatedStatus ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      toast.error('Failed to toggle code status');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete code '${code}'?`)) return;
    try {
      const res = await API.delete(`/admin/coupons/${id}`);
      if (res.data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Discount code '${code}' deleted`);
      }
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied '${text}' to clipboard!`);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || c.discount_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-display flex items-center gap-3">
            <Tag className="w-8 h-8 text-brand-cyan" /> Discount &amp; Promo Codes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, edit, and manage discount codes for customer checkout &amp; game purchases
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-neon-cyan transition hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Quick Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Preset Codes</span>
          <span className="text-[10px] text-slate-500 ml-1">— click to instantly create a ready-to-use discount code</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((p) => {
            const alreadyExists = coupons.some((c) => c.code === p.code);
            return (
              <button
                key={p.code}
                type="button"
                disabled={alreadyExists}
                onClick={() => handleQuickCreate(p)}
                className={`relative group rounded-2xl border p-4 text-left transition-all hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed ${
                  alreadyExists ? 'border-white/10 bg-white/5' : `${p.borderColor} ${p.bg} hover:shadow-lg`
                }`}
              >
                <div className={`text-3xl font-black font-display ${alreadyExists ? 'text-slate-400' : p.textColor}`}>
                  {p.display}
                </div>
                <div className="text-[11px] font-bold text-white mt-1">{p.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.code}</div>
                {alreadyExists ? (
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10">
                    EXISTS
                  </span>
                ) : (
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded border ${p.borderColor} ${p.bg} ${p.textColor} opacity-0 group-hover:opacity-100 transition`}>
                    + Create
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl glass-card border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Promo Codes</span>
            <Tag className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="text-3xl font-black text-white font-display">{stats.totalCoupons}</div>
          <span className="text-[11px] text-slate-400">Configured in system</span>
        </div>
        <div className="rounded-3xl glass-card border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Codes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-display">{stats.activeCoupons}</div>
          <span className="text-[11px] text-emerald-400/80">Available on checkout right now</span>
        </div>
        <div className="rounded-3xl glass-card border border-white/10 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Times Redeemed</span>
            <TrendingUp className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-display">{stats.totalTimesUsed}</div>
          <span className="text-[11px] text-slate-400">Total customer order uses</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promo codes..."
            className="w-full bg-background-card text-white text-xs rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PERCENTAGE', 'FIXED'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === t ? 'bg-brand-cyan text-slate-950 shadow-md' : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t === 'PERCENTAGE' ? '% Percentage' : '$ Fixed Amount'}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 uppercase font-bold text-[10px] tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Promo Code</th>
                <th className="px-6 py-4">Discount Value</th>
                <th className="px-6 py-4">Min Spend</th>
                <th className="px-6 py-4">Redemptions</th>
                <th className="px-6 py-4">Expires</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-cyan mb-2" />
                    Loading discount codes...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No discount codes found. Click <strong>Create Promo Code</strong> to add one!
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isLimitReached = c.usage_limit && c.times_used >= c.usage_limit;
                  const displayPct =
                    c.discount_type === 'PERCENTAGE' && Number(c.discount_value) < 1
                      ? (Number(c.discount_value) * 100).toFixed(0)
                      : Number(c.discount_value);

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-sm bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(c.code)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs truncate">
                            {c.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            c.discount_type === 'PERCENTAGE'
                              ? 'bg-cyan-500/10 text-brand-cyan border-cyan-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {c.discount_type === 'PERCENTAGE' ? (
                            <>
                              <Percent className="w-3 h-3" /> {displayPct}% OFF
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3 h-3" /> ${Number(c.discount_value).toFixed(2)} OFF
                            </>
                          )}
                        </span>
                      </td>

                      {/* Min Spend */}
                      <td className="px-6 py-4 text-white">
                        {Number(c.min_spend) > 0 ? `$${Number(c.min_spend).toFixed(2)}` : 'None ($0)'}
                      </td>

                      {/* Redemptions */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-white font-bold">
                            {c.times_used || 0}{' '}
                            <span className="text-slate-400 font-normal">
                              / {c.usage_limit ? c.usage_limit : '∞'}
                            </span>
                          </div>
                          {c.usage_limit && (
                            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`h-full ${
                                  isLimitReached ? 'bg-rose-500' : 'bg-brand-cyan'
                                }`}
                                style={{
                                  width: `${Math.min(100, ((c.times_used || 0) / c.usage_limit) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Expires */}
                      <td className="px-6 py-4">
                        {c.expires_at ? (
                          <span
                            className={`text-xs ${
                              isExpired ? 'text-rose-400 font-bold' : 'text-slate-300'
                            }`}
                          >
                            {new Date(c.expires_at).toLocaleDateString()}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-slate-500">Never</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className="flex items-center gap-1.5 focus:outline-none transition group"
                        >
                          {c.is_active ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-emerald-400" />
                              <span className="text-[11px] font-bold text-emerald-400">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-slate-500" />
                              <span className="text-[11px] font-bold text-slate-500">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-2 rounded-xl text-brand-cyan hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                            title="Edit code"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Delete code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE & EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background-card border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
                    {modalMode === 'edit' ? (
                      <>
                        <Edit2 className="w-5 h-5 text-brand-cyan" /> Edit Promo Code
                      </>
                    ) : (
                      <>
                        <Tag className="w-5 h-5 text-brand-cyan" /> New Promo Code
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {modalMode === 'edit'
                      ? `Editing code: ${formData.code}`
                      : 'Configure code name, percentage/fixed discount, and rules'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Code Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-slate-300">Promo Code String</label>
                    {modalMode === 'create' && (
                      <button
                        type="button"
                        onClick={handleGenerateRandomCode}
                        className="text-brand-cyan hover:underline flex items-center gap-1 font-bold"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-Generate
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. SUMMER50 or DINA2026"
                    className="w-full bg-black/40 text-white font-mono font-bold uppercase rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan text-sm"
                  />
                  {modalMode === 'edit' && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      You can edit the code string or any discount details below.
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5">
                    Description / Promotion Name
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Master Admin 50% Weekend Flash Sale"
                    className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                {/* Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Discount Type
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, discount_type: e.target.value }))
                      }
                      className="w-full bg-black/40 text-white rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                    >
                      <option value="PERCENTAGE">Percentage (% Off)</option>
                      <option value="FIXED">Fixed Amount ($ Off)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Discount Value ({formData.discount_type === 'PERCENTAGE' ? '%' : '$'})
                    </label>
                    <input
                      type="number"
                      required
                      min={0.01}
                      max={formData.discount_type === 'PERCENTAGE' ? 100 : 10000}
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, discount_value: e.target.value }))
                      }
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan font-bold"
                    />
                    {formData.discount_value > 0 && (
                      <p className="text-[10px] text-brand-cyan mt-1 font-semibold">
                        {formData.discount_type === 'PERCENTAGE'
                          ? Number(formData.discount_value) < 1
                            ? `= ${(Number(formData.discount_value) * 100).toFixed(0)}% off (${formData.discount_value} × 100)`
                            : `= ${Number(formData.discount_value).toFixed(2)}% off`
                          : `= $${Number(formData.discount_value).toFixed(2)} fixed off`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Min Spend & Usage Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Minimum Spend ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={formData.min_spend}
                      onChange={(e) => setFormData((p) => ({ ...p, min_spend: e.target.value }))}
                      placeholder="0 for no minimum"
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Usage Limit (Max Uses)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.usage_limit}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, usage_limit: e.target.value }))
                      }
                      placeholder="Leave blank for unlimited"
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>

                {/* Expiration Date & Status */}
                <div className={`grid gap-4 ${modalMode === 'edit' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1.5">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData((p) => ({ ...p, expires_at: e.target.value }))}
                      className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  {modalMode === 'edit' && (
                    <div>
                      <label className="font-semibold text-slate-300 block mb-1.5">Status</label>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border font-bold text-xs transition ${
                          formData.is_active
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {formData.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5" /> Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5" /> Inactive
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold flex items-center gap-2 shadow-neon-cyan transition disabled:opacity-50"
                  >
                    {modalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : modalMode === 'edit' ? (
                      <Save className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{modalMode === 'edit' ? 'Save Changes' : 'Save & Publish Code'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
