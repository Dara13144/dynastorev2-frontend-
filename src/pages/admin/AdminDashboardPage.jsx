import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Gamepad2,
  Download,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  PlusCircle,
  FolderArchive,
} from 'lucide-react';
import API from '../../utils/api.js';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await API.get('/admin/dashboard');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${metrics?.totalRevenue?.toFixed(2) || '0.00'}`,
      subtitle: `Today: $${metrics?.todayRevenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Paid Orders',
      value: metrics?.paidOrders || 0,
      subtitle: `Total: ${metrics?.totalOrders || 0} (${metrics?.pendingOrders || 0} pending)`,
      icon: ShoppingCart,
      color: 'from-brand-cyan/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Registered Gamers',
      value: metrics?.totalUsers || 0,
      subtitle: 'Active user accounts',
      icon: Users,
      color: 'from-brand-purple/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Total Products',
      value: metrics?.totalProducts || 0,
      subtitle: 'Game files & modpacks',
      icon: Gamepad2,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Wallet Deposits',
      value: `$${metrics?.walletDeposits?.toFixed(2) || '0.00'}`,
      subtitle: 'Processed via ABA PayWay',
      icon: Wallet,
      color: 'from-aba-blue/30 to-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      title: 'Total Downloads',
      value: metrics?.totalDownloads || 0,
      subtitle: 'Signed URL file streams',
      icon: Download,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Operations Overview
          </div>
          <h1 className="text-3xl font-black text-white font-display">Executive Dashboard</h1>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-neon-cyan"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Game</span>
          </Link>
          <Link
            to="/admin/files"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 flex items-center gap-2"
          >
            <FolderArchive className="w-4 h-4 text-cyan-400" />
            <span>Storage Files</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-3xl glass-card border bg-gradient-to-tr ${c.color} shadow-xl flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{c.title}</span>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-white font-display block">{c.value}</span>
                <span className="text-xs text-slate-400 mt-1 block">{c.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operations Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/admin/products"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 hover:text-white flex items-center justify-between"
            >
              <span>Manage Games</span>
              <ArrowUpRight className="w-4 h-4 text-brand-cyan" />
            </Link>
            <Link
              to="/admin/orders"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 hover:text-white flex items-center justify-between"
            >
              <span>View Orders</span>
              <ArrowUpRight className="w-4 h-4 text-brand-cyan" />
            </Link>
            <Link
              to="/admin/users"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 hover:text-white flex items-center justify-between"
            >
              <span>User Accounts</span>
              <ArrowUpRight className="w-4 h-4 text-brand-cyan" />
            </Link>
            <Link
              to="/admin/wallet"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-200 hover:text-white flex items-center justify-between"
            >
              <span>Audited Adjustments</span>
              <ArrowUpRight className="w-4 h-4 text-brand-cyan" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3 text-xs text-slate-300 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wider mb-2">
              System Health & Gateway Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/30">
                <span>ABA PayWay Gateway</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected (Sandbox / Production ready)
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/30">
                <span>Supabase Storage Vault</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Private Signed Downloads Active
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            DynaStore backend is running on Node.js / Express with Row Level Security and Idempotent payment processing.
          </p>
        </div>
      </div>
    </div>
  );
}
