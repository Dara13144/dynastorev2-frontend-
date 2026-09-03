import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Plus, Trash2, Edit2, Save, X, Loader2,
  ToggleLeft, ToggleRight, RefreshCw, Gift, Wallet, Award,
} from "lucide-react";
import API from "../../utils/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const PRIZE_TYPES = [
  { value: "COUPON", label: "Coupon (% Off)", icon: Gift },
  { value: "WALLET", label: "Wallet Credit ($)", icon: Wallet },
  { value: "BADGE", label: "Badge / Label", icon: Award },
  { value: "NONE", label: "No Prize", icon: X },
];

const COLORS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899",
  "#ef4444", "#3b82f6", "#84cc16", "#f97316", "#334155",
];

const EMPTY_FORM = {
  label: "",
  color: "#06b6d4",
  prize_type: "NONE",
  prize_value: "0",
  weight: 10,
  is_active: true,
};

function WheelPreview({ segments }) {
  const cx = 120, cy = 120, r = 110;
  const total = segments.reduce((s, seg) => s + Number(seg.weight || 1), 0);
  let currentAngle = -90;
  const slices = segments.map((seg) => {
    const pct = Number(seg.weight || 1) / total;
    const angle = pct * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const toRad = (d) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { seg, path };
  });
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      {slices.map(({ seg, path }) => (
        <path key={seg.id || seg.label} d={path} fill={seg.color} stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
      ))}
      <circle cx={cx} cy={cy} r={16} fill="#0f172a" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={10} fill="#06b6d4" />
    </svg>
  );
}

