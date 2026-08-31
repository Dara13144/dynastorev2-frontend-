import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Mail, Lock, LogIn, ArrowRight, ShieldCheck, Loader2, AlertCircle, Sparkles, KeyRound, RefreshCw, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithGoogleEmail, loginWithTelegram, sendOtp, loginWithOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || null;

  const [authMode, setAuthMode] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showInstantGoogle, setShowInstantGoogle] = useState(false);
  const [instantEmail, setInstantEmail] = useState('');
  const [showTelegramInput, setShowTelegramInput] = useState(false);
  const [telegramHandle, setTelegramHandle] = useState('');

  // OTP Cooldown timer
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

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
        const res = await loginWithGoogleEmail(email);
        toast.success(`Welcome to DynaStore, ${res.user?.username || 'Gamer'}!`);
        navigateAfterAuth(res.user);
        return;
      } catch (err) {
        console.warn('Instant login notice:', err);
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
      toast.success(`Signed in with Google as ${res.user?.username || instantEmail}!`);
      navigateAfterAuth(res.user);
    } catch (err) {
      toast.error(err.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleTelegramLogin = async () => {
    setAuthError(null);
    // If Telegram WebApp is available
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      try {
        setTelegramLoading(true);
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        const res = await loginWithTelegram(tgUser);
        toast.success(`Welcome to DynaStore, ${res.user?.username || tgUser.first_name}!`);
        navigateAfterAuth(res.user);
        return;
      } catch (err) {
        console.warn('Telegram WebApp login notice:', err);
      } finally {
        setTelegramLoading(false);
      }
    }

    // Toggle Telegram input prompt
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
      toast.success(`Logged in via Telegram as @${res.user?.username || clean}!`);
      navigateAfterAuth(res.user);
    } catch (err) {
      setAuthError(err.formattedMessage || err.message || 'Telegram login failed');
      toast.error(err.formattedMessage || err.message || 'Telegram login failed');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid Gmail / email address');
      return;
    }
    setAuthError(null);
    try {
      setOtpLoading(true);
      await sendOtp(email, 'LOGIN_OTP');
      setOtpSent(true);
      setCooldown(60);
      toast.success('6-Digit verification code dispatched to your Gmail!');
    } catch (err) {
      setAuthError(err.formattedMessage || err.message || 'Failed to dispatch Gmail code');
      toast.error(err.formattedMessage || err.message || 'Failed to dispatch Gmail code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter the 6-digit code sent to your Gmail');
      return;
    }
    setAuthError(null);
    try {
      setLoading(true);
      const res = await loginWithOtp(email, otpCode);
      toast.success(`Welcome to DynaStore, ${res.user?.username || 'Gamer'}!`);
      navigateAfterAuth(res.user);
    } catch (err) {
      setAuthError(err.formattedMessage || err.message || 'Invalid or expired Gmail code');
      toast.error(err.formattedMessage || err.message || 'Invalid or expired Gmail code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      setLoading(true);
      const res = await login(email, password);
      toast.success('Welcome back to DynaStore!');
      navigateAfterAuth(res.user);
    } catch (err) {
      setAuthError(err.formattedMessage || err.message || 'Login failed');
      toast.error(err.formattedMessage || err.message || 'Login failed');
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
          <h1 className="text-2xl font-black text-white font-display">Welcome Back</h1>
          <p className="text-xs text-slate-400">Log in to access your game library, wallet, and orders</p>
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
            disabled={googleLoading || loading || otpLoading}
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

          {/* Telegram Sign In Button */}
          <button
            type="button"
            disabled={telegramLoading || googleLoading || loading || otpLoading}
            onClick={handleTelegramLogin}
            className="w-full py-3 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1E88C7] text-white font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
          >
            {telegramLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white -rotate-12" />
            )}
            <span>
              {telegramLoading ? 'Connecting Telegram...' : 'Continue with Telegram'}
            </span>
          </button>

          {/* Instant Telegram Username / ID Form */}
          {showTelegramInput && (
            <form onSubmit={handleTelegramSubmit} className="p-3.5 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#229ED9] flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" /> Enter your Telegram Username or ID
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
                <span>Sign in with Telegram</span>
              </button>
            </form>
          )}

          {/* Instant Google Email Form */}
          {showInstantGoogle && (
            <form onSubmit={handleInstantGoogleSubmit} className="p-3.5 rounded-2xl bg-white/5 border border-brand-cyan/30 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-cyan flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sign in with your Google Email
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
                <span>Sign in as {instantEmail || 'Google User'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <div className="bg-background-card px-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuthMode('PASSWORD')}
              className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                authMode === 'PASSWORD' ? 'text-brand-cyan border-b-2 border-brand-cyan pb-0.5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Password
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setAuthMode('OTP')}
              className={`text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                authMode === 'OTP' ? 'text-brand-cyan border-b-2 border-brand-cyan pb-0.5' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Gmail OTP</span>
            </button>
          </div>
        </div>

        {/* AUTH MODE 1: PASSWORD LOGIN */}
        {authMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fadeIn">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-cyan hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Sign In with Password</span>
            </button>
          </form>
        )}

        {/* AUTH MODE 2: GMAIL OTP PASSWORDLESS LOGIN */}
        {authMode === 'OTP' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Gmail Address</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  disabled={otpSent && cooldown > 0}
                  className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-28 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <button
                  type="button"
                  disabled={otpLoading || cooldown > 0 || !email.includes('@')}
                  onClick={handleSendOtp}
                  className="absolute right-2 px-3 py-1.5 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan/30 text-brand-cyan border border-brand-cyan/30 text-xs font-bold transition disabled:opacity-40"
                >
                  {otpLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : cooldown > 0 ? (
                    `${cooldown}s`
                  ) : otpSent ? (
                    'Resend'
                  ) : (
                    'Get Code'
                  )}
                </button>
              </div>
            </div>

            {otpSent && (
              <form onSubmit={handleOtpLogin} className="space-y-4 animate-fadeIn">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">6-Digit Gmail Verification Code</label>
                    <span className="text-[11px] text-brand-cyan">Sent to {email}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      required
                      className="w-full bg-background-card text-center tracking-[8px] font-mono font-bold text-lg text-brand-cyan rounded-xl py-3 border border-white/15 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 4}
                  className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Verify Code & Sign In</span>
                </button>
              </form>
            )}

            {!otpSent && (
              <p className="text-[11px] text-slate-400 text-center">
                Click <strong>Get Code</strong> above to receive a 6-digit one-time code in your Gmail inbox. No password needed!
              </p>
            )}
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-cyan hover:underline">
            Register for free
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
