import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Search,
  Wallet,
  User,
  LogOut,
  ShieldAlert,
  Download,
  Package,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="DynaStore"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-contain bg-white/95 p-0.5 shadow-neon-cyan transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-wider uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                Dyna<span className="text-brand-cyan">Store</span>
              </span>
              <span className="text-[10px] tracking-widest text-cyan-400/80 uppercase font-medium">
                Cambodia Digital Games
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center mx-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, developers, modpacks..."
              className="w-full bg-background/80 text-sm text-slate-200 placeholder-slate-500 rounded-full pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan/60 focus:ring-1 focus:ring-brand-cyan/40 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Nav Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/games" className="hover:text-brand-cyan transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              Explore Games
            </Link>
            <Link to="/categories" className="hover:text-brand-cyan transition-colors">
              Categories
            </Link>
          </div>

          {/* User Controls & Cart */}
          <div className="flex items-center gap-3">
            {/* Wallet Pill (if authenticated) */}
            {isAuthenticated && (
              <Link
                to="/wallet"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-cyan/30 hover:border-brand-cyan transition-all shadow-sm group"
              >
                <Wallet className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition-transform" />
                <div className="text-xs">
                  <span className="text-slate-400 mr-1">Balance:</span>
                  <span className="font-bold text-white">${Number(user?.balance || 0).toFixed(2)}</span>
                </div>
                <PlusCircle className="w-3.5 h-3.5 text-brand-cyan opacity-80" />
              </Link>
            )}


            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-brand-surface border border-white/10 hover:border-brand-cyan/50 text-slate-300 hover:text-white transition-all shadow-sm group"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-200 group-hover:text-brand-cyan" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-lg animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons or User Avatar Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-brand-surface/80 border border-white/10 hover:border-brand-cyan/50 transition-all focus:outline-none"
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg bg-slate-800 object-cover"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                    {user?.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl border border-white/15 py-2 z-50 text-sm"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-white/10">
                        <p className="font-semibold text-white truncate">{user?.username}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                          <span className="text-slate-400">Role</span>
                          <span className="px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-bold uppercase text-[10px]">
                            {user?.role}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-amber-400 hover:bg-amber-500/10 transition-colors font-medium"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/downloads"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        My Downloads
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Package className="w-4 h-4 text-purple-400" />
                        My Orders
                      </Link>

                      <Link
                        to="/wallet"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-brand-cyan" />
                        Wallet & Deposit
                      </Link>

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold gradient-btn"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-brand-surface border border-white/10 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-background-card px-4 py-4 space-y-3"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full bg-background text-sm rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </form>

            <div className="flex flex-col gap-2 pt-2 text-sm font-medium">
              <Link
                to="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200"
              >
                🎮 Explore Games
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200"
              >
                📂 Categories
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-cyan" /> Shopping Cart
                </span>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-xs">
                    {itemCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-brand-surface border border-brand-cyan/20 text-brand-cyan flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Wallet Balance
                  </span>
                  <span className="font-bold text-white">${Number(user?.balance || 0).toFixed(2)}</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
