import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, QrCode, ShieldCheck, CheckCircle2, AlertCircle, X, Loader2, Sparkles, RefreshCw, Smartphone, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function DeviceScanModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('SHOW_QR'); // 'SHOW_QR' | 'SCAN_CAMERA'

  // Show QR state
  const [qrLoading, setQrLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [qrStatus, setQrStatus] = useState('PENDING'); // PENDING | APPROVED | EXPIRED
  const [copied, setCopied] = useState(false);

  // Scanner state
  const [inputCode, setInputCode] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const pollTimerRef = useRef(null);

  // 1. Initialize Show QR Code
  const initQr = async () => {
    try {
      setQrLoading(true);
      setQrStatus('PENDING');
      setTimeLeft(180);

      const data = await authService.createDeviceQr();
      if (data?.sessionId) {
        setSessionId(data.sessionId);
        setQrValue(data.qrUrl || `https://dynastore.site/scan-device?session=${data.sessionId}`);
      }
    } catch (err) {
      console.error('Failed to create Device QR:', err);
      toast.error('Failed to generate Device QR code.');
    } finally {
      setQrLoading(false);
    }
  };

  // 2. Camera Controls
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
      if (activeTab === 'SHOW_QR') {
        initQr();
        stopCamera();
      } else {
        startCamera();
      }
    } else {
      stopCamera();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
    return () => {
      stopCamera();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, activeTab]);

  // QR Countdown timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'SHOW_QR' || qrStatus !== 'PENDING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQrStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab, qrStatus]);

  // Polling for QR status
  useEffect(() => {
    if (!isOpen || activeTab !== 'SHOW_QR' || !sessionId || qrStatus !== 'PENDING') {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await authService.getDeviceQrStatus(sessionId);
        if (res.status === 'APPROVED' && res.token && res.user) {
          clearInterval(pollTimerRef.current);
          setQrStatus('APPROVED');

          localStorage.setItem('dynastore_token', res.token);
          localStorage.setItem('dynastore_user', JSON.stringify(res.user));

          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#10b981', '#ffffff'],
          });

          toast.success(`Device Linked! Welcome ${res.user.username || 'Gamer'}!`);

          setTimeout(() => {
            onClose();
          }, 1500);
        } else if (res.status === 'EXPIRED') {
          setQrStatus('EXPIRED');
          clearInterval(pollTimerRef.current);
        }
      } catch (err) {
        // Retry
      }
    }, 1500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, activeTab, sessionId, qrStatus]);

  // Handle Authorize from Camera/Manual tab
  const handleAuthorizeScan = async (codeToUse) => {
    const raw = (codeToUse || inputCode || '').trim();
    if (!raw) {
      toast.error('Please enter a valid session code.');
      return;
    }

    let cleanSession = raw;
    if (raw.includes('session=')) {
      cleanSession = raw.split('session=')[1]?.split('&')[0];
    } else if (raw.includes('login_')) {
      cleanSession = raw.split('login_')[1]?.split('&')[0];
    }

    try {
      setScanLoading(true);
      await authService.authorizeDeviceQr(cleanSession);

      setAuthorized(true);
      stopCamera();

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#10b981', '#ffffff'],
      });

      toast.success('Device linked and approved successfully!');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to authorize device');
    } finally {
      setScanLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!qrValue) return;
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    toast.success('Session link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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
        className="relative w-full max-w-sm rounded-3xl bg-[#0b0f19] border border-brand-cyan/30 p-6 sm:p-7 shadow-[0_0_50px_rgba(0,240,255,0.2)] text-center space-y-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab Toggle: Show QR vs Camera Scanner */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-white/10 mx-auto max-w-[280px]">
          <button
            type="button"
            onClick={() => setActiveTab('SHOW_QR')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'SHOW_QR'
                ? 'bg-brand-cyan text-slate-950 shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SCAN_CAMERA')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'SCAN_CAMERA'
                ? 'bg-brand-cyan text-slate-950 shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
        </div>

        {/* Tab 1: Show QR Code View */}
        {activeTab === 'SHOW_QR' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-black text-white font-display">
                Scan with Another Device
              </h3>
              <p className="text-xs text-slate-400">
                Scan this QR code with your phone or another device to link instantly
              </p>
            </div>

            {/* Official Rounded QR Code Frame */}
            <div className="relative mx-auto w-56 h-56 rounded-[28px] bg-white p-3.5 shadow-2xl flex items-center justify-center border-4 border-brand-cyan/40 overflow-hidden">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-900">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-cyan" />
                  <span className="text-[11px] font-bold text-slate-600">Generating QR...</span>
                </div>
              ) : qrStatus === 'APPROVED' ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2 text-emerald-600"
                >
                  <CheckCircle2 className="w-14 h-14 text-emerald-500 animate-bounce" />
                  <span className="text-xs font-black text-emerald-700">DEVICE LINKED!</span>
                </motion.div>
              ) : qrStatus === 'EXPIRED' ? (
                <div className="flex flex-col items-center gap-2 text-slate-800">
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
                  <QRCodeSVG
                    value={qrValue}
                    size={195}
                    level="H"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                    imageSettings={{
                      src: '/logo.png',
                      x: undefined,
                      y: undefined,
                      height: 38,
                      width: 38,
                      excavate: true,
                    }}
                  />
                  {/* Glowing Laser Radar Scanning Beam */}
                  <motion.div
                    animate={{ y: [-80, 80, -80] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-x-3 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-[0_0_15px_#00f0ff]"
                  />
                </>
              )}
            </div>

            {/* Countdown & Quick Copy */}
            {qrStatus === 'PENDING' && !qrLoading && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                  <span>Waiting for scan...</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-brand-cyan text-[11px] font-mono">
                    {formattedTime}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Copy Device Link'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Camera Scanner View */}
        {activeTab === 'SCAN_CAMERA' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h3 className="text-base font-black text-white font-display">
                Point Camera at QR Code
              </h3>
              <p className="text-xs text-slate-400">
                Scan the QR code shown on your computer or enter the session code
              </p>
            </div>

            {/* Camera Viewfinder */}
            <div className="relative mx-auto w-56 h-56 rounded-2xl bg-black/60 border-2 border-dashed border-brand-cyan/50 overflow-hidden flex items-center justify-center">
              {authorized ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2 text-emerald-400 p-4"
                >
                  <CheckCircle2 className="w-14 h-14 animate-bounce" />
                  <span className="text-xs font-bold text-emerald-300">DEVICE APPROVED!</span>
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
                  <motion.div
                    animate={{ y: [-90, 90, -90] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent shadow-[0_0_12px_#00f0ff]"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400 p-4">
                  <QrCode className="w-10 h-10 text-brand-cyan/60" />
                  <span className="text-[11px] text-slate-400">
                    {cameraError || 'Camera inactive. Paste or enter session code below.'}
                  </span>
                </div>
              )}
            </div>

            {/* Manual Code Input Form */}
            {!authorized && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthorizeScan();
                }}
                className="space-y-2.5"
              >
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Paste session code or QR link"
                  className="w-full bg-background-card text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/15 focus:outline-none focus:border-brand-cyan"
                />

                <button
                  type="submit"
                  disabled={scanLoading}
                  className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-neon-cyan"
                >
                  {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Authorize & Link Device</span>
                </button>
              </form>
            )}
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
