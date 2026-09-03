import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || null;

  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const navigateAfterAuth = (userData) => {
    if (userData?.role === 'ADMIN') {
      navigate('/admin');
    } else if (redirectTarget) {
      navigate(redirectTarget);
    } else {
      navigate('/');
    }
  };

  const handleGoogleOAuth = async () => {
    setAuthError(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res?.redirect) return;
      if (res?.success) {
        toast.success(`Welcome to DynaStore, ${res.user?.username || 'Gamer'}!`);
        navigateAfterAuth(res.user);
      }
    } catch (err) {
      console.warn('Google login notice:', err.message);
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="py-20 max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 relative">
          <Link to="/" className="inline-block mb-2">
            <img
              src="/logo.png"
              alt="DynaStore"
              className="w-16 h-16 rounded-full mx-auto object-contain bg-white/95 p-1 shadow-neon-cyan"
            />
          </Link>
          <h1 className="text-2xl font-black text-white font-display">Sign In to DynaStore</h1>
          <p className="text-xs text-slate-400">
            Sign in with your Google account for instant access to your games and library
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="flex-1">{authError}</span>
          </div>
        )}

        {/* Primary Google Sign-In Button */}
        <div>
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleOAuth}
            className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 group hover:scale-[1.01]"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Secured by Google OAuth & Supabase Cloud</span>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-cyan hover:underline">
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
