import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Mail, ArrowRight, Loader2, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNavigate } from 'react-router-dom';

const PRESET_GOOGLE_ACCOUNTS = [
  {
    email: 'dynastore2-904758-39q457@gmai.com',
    name: 'DynaMaster Admin',
    role: 'ADMIN',
    badge: '👑 Master Admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dynastore2',
  },
  {
    email: 'mdara9695@gmail.com',
    name: 'Dara Admin',
    role: 'ADMIN',
    badge: '👑 Admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mdara9695',
  },
  {
    email: 'dinacomputer0110@gmail.com',
    name: 'Dina Computer',
    role: 'ADMIN',
    badge: '👑 Admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dinacomputer0110',
  },
  {
    email: 'iqbalahmed88600@gmail.com',
    name: 'Iqbal Ahmed',
    role: 'ADMIN',
    badge: '👑 Admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=iqbalahmed88600',
  }
];

export default function GoogleSignInModal({ isOpen, onClose }) {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (account) => {
    try {
      setLoadingEmail(account.email);
      await loginWithGoogle({
        email: account.email,
        name: account.name,
        picture: account.avatar,
        sub: `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      toast.success(`Signed in as ${account.name} successfully!`);
      onClose();
      if (account.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Google Sign-In failed');
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) return;

    try {
      setLoadingEmail(customEmail);
      const name = customName || customEmail.split('@')[0];
      await loginWithGoogle({
        email: customEmail,
        name: name,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${customEmail}`,
        sub: `google_${customEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      });
      toast.success(`Signed in with Google as ${name}!`);
      onClose();
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Google Sign-In failed');
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#10131d] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white p-2.5 mx-auto shadow-md flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
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
            </div>
            <h3 className="text-xl font-bold text-white font-display">Choose Google Account</h3>
            <p className="text-xs text-slate-400">Select an authorized Google account or enter custom Gmail</p>
          </div>

          {/* Pre-approved Google Accounts List */}
          <div className="space-y-2.5">
            {PRESET_GOOGLE_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                disabled={loadingEmail !== null}
                onClick={() => handleSelectAccount(acc)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-cyan/40 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full border border-brand-cyan/40 p-0.5 bg-slate-900"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-brand-cyan transition">
                        {acc.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-cyan/20 text-brand-cyan font-bold border border-brand-cyan/30">
                        {acc.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{acc.email}</span>
                  </div>
                </div>

                {loadingEmail === acc.email ? (
                  <Loader2 className="w-5 h-5 text-brand-cyan animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-cyan group-hover:translate-x-1 transition" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Google Email Accordion */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full py-2.5 text-xs text-brand-cyan font-semibold hover:underline flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use another Google account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-white/10 space-y-3">
              <div className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-background text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-brand-cyan"
                />
                <input
                  type="text"
                  placeholder="Your Full Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-background text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <button
                type="submit"
                disabled={loadingEmail !== null}
                className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loadingEmail === customEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Sign In with this Google Email</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Security badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-emerald" />
            <span>Encrypted with JWT Authentication & Supabase PostgreSQL</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
