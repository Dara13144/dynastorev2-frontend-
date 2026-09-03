import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Gamepad2,
  FolderArchive,
  ShoppingCart,
  Users,
  Wallet,
  ScrollText,
  Database,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-white">403 - Forbidden</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          You do not have administrative privileges to access the DynaStore Admin Console.
        </p>
        <Link to="/" className="mt-6 px-6 py-2.5 rounded-xl gradient-btn text-sm font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Gamepad2 },
    { name: 'Game Files', path: '/admin/files', icon: FolderArchive },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Promo Codes', path: '/admin/discounts', icon: Tag },
    { name: 'Spin Wheel', path: '/admin/spin', icon: Sparkles },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Wallet & Ledger', path: '/admin/wallet', icon: Wallet },
    { name: 'Audit Logs', path: '/admin/logs', icon: ScrollText },
    { name: 'System Backup', path: '/admin/backup', icon: Database },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 glass-panel border-r border-white/10 flex flex-col justify-between shrink-0 p-5">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10">
            <img
              src="/logo.png"
              alt="DynaStore"
              className="w-10 h-10 rounded-full object-contain bg-white/95 p-0.5 shadow-neon-cyan shrink-0"
            />
            <div>
              <span className="font-bold text-white text-base block font-display">Admin Panel</span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                DynaStore Ops
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 text-brand-cyan border border-brand-cyan/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Return to Store button */}
        <div className="pt-6 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
