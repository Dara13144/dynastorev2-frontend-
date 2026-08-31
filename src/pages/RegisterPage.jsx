import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Mail, Lock, User, UserPlus, Loader2, AlertCircle, Sparkles, ArrowRight, ShieldCheck, Send, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import TelegramQrModal from '../components/TelegramQrModal.jsx';

export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithGoogleEmail, loginWithTelegram } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || null;

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showInstantGoogle, setShowInstantGoogle] = useState(false);
  const [instantEmail, setInstantEmail] = useState('');
  const [showTelegramInput, setShowTelegramInput] = useState(false);
  const [telegramHandle, setTelegramHandle] = useState('');

  const navigateAfterAuth = (userData) => {
    if (userData?.role === 'ADMIN') {
      navigate('/admin');
    } else if (redirectTarget) {
      navigate(redirectTarget);
    } else {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    if (email && email.includes('@')) {
      try {
        setGoogleLoading(true);
        const res = await loginWithGoogleEmail(email, username);
        toast.success(`Welcome to DynaStore, ${res.user?.username || 'Gamer'}!`);
        navigateAfterAuth(res.user);
        return;
      } catch (err) {
        console.warn('Instant register notice:', err);
      } finally {
        setGoogleLoading(false);
      }
    }

    try {
      setGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res?.redirect) {
        return; // Redirecting to OAuth provider
      }
      if (res?.cancelled) {
        setShowInstantGoogle(true);
        setInstantEmail(email || '');
        return;
      }
      if (res?.success) {
        toast.success(`Welcome to DynaStore, ${res.user?.username || 'Gamer'}!`);
        navigateAfterAuth(res.user);
      }
    } catch (err) {
      console.warn('Google Sign-In notice:', err.message);
      const errMsg = (err.message || '').toLowerCase();
      if (
        errMsg.includes('origin_mismatch') ||
        errMsg.includes('policy') ||
        errMsg.includes('400') ||
        errMsg.includes('failed') ||
        errMsg.includes('could not open') ||
        errMsg.includes('not loaded') ||
        errMsg.includes('blocked')
      ) {
        setShowInstantGoogle(true);
        setInstantEmail(email || '');
      } else if (!errMsg.includes('closed') && !errMsg.includes('cancelled')) {
        setAuthError(err.message || 'Google login failed');
        toast.error(err.message || 'Google login failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInstantGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!instantEmail || !instantEmail.includes('@')) return;
    try {
      setGoogleLoading(true);
      const res = await loginWithGoogleEmail(instantEmail);
      toast.success(`Registered & signed in with Google as ${res.user?.username || instantEmail}!`);
      navigateAfterAuth(res.user);
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleTelegramLogin = async () => {
    setAuthError(null);
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      try {
        setTelegramLoading(true);
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        const res = await loginWithTelegram(tgUser);
        toast.success(`Registered & signed in with Telegram as ${res.user?.username || tgUser.first_name}!`);
        navigateAfterAuth(res.user);
        return;
      } catch (err) {
        console.warn('Telegram WebApp register notice:', err);
      } finally {
        setTelegramLoading(false);
      }
    }
    setShowTelegramInput((prev) => !prev);
  };

  const handleTelegramSubmit = async (e) => {
    e.preventDefault();
    if (!telegramHandle || telegramHandle.trim().length < 2) {
      toast.error('Please enter your Telegram username or ID');
      return;
    }
    setAuthError(null);
    try {
      setTelegramLoading(true);
      const clean = telegramHandle.trim().replace(/^@/, '');
      const res = await loginWithTelegram({
        username: clean,
        telegram_id: clean,
        first_name: clean,
      });
      toast.success(`Registered via Telegram as @${res.user?.username || clean}!`);
      navigateAfterAuth(res.user);
    } catch (err) {
      setAuthError(err.formattedMessage || err.message || 'Telegram registration failed');
      toast.error(err.formattedMessage || err.message || 'Telegram registration failed');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const res = await register(email, username, password);
      toast.success('Account created successfully! Welcome to DynaStore.');
      navigateAfterAuth(res.user);
    } catch (err) {
      setAuthError(err.formattedMessage || 'Registration failed');
      toast.error(err.formattedMessage || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block mb-3">
            <img
              src="/logo.png"
              alt="DynaStore"
              className="w-16 h-16 rounded-full mx-auto object-contain bg-white/95 p-1 shadow-neon-cyan"
            />
          </Link>
          <h1 className="text-2xl font-black text-white font-display">Create Account</h1>
          <p className="text-xs text-slate-400">Join thousands of gamers in Cambodia today</p>
        </div>

        {/* Error Alert if any */}
        {authError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Google Sign In Button & Options */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
            <span className="group-hover:text-black">
              {googleLoading ? 'Connecting with Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Telegram Sign Up Buttons: 1-Click + QR Scanner */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={telegramLoading || googleLoading || loading}
              onClick={handleTelegramLogin}
              className="py-3 px-3 rounded-2xl bg-[#229ED9] hover:bg-[#1E88C7] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
            >
              {telegramLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4 text-white -rotate-12" />
              )}
              <span className="truncate">Telegram</span>
            </button>

            <button
              type="button"
              disabled={telegramLoading || googleLoading || loading}
              onClick={() => setShowQrModal(true)}
              className="py-3 px-3 rounded-2xl bg-[#0b0f19] hover:bg-white/10 border border-[#229ED9]/40 text-[#229ED9] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
            >
              <QrCode className="w-4 h-4 text-[#229ED9] group-hover:text-white" />
              <span className="truncate">Scan QR Code</span>
            </button>
          </div>

          {/* Telegram QR Modal */}
          <TelegramQrModal
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            onSuccess={(res) => navigateAfterAuth(res?.user)}
          />

          {/* Instant Telegram Username / ID Form */}
          {showTelegramInput && (
            <form onSubmit={handleTelegramSubmit} className="p-3.5 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#229ED9] flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Sign up with Telegram Username or ID
                </span>
                <button
                  type="button"
                  onClick={() => setShowTelegramInput(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="@username or User ID"
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
                className="w-full bg-background-card text-white text-xs rounded-xl px-3 py-2 border border-white/15 focus:outline-none focus:border-[#229ED9]"
              />
              <button
                type="submit"
                disabled={telegramLoading}
                className="w-full py-2 rounded-xl bg-[#229ED9] hover:bg-[#1E88C7] text-white font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {telegramLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>Register with Telegram</span>
              </button>
            </form>
          )}

          {/* Instant Google Email Sign-In Form on Origin Mismatch */}
          {showInstantGoogle && (
            <form onSubmit={handleInstantGoogleSubmit} className="p-3.5 rounded-2xl bg-white/5 border border-brand-cyan/30 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-cyan flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sign up with your Google Email
                </span>
                <button
                  type="button"
                  onClick={() => setShowInstantGoogle(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={instantEmail}
                onChange={(e) => setInstantEmail(e.target.value)}
                className="w-full bg-background-card text-white text-xs rounded-xl px-3 py-2 border border-white/15 focus:outline-none focus:border-brand-cyan"
              />
              <button
                type="submit"
                disabled={googleLoading}
                className="w-full py-2 rounded-xl bg-brand-cyan hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                <span>Sign up as {instantEmail || 'Google User'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-background-card px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider absolute">
            Or with password
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="GamerTag99"
                required
                className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Register Account</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-cyan hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
