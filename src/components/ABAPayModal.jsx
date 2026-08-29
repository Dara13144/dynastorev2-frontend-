import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import API from '../utils/api.js';

export default function ABAPayModal({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
}) {
  const [copied, setCopied] = useState(false);
  const [pollingStatus, setPollingStatus] = useState('PENDING'); // PENDING, PAID, FAILED
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute countdown

  const tranId = paymentData?.transactionId || paymentData?.tranId || paymentData?.abaPayment?.tran_id;
  const amount = Number(paymentData?.amount || paymentData?.totalAmount || 0);
  const amountKhr = Math.round(amount * 4100).toLocaleString();

  // Polling transaction status every 3 seconds
  useEffect(() => {
    if (!isOpen || !tranId || pollingStatus === 'PAID') return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/payments/status/${tranId}`);
        if (res.data.success && res.data.payment?.status === 'PAID') {
          setPollingStatus('PAID');
          clearInterval(interval);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          if (onSuccess) onSuccess(res.data.payment);
        }
      } catch (err) {
        console.warn('Status poll error:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, tranId, pollingStatus, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || pollingStatus === 'PAID') return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, pollingStatus]);

  const copyTranId = () => {
    navigator.clipboard.writeText(tranId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Instant sandbox confirmation trigger (simulates webhook callback for immediate test)
  const handleSimulateSandboxPayment = async () => {
    try {
      setSimulatingPayment(true);
      await API.post('/payments/aba/callback', {
        tran_id: tranId,
        status: '00',
        amount: amount.toFixed(2),
        req_time: new Date().toISOString().replace(/\D/g, '').slice(0, 14),
      });

      setPollingStatus('PAID');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        if (onSuccess) onSuccess({ transaction_id: tranId, status: 'PAID' });
      }, 1500);
    } catch (err) {
      console.error('Sandbox confirmation error:', err);
    } finally {
      setSimulatingPayment(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden"
        >
          {/* Header with ABA PayWay branding */}
          <div className="bg-gradient-to-r from-aba-dark via-aba-blue to-cyan-900 p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-300" />
              ABA PayWay Official Checkout
            </div>
            <h3 className="text-xl font-bold font-display">Scan with ABA Mobile</h3>
            <p className="text-xs text-cyan-200 mt-1">
              Supports ABA KHQR, Bakong & ABA Pay Mobile App
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {pollingStatus === 'PAID' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-neon-cyan">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Verified!</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Your payment has been successfully recorded. Your digital game files and receipt are ready.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Amount Display */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                    <span className="text-2xl font-black text-white font-display">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Approx. Riel</span>
                    <span className="text-sm font-bold text-cyan-400">
                      ៛{amountKhr} KHR
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white text-black shadow-inner relative group">
                  {/* Decorative QR Pattern */}
                  <div className="w-48 h-48 border-4 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative bg-white">
                    {/* Simulated/Official KHQR Matrix */}
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-1">
                      {Array.from({ length: 36 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`rounded-sm ${
                            [0, 1, 4, 5, 6, 11, 24, 29, 30, 31, 34, 35, 14, 15, 20, 21].includes(idx)
                              ? 'bg-slate-900'
                              : idx % 3 === 0
                              ? 'bg-slate-800'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Center ABA Logo Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-2 py-1 bg-aba-blue text-white rounded-md text-[10px] font-black tracking-wider shadow-md border border-white">
                        ABA
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase block">
                      KHQR Universal Payment
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Open ABA Mobile app & Scan QR
                    </span>
                  </div>
                </div>

                {/* Transaction details & Copy */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 text-xs text-slate-400 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      Expires in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  </div>
                  <button
                    onClick={copyTranId}
                    className="flex items-center gap-1 text-slate-300 hover:text-brand-cyan transition-colors"
                  >
                    <span className="font-mono text-[11px] max-w-[120px] truncate">{tranId}</span>
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Polling indicator & Sandbox helper button */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-cyan" />
                    <span>Waiting for your payment confirmation...</span>
                  </div>

                  <button
                    onClick={handleSimulateSandboxPayment}
                    disabled={simulatingPayment}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {simulatingPayment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>[Sandbox] Simulate Instant ABA App Payment</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
