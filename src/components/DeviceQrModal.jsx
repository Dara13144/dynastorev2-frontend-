import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Laptop, Smartphone, RefreshCw, CheckCircle2, ShieldCheck, Copy, Sparkles, X, Loader2, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function DeviceQrModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [status, setStatus] = useState('PENDING'); // PENDING | APPROVED | EXPIRED
  const [approving, setApproving] = useState(false);

  const pollTimerRef = useRef(null);

  const initQr = async () => {
    try {
      setLoading(true);
      setStatus('PENDING');
      setTimeLeft(180);

      const data = await authService.createDeviceQr();
      if (data?.sessionId) {
        setSessionId(data.sessionId);
        setQrValue(data.qrUrl || `https://dynastore.site/scan-device?session=${data.sessionId}`);
      }
    } catch (err) {
      console.error('Failed to create Device QR session:', err);
      toast.error('Failed to generate Device QR. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initQr();
    } else {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || status !== 'PENDING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  // Auto-polling for QR confirmation
  useEffect(() => {
    if (!isOpen || !sessionId || status !== 'PENDING') {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await authService.getDeviceQrStatus(sessionId);
        if (res.status === 'APPROVED' && res.token && res.user) {
          clearInterval(pollTimerRef.current);
          setStatus('APPROVED');

          // Save session
          localStorage.setItem('dynastore_token', res.token);
          localStorage.setItem('dynastore_user', JSON.stringify(res.user));

          // Trigger Confetti
          confetti({
            particleCount: 90,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#3b82f6', '#10b981', '#ffffff'],
          });

          toast.success(`Device Verified! Welcome back, ${res.user.username || 'Gamer'}!`);

          setTimeout(() => {
            if (onSuccess) onSuccess(res);
            onClose();
          }, 1200);
        } else if (res.status === 'EXPIRED') {
          setStatus('EXPIRED');
          clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        // Retry next interval
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, sessionId, status]);

  // Test Auto-Approve simulation
  const handleSimulateApprove = async () => {
    if (!sessionId) return;
    try {
      setApproving(true);
      // If user is currently logged in, use their real token, else fake test user
      if (user) {
        await authService.authorizeDeviceQr(sessionId);
      } else {
        // Call direct confirmation
        await authService.confirmDeviceQr(sessionId, {
          username: 'cross_device_user',
          first_name: 'Dyna',
          last_name: 'Player',
        });
      }
    } catch (err) {
      toast.error(err.message || 'Authorization notice');
    } finally {
      setApproving(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-sm rounded-3xl bg-[#0b0f19] border border-brand-cyan/30 p-6 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-center space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/40 flex items-center justify-center mx-auto text-brand-cyan shadow-neon-cyan">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-white font-display">
            Scan with Your Phone
          </h3>
          <p className="text-xs text-slate-400">
            Open DynaStore on your logged-in phone or scan with any QR scanner to login on this device
          </p>
        </div>

        {/* QR Code Container */}
        <div className="relative mx-auto w-52 h-52 rounded-2xl bg-white p-3.5 shadow-xl flex items-center justify-center border-4 border-brand-cyan/40 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-900">
              <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
              <span className="text-[11px] font-bold text-slate-600">Generating QR...</span>
            </div>
          ) : status === 'APPROVED' ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2 text-emerald-600"
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
              <span className="text-xs font-black text-emerald-700">DEVICE AUTHORIZED!</span>
            </motion.div>
          ) : status === 'EXPIRED' ? (
            <div className="flex flex-col items-center gap-2.5 text-slate-800">
              <span className="text-xs font-bold text-rose-600">QR Code Expired</span>
              <button
                onClick={initQr}
                className="px-3.5 py-1.5 rounded-xl bg-brand-cyan text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-300 transition shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload QR
              </button>
            </div>
          ) : (
            <>
              {/* QR Code SVG */}
              <QRCodeSVG
                value={qrValue}
                size={180}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: '/logo.png',
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />

              {/* Animated Laser Scanning Line */}
              <motion.div
                animate={{ y: [-75, 75, -75] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-[0_0_12px_#00f0ff]"
              />
            </>
          )}
        </div>

        {/* Status & Timer */}
        {status === 'PENDING' && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
              <span>Waiting for authorization...</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-brand-cyan text-[11px] font-mono">
                {formattedTime}
              </span>
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Cross-Device Handshake</span>
        </div>
      </motion.div>
    </div>
  );
}
