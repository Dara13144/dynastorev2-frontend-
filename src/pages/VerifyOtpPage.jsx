import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Loader2, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import authService from '../services/auth.js';
import { useToast } from '../context/ToastContext.jsx';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const initialEmail =
    location.state?.email ||
    searchParams.get('email') ||
    sessionStorage.getItem('dynastore_reset_email') ||
    '';

  const devCode = location.state?.devCode || null;

  const [email] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 5:00 expiration timer (300 seconds)
  const [expiresIn, setExpiresIn] = useState(300);
  // 60-second resend cooldown
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = useRef([]);

  // Auto-focus first box
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Expiration countdown
  useEffect(() => {
    if (expiresIn <= 0) return;
    const timer = setInterval(() => setExpiresIn((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [expiresIn]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // Pasted full OTP string
      const pasted = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;
    const newDigits = [...otpDigits];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newDigits[i] = char;
    });
    setOtpDigits(newDigits);
    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx]?.focus();
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email) return;
    try {
      setResending(true);
      setErrorMsg(null);
      await authService.resendOtp(email);
      toast.success('New 6-digit verification code dispatched.');
      setResendCooldown(60);
      setExpiresIn(300);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.formattedMessage || err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');

    if (fullCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      toast.error('Please enter complete 6-digit OTP.');
      return;
    }

    if (expiresIn <= 0) {
      setErrorMsg('OTP has expired. Please request a new verification code.');
      toast.error('OTP has expired.');
      return;
    }

    setErrorMsg(null);
    try {
      setLoading(true);
      const res = await authService.verifyOtp(email, fullCode);
      toast.success('OTP verified successfully.');

      const resetToken = res.resetToken || res.token;
      if (resetToken) {
        sessionStorage.setItem('dynastore_reset_token', resetToken);
      }

      // Redirect to /reset-password with resetToken passed securely
      navigate('/reset-password', {
        state: { resetToken, email },
      });
    } catch (err) {
      const msg = err.formattedMessage || err.message || 'Invalid or expired OTP.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="py-12 max-w-md mx-auto px-4">
        <div className="rounded-3xl glass-panel border border-white/10 p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Email Specified</h2>
          <p className="text-xs text-slate-400">Please start the password recovery process from the beginning.</p>
          <Link
            to="/forgot-password"
            className="inline-block py-2.5 px-6 rounded-xl gradient-btn text-xs font-bold shadow-neon-cyan"
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden"
      >
        {/* Back Link */}
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-neon-cyan">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white font-display">Verify OTP</h1>
          <p className="text-xs text-slate-400">
            Enter the 6-digit verification code sent to <span className="text-brand-cyan font-bold">{email}</span>
          </p>
        </div>

        {/* Development Helper */}
        {devCode && (
          <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-center text-xs text-brand-cyan">
            <span>Dev OTP Code: <strong>{devCode}</strong></span>
          </div>
        )}

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

        {/* 6-Digit OTP Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-13 sm:h-14 text-center font-mono font-bold text-xl text-brand-cyan bg-background-card border border-white/15 rounded-xl focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
              />
            ))}
          </div>

          {/* Countdown & Expiration status */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            <span>
              {expiresIn > 0 ? `OTP expires in ${formatTime(expiresIn)}` : 'OTP has expired'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || expiresIn <= 0 || otpDigits.join('').length < 6}
            className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-neon-cyan disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Verify OTP</span>
          </button>

          {/* Resend OTP Row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <Link to="/forgot-password" className="text-slate-400 hover:text-white transition">
              Change email
            </Link>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="text-brand-cyan hover:underline flex items-center gap-1 font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending
                  ? 'Resending...'
                  : resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : 'Resend OTP'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
