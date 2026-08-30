import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2, Loader2, KeyRound, Lock, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import API from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1 = Request Code, 2 = Verify Code & Reset Password, 3 = Success
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // If user arrives via email link with code or token, jump to Step 2
  useEffect(() => {
    const queryEmail = searchParams.get('email');
    const queryCode = searchParams.get('code');
    const queryToken = searchParams.get('token');

    if (queryEmail) setEmail(queryEmail);
    if (queryCode) setCode(queryCode);
    if (queryToken) setToken(queryToken);

    if (queryEmail && (queryCode || queryToken)) {
      setStep(2);
    }
  }, [searchParams]);

  // Step 1: Send Reset OTP Code to Email
  const handleRequestCode = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setErrorMsg(null);
    try {
      setLoading(true);
      const res = await API.post('/auth/forgot-password', { email });
      toast.success('6-Digit verification code sent to your email!');
      if (res.data?.resetCode) {
        setDevCode(res.data.resetCode);
      }
      setStep(2);
    } catch (err) {
      const msg = err.formattedMessage || err.message || 'Failed to request reset code';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend Code
  const handleResendCode = async () => {
    if (!email || resending) return;
    try {
      setResending(true);
      setErrorMsg(null);
      const res = await API.post('/auth/forgot-password', { email });
      toast.success('New 6-digit verification code sent!');
      if (res.data?.resetCode) {
        setDevCode(res.data.resetCode);
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!code || code.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      toast.error('Please enter the verification code');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      toast.error('Password too short');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await API.post('/auth/reset-password', {
        email,
        code: code.trim(),
        token: token || undefined,
        new_password: newPassword,
      });

      setStep(3);
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg = err.formattedMessage || err.message || 'Failed to reset password';
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
          <span>Back to Sign In</span>
        </Link>

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

        <AnimatePresence mode="wait">
          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center mx-auto shadow-neon-cyan">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-white font-display">Forgot Password</h1>
                <p className="text-xs text-slate-400">
                  Enter your registered Gmail or account email. We'll send a 6-digit recovery code.
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
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
                  <span>Send Recovery Code</span>
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Enter 6-Digit Code & New Password */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-neon-cyan">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-white font-display">Enter Reset Code</h1>
                <p className="text-xs text-slate-400">
                  We sent a 6-digit code to <span className="text-brand-cyan font-bold">{email}</span>. Check your inbox or spam folder.
                </p>
              </div>

              {/* Dev mode helper */}
              {devCode && (
                <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-center text-xs text-brand-cyan">
                  <span>Development OTP Code: <strong>{devCode}</strong></span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-Digit Code Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      required
                      className="w-full bg-background-card text-center tracking-[8px] font-mono font-bold text-lg text-brand-cyan rounded-xl py-3 border border-white/15 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full bg-background-card text-white text-sm rounded-xl pl-10 pr-4 py-3 border border-white/10 focus:outline-none focus:border-brand-cyan"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Save New Password & Log In</span>
                </button>

                {/* Resend Code Link */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resending}
                    className="text-brand-cyan hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{resending ? 'Resending...' : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Password Successfully Reset */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-white font-display">Password Reset!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your account password has been updated securely. You can now sign in to DynaStore with your new credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold shadow-neon-cyan"
              >
                Sign In Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
