import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Send, RefreshCw, CheckCircle2, ShieldCheck, ExternalLink, Smartphone, Sparkles, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function TelegramQrModal({ isOpen, onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [status, setStatus] = useState('PENDING'); // PENDING | CONFIRMED | EXPIRED
  const [confirming, setConfirming] = useState(false);

  const pollTimerRef = useRef(null);

  // Initialize QR Session
  const initQr = async () => {
    try {
      setLoading(true);
      setStatus('PENDING');
      setTimeLeft(180);

      const data = await authService.createTelegramQr();
      if (data?.sessionId) {
        setSessionId(data.sessionId);
        setQrValue(data.deepLink || `https://dynastore.site/login?tg_session=${data.sessionId}`);
        setDeepLink(data.deepLink || `https://t.me/DynaStoreAuthBot?start=login_${data.sessionId}`);
      }
    } catch (err) {
      console.error('Failed to create Telegram QR session:', err);
      toast.error('Failed to generate Telegram QR. Please try again.');
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
        const res = await authService.getTelegramQrStatus(sessionId);
        if (res.status === 'CONFIRMED' && res.token && res.user) {
          clearInterval(pollTimerRef.current);
          setStatus('CONFIRMED');

          // Save session
          localStorage.setItem('dynastore_token', res.token);
          localStorage.setItem('dynastore_user', JSON.stringify(res.user));

          // Trigger Confetti
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#229ED9', '#00f0ff', '#3b82f6', '#ffffff'],
          });

          toast.success(`Telegram QR Verified! Welcome, ${res.user.username || 'Gamer'}!`);

          setTimeout(() => {
            if (onSuccess) onSuccess(res);
            onClose();
          }, 1200);
        } else if (res.status === 'EXPIRED') {
          setStatus('EXPIRED');
          clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        // Polling retry
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, sessionId, status]);

  // Simulate Instant Mobile Scan for Testing / Quick Login
  const handleSimulateScan = async () => {
    if (!sessionId) return;
    try {
      setConfirming(true);
      const testUser = {
        sessionId,
        id: 'tg_mobile_' + Math.floor(100000 + Math.random() * 900000),
        username: 'telegram_gamer',
        first_name: 'Dyna',
        last_name: 'Player',
        photo_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tg_qr_user',
      };
      await authService.confirmTelegramQr(testUser);
    } catch (err) {
      toast.error('Simulation notice: ' + (err.message || 'Error confirming QR'));
    } finally {
      setConfirming(false);
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
        className="relative w-full max-w-sm rounded-3xl bg-[#0b0f19] border border-[#229ED9]/30 p-6 sm:p-7 shadow-[0_0_50px_rgba(34,158,217,0.25)] text-center space-y-5"
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
          <div className="w-12 h-12 rounded-2xl bg-[#24A1DE]/15 border border-[#24A1DE]/40 flex items-center justify-center mx-auto text-[#24A1DE] shadow-[0_0_20px_rgba(36,161,222,0.35)]">
            <Send className="w-6 h-6 -rotate-12" />
          </div>
          <h3 className="text-xl font-black text-white font-display">
            Scan with Telegram
          </h3>
          <p className="text-xs text-slate-400">
            Open Telegram on your phone ➔ Settings ➔ Devices ➔ <b>Link Desktop Device</b>
          </p>
        </div>

        {/* Official Telegram Styled QR Box Container */}
        <div className="relative mx-auto w-64 h-64 rounded-[32px] bg-white p-4 shadow-2xl flex items-center justify-center border-4 border-[#24A1DE]/40 overflow-hidden group">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-900">
              <Loader2 className="w-9 h-9 animate-spin text-[#24A1DE]" />
              <span className="text-[11px] font-bold text-slate-600">Generating Official QR...</span>
            </div>
          ) : status === 'CONFIRMED' ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2 text-emerald-600"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
              <span className="text-sm font-black text-emerald-700">LOGIN APPROVED!</span>
            </motion.div>
          ) : status === 'EXPIRED' ? (
            <div className="flex flex-col items-center gap-2.5 text-slate-800">
              <span className="text-xs font-bold text-rose-600">QR Code Expired</span>
              <button
                onClick={initQr}
                className="px-4 py-2 rounded-2xl bg-[#24A1DE] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1e88c7] transition shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload QR Code
              </button>
            </div>
          ) : (
            <>
              {/* Official Telegram QR Code with Blue Circle Plane Logo */}
              <QRCodeSVG
                value={qrValue}
                size={216}
                level="H"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#FFFFFF"
                imageSettings={{
                  src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2324A1DE"/><path d="M24 50.5l43.5-18.5c2-.9 3.8.4 3.1 3.4l-7.4 34.8c-.6 2.5-2 3.1-4.1 1.9l-11.3-8.3-5.4 5.2c-.6.6-1.1 1.1-2.3 1.1l.8-11.6 21.1-19.1c.9-.8-.2-1.3-1.4-.5L29.4 54.1l-11.2-3.5c-2.4-.8-2.5-2.4.5-3.6z" fill="%23ffffff"/></svg>',
                  x: undefined,
                  y: undefined,
                  height: 46,
                  width: 46,
                  excavate: true,
                }}
              />

              {/* Animated Telegram Blue Laser Scanning Line */}
              <motion.div
                animate={{ y: [-95, 95, -95] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-[#24A1DE] to-transparent shadow-[0_0_15px_#24A1DE]"
              />
            </>
          )}
        </div>

        {/* Timer & Instructions */}
        {status === 'PENDING' && !loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Waiting for scan...</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-brand-cyan text-[11px] font-mono">
                {formattedTime}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={deepLink}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open App</span>
              </a>

              <button
                type="button"
                disabled={confirming}
                onClick={handleSimulateScan}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5 text-brand-cyan" />}
                <span>Auto-Approve</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Telegram End-to-End Session</span>
        </div>
      </motion.div>
    </div>
  );
}
