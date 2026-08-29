import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Mail, Lock, User, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      toast.success('Signed in with Google successfully! Welcome to DynaStore.');
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'origin_mismatch' || err.message?.includes('origin_mismatch')) {
        setAuthError('Google Sign-In is not configured for this website origin. Please contact the site administrator.');
        toast.error('Google Sign-In is not configured for this website origin.');
      } else {
        setAuthError(err.message || 'Google Sign-In failed');
        toast.error(err.message || 'Google Sign-In failed');
      }
    } finally {
      setGoogleLoading(false);
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
      await register(email, username, password);
      toast.success('Account created successfully! Welcome to DynaStore.');
      navigate('/');
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

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
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
            <span>{googleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-background-card px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider absolute">
            Or with email
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
