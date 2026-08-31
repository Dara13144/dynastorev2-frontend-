import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, Loader2, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import authService from '../services/auth.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setErrorMsg(null);
    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      toast.success('Verification code dispatched to your email.');

      // Save email in sessionStorage for verify step
      sessionStorage.setItem('dynastore_reset_email', email.trim().toLowerCase());

      // Redirect to /verify-otp
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        state: { email: email.trim().toLowerCase(), devCode: res.otpCode },
      });
    } catch (err) {
      const msg = err.formattedMessage || err.message || 'Failed to dispatch verification code.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center mx-auto shadow-neon-cyan">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white font-display">Forgot your password?</h1>
          <p className="text-xs text-slate-400">
            Enter your email address and we'll send you a 6-digit verification code.
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

        <form onSubmit={handleRequestOtp} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Send OTP</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
