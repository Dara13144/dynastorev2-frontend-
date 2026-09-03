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
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLanguage();
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
          <Link to="/" className="flex items-center gap-3 group shrink-0">
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
              placeholder={t('nav.searchPlaceholder')}
              className="w-full bg-background/80 text-sm text-slate-200 placeholder-slate-500 rounded-full pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan/60 focus:ring-1 focus:ring-brand-cyan/40 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          </form>

          {/* Nav Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/games" className="hover:text-brand-cyan transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <span>{t('nav.exploreGames')}</span>
            </Link>
            <Link to="/categories" className="hover:text-brand-cyan transition-colors">
              <span>{t('nav.categories')}</span>
            </Link>
          </div>

          {/* User Controls & Language */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Wallet Pill (if authenticated) */}
            {isAuthenticated && (
              <Link
                to="/wallet"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-cyan/30 hover:border-brand-cyan transition-all shadow-sm group"
              >
                <Wallet className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition-transform" />
                <div className="text-xs">
                  <span className="text-slate-400 mr-1">{t('nav.balance')}:</span>
                  <span className="font-bold text-white">${Number(user?.balance || 0).toFixed(2)}</span>
                </div>
                <PlusCircle className="w-3.5 h-3.5 text-brand-cyan opacity-80" />
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl bg-brand-surface border border-white/10 hover:border-brand-cyan/50 text-slate-300 hover:text-white transition-all shadow-sm group"
              title={t('nav.cart')}
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
                  className="flex items-center p-1 rounded-xl bg-brand-surface/80 border border-white/10 hover:border-brand-cyan/50 transition-all focus:outline-none"
                  title={user?.username || 'User Profile'}
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg bg-slate-800 object-cover"
                  />
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
                          <span className="text-slate-400">{t('nav.role')}</span>
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
                          {t('nav.adminConsole')}
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        {t('nav.profile')}
                      </Link>

                      <Link
                        to="/downloads"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        {t('nav.downloads')}
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Package className="w-4 h-4 text-purple-400" />
                        {t('nav.orders')}
                      </Link>

                      <Link
                        to="/wallet"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-brand-cyan" />
                        {t('nav.wallet')}
                      </Link>

                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav.logout')}
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
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-100 text-slate-950 flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In with Google</span>
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
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10">
              <span className="text-xs text-slate-400 font-semibold">{t('nav.language')}:</span>
              <LanguageSwitcher />
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-background text-sm rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </form>

            <div className="flex flex-col gap-2 pt-2 text-sm font-medium">
              <Link
                to="/games"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 flex items-center gap-2"
              >
                <span>🎮</span> {t('nav.exploreGames')}
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 flex items-center gap-2"
              >
                <span>📂</span> {t('nav.categories')}
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-brand-cyan" /> {t('nav.cart')}
                </span>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-xs">
                    {itemCount}
                  </span>
                )}
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/wallet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg bg-brand-surface border border-brand-cyan/20 text-brand-cyan flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> {t('nav.wallet')}
                    </span>
                    <span className="font-bold text-white">${Number(user?.balance || 0).toFixed(2)}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full px-3 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
