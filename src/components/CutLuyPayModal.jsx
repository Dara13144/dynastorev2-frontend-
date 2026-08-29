import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Loader2,
  Smartphone,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import API from '../utils/api.js';

export default function CutLuyPayModal({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
}) {
  const [status, setStatus] = useState('pending'); // pending, paid, expired, failed
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute countdown
  const [checking, setChecking] = useState(false);

  const tranId = paymentData?.transactionId || paymentData?.reference_id || paymentData?.tranId;
  const cutluyId = paymentData?.cutluyId || paymentData?.id;
  const amount = Number(paymentData?.amount || 0);
  const currency = paymentData?.currency || 'USD';
  const qrString = paymentData?.qrString || paymentData?.qr_string;
  const checkoutUrl = paymentData?.checkoutUrl || paymentData?.checkout_url;
  const merchantName = paymentData?.merchantName || 'DYNASTORE CAMBODIA';

  // CutLuy KHQR SVG render URL if available
  const qrSvgUrl =
    paymentData?.qrSvgUrl ||
    (qrString ? `https://cutluy.com/api/render/khqr/${encodeURIComponent(qrString)}.svg` : null);

  const amountKhr = Math.round(amount * 4100).toLocaleString();

  // Polling CutLuy status every 3.5 seconds
  useEffect(() => {
    if (!isOpen || (!tranId && !cutluyId) || status === 'paid' || status === 'expired') return;

    const pollId = tranId || cutluyId;

    const interval = setInterval(async () => {
      try {
        setChecking(true);
        const res = await API.get(`/payments/cutluy/status/${pollId}`);
        const currentStatus = (res.data?.status || res.data?.payment?.status || '').toLowerCase();

        if (currentStatus === 'paid' || currentStatus === 'completed') {
          setStatus('paid');
          clearInterval(interval);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
          if (onSuccess) {
            setTimeout(() => onSuccess(res.data.payment || res.data), 1200);
          }
        } else if (currentStatus === 'expired' || currentStatus === 'failed') {
          setStatus(currentStatus);
        }
      } catch (err) {
        console.warn('CutLuy polling status error:', err.message);
      } finally {
        setChecking(false);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, tranId, cutluyId, status, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0 || status === 'paid') return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, status]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-[390px] rounded-3xl bg-[#0f1422] border border-white/15 p-4 sm:p-5 shadow-2xl space-y-4 text-white overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Title Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Bakong KHQR Gateway</span>
          </div>

          {/* State 1: Paid Success */}
          {status === 'paid' ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white font-display">Payment Successful!</h3>
                <p className="text-xs text-slate-300">
                  ${amount.toFixed(2)} USD received via Bakong KHQR.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
                Auto-fulfilling order and updating account balance...
              </div>
            </div>
          ) : status === 'expired' ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Clock className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">QR Code Expired</h3>
                <p className="text-xs text-slate-400">Please generate a new invoice to complete payment.</p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Full Official Bakong KHQR Bill Card */}
              <div className="rounded-[22px] bg-white overflow-hidden shadow-2xl text-slate-900 border border-slate-200">
                {/* 1. Header: Red National Bank of Cambodia KHQR Bar */}
                <div className="bg-[#E1251B] px-4 py-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-wider font-display leading-none">KHQR</span>
                    <span className="text-[10px] bg-[#BF1A11] border border-white/20 px-2 py-0.5 rounded-md font-sans font-bold tracking-wide">
                      BAKONG
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase opacity-95">
                    NATIONAL BANK
                  </span>
                </div>

                {/* 2. Merchant & Amount Section */}
                <div className="px-5 pt-4 pb-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>DynaStore Cambodia</span>
                    <span className="text-[11px] font-medium text-slate-500">{currency} Account</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div className="text-[26px] font-extrabold text-slate-950 font-display tracking-tight leading-tight">
                      ${amount.toFixed(2)}{' '}
                      <span className="text-xs font-bold text-slate-500 font-sans">{currency}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      ≈ ៛{amountKhr}
                    </span>
                  </div>
                </div>

                {/* Dashed divider */}
                <div className="border-b border-dashed border-slate-300 mx-5 my-2" />

                {/* 3. Centered Inner Stand / QR Code Card */}
                <div className="px-5 py-3 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[260px] rounded-2xl bg-white border border-slate-200 shadow-md p-3 flex flex-col items-center relative overflow-hidden">
                    {/* Stand Mini Red Header with KHQR & Cut Ribbon */}
                    <div className="w-full bg-[#E1251B] text-white py-1.5 px-3 rounded-t-xl flex items-center justify-between -mt-3 -mx-3 mb-2 relative">
                      <span className="font-black text-xs tracking-wider font-display">KHQR</span>
                      <div className="w-2.5 h-2.5 bg-white/30 rounded-full" />
                    </div>

                    {/* Merchant & Mini Amount Info */}
                    <div className="w-full text-center pb-1 space-y-0.5">
                      <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        {merchantName}
                      </div>
                      <div className="text-xs font-black text-slate-900 font-display">
                        {amount.toFixed(2)} {currency}
                      </div>
                    </div>

                    {/* Dashed line inside stand */}
                    <div className="w-full border-b border-dashed border-slate-200 my-1.5" />

                    {/* High-Resolution QR Code */}
                    <div className="relative p-1 bg-white rounded-lg flex items-center justify-center">
                      {qrString ? (
                        <div className="relative">
                          <QRCodeSVG
                            value={qrString}
                            size={180}
                            level="M"
                            includeMargin={false}
                          />
                          {/* Center Currency Medallion */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
                              $
                            </div>
                          </div>
                        </div>
                      ) : qrSvgUrl ? (
                        <img
                          src={qrSvgUrl}
                          alt="CutLuy KHQR Code"
                          className="w-[180px] h-[180px] object-contain rounded-md"
                        />
                      ) : (
                        <div className="w-[180px] h-[180px] bg-slate-100 flex items-center justify-center rounded-md">
                          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Footer Prompt: Scan with any KHQR App */}
                <div className="bg-[#EEF2F6] py-3 px-4 text-center border-t border-slate-200">
                  <p className="text-[11px] text-slate-700 font-semibold flex items-center justify-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Scan with ABA, Bakong, Wing, ACLEDA, or any KHQR app</span>
                  </p>
                </div>
              </div>

              {/* Status / Live Auto-Check Polling Indicator */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${checking ? 'animate-spin' : ''}`} />
                  <span className="text-slate-300">Auto-detecting payment...</span>
                </div>
                <div className="font-mono text-amber-400 font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                  {minutes}:{seconds}
                </div>
              </div>

              {/* Mobile App Deeplink / Direct App Open Button */}
              {checkoutUrl && (
                <div className="pt-1">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all shadow-md"
                  >
                    <span>Open in Banking Web / App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