export default function AdminSpinPage() {
  const toast = useToast();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/spin");
      if (res.data.success) setSegments(res.data.segments);
    } catch (e) {
      toast.error("Failed to load spin wheel segments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSegments(); }, []);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (seg) => {
    setModalMode("edit");
    setEditingId(seg.id);
    setFormData({
      label: seg.label || "",
      color: seg.color || "#06b6d4",
      prize_type: seg.prize_type || "NONE",
      prize_value: String(seg.prize_value || "0"),
      weight: Number(seg.weight) || 10,
      is_active: seg.is_active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.label.trim()) { toast.error("Label is required"); return; }
    setModalLoading(true);
    try {
      const cleanPayload = {
        ...formData,
        weight: (formData.weight === '' || formData.weight === null) ? 10 : Number(formData.weight) || 10,
        prize_value: formData.prize_type === 'NONE'
          ? '0'
          : (formData.prize_value === '' || formData.prize_value === null ? '0' : String(formData.prize_value)),
      };

      if (modalMode === "create") {
        const res = await API.post("/admin/spin", cleanPayload);
        if (res.data.success) {
          setSegments((p) => [...p, res.data.segment]);
          toast.success("Segment created!");
        }
      } else {
        const res = await API.put(`/admin/spin/${editingId}`, cleanPayload);
        if (res.data.success) {
          setSegments((p) => p.map((s) => (s.id === editingId ? res.data.segment : s)));
          toast.success("Segment updated!");
        }
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggle = async (seg) => {
    try {
      const res = await API.put(`/admin/spin/${seg.id}`, { is_active: !seg.is_active });
      if (res.data.success) {
        setSegments((p) => p.map((s) => (s.id === seg.id ? res.data.segment : s)));
        toast.success(res.data.segment.is_active ? "Segment activated" : "Segment deactivated");
      }
    } catch (e) { toast.error("Toggle failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this spin segment? This cannot be undone.")) return;
    try {
      await API.delete(`/admin/spin/${id}`);
      setSegments((p) => p.filter((s) => s.id !== id));
      toast.success("Segment deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

  const totalWeight = segments.reduce((s, seg) => s + Number(seg.weight || 1), 0);
  const activeSegments = segments.filter((s) => s.is_active);

  const PrizeIcon = ({ type, className }) => {
    const t = PRIZE_TYPES.find((p) => p.value === type);
    const Icon = t ? t.icon : Sparkles;
    return <Icon className={className} />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-display flex items-center gap-3">
            <span className="text-3xl">🎡</span> Spin Wheel Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure the prize wheel shown to customers after every purchase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchSegments} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Segment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Segments", value: segments.length, color: "text-brand-cyan" },
          { label: "Active Segments", value: activeSegments.length, color: "text-emerald-400" },
          { label: "Total Weight", value: totalWeight, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl glass-card border border-white/10 text-center">
            <span className={`text-2xl font-black ${s.color} block`}>{s.value}</span>
            <span className="text-[11px] text-slate-400">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Wheel Preview */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4 sticky top-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Preview</h3>
            <div className="w-full aspect-square max-w-[220px] mx-auto">
              {activeSegments.length > 0 ? (
                <WheelPreview segments={activeSegments} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs border border-dashed border-white/10 rounded-full">
                  No active segments
                </div>
              )}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeSegments.map((seg) => (
                <div key={seg.id} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-3 h-3 rounded-sm shrink-0 border border-black/20" style={{ background: seg.color }} />
                  <span className="truncate flex-1">{seg.label}</span>
                  <span className="text-slate-500 shrink-0">{((Number(seg.weight) / totalWeight) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Segments Table */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl glass-card border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Wheel Segments</h3>
              <p className="text-xs text-slate-400 mt-1">Higher weight = higher probability of landing on this segment</p>
            </div>
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-cyan" />
              </div>
            ) : segments.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                No segments yet. Click <strong>Add Segment</strong> to get started!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {segments.map((seg) => (
                  <div key={seg.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    {/* Color swatch */}
                    <span className="w-8 h-8 rounded-xl shrink-0 border border-black/30 shadow-md" style={{ background: seg.color }} />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm truncate">{seg.label}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          seg.prize_type === "COUPON" ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
                          : seg.prize_type === "WALLET" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : seg.prize_type === "BADGE" ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}>
                          {seg.prize_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                        <span>Value: <span className="text-white font-semibold">{seg.prize_value}</span></span>
                        <span>Weight: <span className="text-amber-400 font-bold">{seg.weight}</span></span>
                        <span>Chance: <span className="text-brand-cyan font-bold">{((Number(seg.weight) / totalWeight) * 100).toFixed(1)}%</span></span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggle(seg)} title={seg.is_active ? "Deactivate" : "Activate"} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                        {seg.is_active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                      </button>
                      <button onClick={() => openEdit(seg)} className="p-1.5 rounded-lg hover:bg-white/10 text-brand-cyan transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(seg.id)} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl p-7 space-y-5 shadow-2xl"
              style={{ background: "linear-gradient(135deg,#0f172a,#1e1b4b)", border: "1px solid rgba(139,92,246,0.3)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">{modalMode === "create" ? "Add New Segment" : "Edit Segment"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Label */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5 text-sm">Prize Label *</label>
                <input
                  type="text" required value={formData.label}
                  onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. 10% OFF Coupon"
                  className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan text-sm"
                />
              </div>

              {/* Color */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5 text-sm">Segment Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setFormData((p) => ({ ...p, color: c }))}
                      className="w-8 h-8 rounded-lg border-2 transition"
                      style={{ background: c, borderColor: formData.color === c ? "#fff" : "transparent" }}
                    />
                  ))}
                  <input type="color" value={formData.color} onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent" title="Custom color" />
                </div>
              </div>

              {/* Prize Type */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5 text-sm">Prize Type</label>
                <select value={formData.prize_type} onChange={(e) => setFormData((p) => ({ ...p, prize_type: e.target.value }))}
                  className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan text-sm">
                  {PRIZE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Prize Value */}
              {formData.prize_type !== "NONE" && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1.5 text-sm">
                    Prize Value {formData.prize_type === "COUPON" ? "(% discount)" : formData.prize_type === "WALLET" ? "($ amount)" : "(badge name)"}
                  </label>
                  <input type={formData.prize_type === "BADGE" ? "text" : "number"} value={formData.prize_value}
                    min={0} step="0.01"
                    onChange={(e) => setFormData((p) => ({ ...p, prize_value: e.target.value }))}
                    placeholder={formData.prize_type === "BADGE" ? "e.g. VIP Gamer" : "e.g. 10"}
                    className="w-full bg-black/40 text-white rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan text-sm font-bold"
                  />
                </div>
              )}

              {/* Weight */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5 text-sm">
                  Weight (probability) — current: <span className="text-brand-cyan">{formData.weight}</span>
                </label>
                <input type="range" min={1} max={100} value={formData.weight}
                  onChange={(e) => setFormData((p) => ({ ...p, weight: Number(e.target.value) }))}
                  className="w-full accent-brand-cyan" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 (rare)</span><span>50 (common)</span><span>100 (very common)</span>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-semibold text-slate-300">Active on wheel</span>
                <button onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}>
                  {formData.is_active ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold border border-white/10 transition">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={modalLoading} className="flex-1 py-2.5 rounded-xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                  {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {modalMode === "create" ? "Create Segment" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
