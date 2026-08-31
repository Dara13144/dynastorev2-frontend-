import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, QrCode, ShieldCheck, CheckCircle2, AlertCircle, X, Loader2, KeyRound, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/auth.js';
import { useToast } from '../context/ToastContext.jsx';

export default function DeviceScanModal({ isOpen, onClose }) {
  const toast = useToast();

  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera access is not supported on this browser.');
      }
    } catch (err) {
      console.warn('Camera stream notice:', err.message);
      setCameraError('Camera permission was denied or is unavailable.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setAuthorized(false);
      setInputCode('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleAuthorize = async (codeToUse) => {
    const raw = (codeToUse || inputCode || '').trim();
    if (!raw) {
      toast.error('Please enter a valid QR session code.');
      return;
    }

    // Extract session if URL was pasted
    let cleanSession = raw;
    if (raw.includes('session=')) {
      cleanSession = raw.split('session=')[1]?.split('&')[0];
    } else if (raw.includes('login_')) {
      cleanSession = raw.split('login_')[1]?.split('&')[0];
    }

    try {
      setLoading(true);
      await authService.authorizeDeviceQr(cleanSession);

      setAuthorized(true);
      stopCamera();

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#10b981', '#ffffff'],
      });

      toast.success('Device linked and logged in successfully!');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to authorize device');
    } finally {
      setLoading(false);
    }
  };

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
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white font-display">
            Scan & Link Device
          </h3>
          <p className="text-xs text-slate-400">
            Point your camera at the QR code on your computer screen to log in
          </p>
        </div>

        {/* Camera Viewfinder / Scanner Area */}
        <div className="relative mx-auto w-56 h-56 rounded-2xl bg-black/60 border-2 border-dashed border-brand-cyan/50 overflow-hidden flex items-center justify-center">
          {authorized ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-2 text-emerald-400 p-4"
            >
              <CheckCircle2 className="w-14 h-14 animate-bounce" />
              <span className="text-xs font-bold text-emerald-300">DEVICE LINKED!</span>
            </motion.div>
          ) : cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Laser Scanning Line */}
              <motion.div
                animate={{ y: [-90, 90, -90] }}
                transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-[0_0_12px_#00f0ff]"
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
              <QrCode className="w-10 h-10 text-brand-cyan/60" />
              <span className="text-[11px] text-slate-400">
                {cameraError || 'Camera inactive. You can enter or paste the session code below.'}
              </span>
            </div>
          )}
        </div>

        {/* Manual Code Entry Form */}
        {!authorized && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAuthorize();
            }}
            className="space-y-3 pt-1"
          >
            <div className="relative">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Paste session code or QR link"
                className="w-full bg-background-card text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-brand-cyan"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-neon-cyan"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Approve & Authorize PC Login</span>
            </button>
          </form>
        )}

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bi-directional cryptographic handshake</span>
        </div>
      </motion.div>
    </div>
  );
}
