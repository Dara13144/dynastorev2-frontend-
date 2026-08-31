import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import authService from '../services/auth.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const resetToken =
    location.state?.resetToken ||
    sessionStorage.getItem('dynastore_reset_token') ||
    '';

  const email =
    location.state?.email ||
    sessionStorage.getItem('dynastore_reset_email') ||
    '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Route Protection: If no resetToken, redirect to /forgot-password
  useEffect(() => {
    if (!resetToken) {
      toast.error('Reset authorization token missing. Please start password recovery.');
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must contain at least 8 characters.');
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify and try again.');
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        resetToken,
        newPassword,
        email,
      });

      // Clear reset session storage
      sessionStorage.removeItem('dynastore_reset_token');
      sessionStorage.removeItem('dynastore_reset_email');

      setIsSuccess(true);
      toast.success('Password reset successfully.');
    } catch (err) {
      const msg = err.formattedMessage || err.message || 'Password reset failed.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return null;
  }

  return (
    <div className="py-12 max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {isSuccess ? (
          <div className="text-center space-y-5 py-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-white font-display">Password Reset!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Password reset successfully. You can now log in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold shadow-neon-cyan"
            >
              Sign In to Your Account
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center mx-auto shadow-neon-cyan">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black text-white font-display">Create New Password</h1>
              <p className="text-xs text-slate-400">
                Your OTP was verified. Please choose a secure new password (min. 8 characters).
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-10 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    minLength={8}
                    className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-10 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Reset Password</span>
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
