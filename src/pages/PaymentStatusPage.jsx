import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, Download, Package, ArrowRight, Wallet } from 'lucide-react';
import confetti from 'canvas-confetti';
import API from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id') || searchParams.get('tranId');
  const statusParam = searchParams.get('status');
  const orderId = searchParams.get('order_id');

  const { refreshUser } = useAuth();
  const [status, setStatus] = useState(statusParam === 'paid' ? 'PAID' : 'CHECKING');
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    refreshUser();

    if (statusParam === 'paid') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    if (!tranId) {
      if (statusParam === 'paid') setStatus('PAID');
      else setStatus('UNKNOWN');
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await API.get(`/payments/status/${tranId}`);
        if (res.data.success) {
          setPaymentInfo(res.data.payment);
          if (res.data.payment?.status === 'PAID') {
            setStatus('PAID');
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } else if (res.data.payment?.status === 'FAILED' || res.data.payment?.status === 'CANCELLED') {
            setStatus('FAILED');
          } else {
            setStatus('PENDING');
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
        setStatus('UNKNOWN');
      }
    };

    checkStatus();
  }, [tranId, statusParam, refreshUser]);

  return (
    <div className="py-12 max-w-xl mx-auto text-center space-y-8">
      {status === 'PAID' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl glass-card border border-emerald-500/30 p-8 sm:p-10 space-y-6 shadow-neon-cyan"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              Payment Completed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Your transaction has been verified with ABA PayWay. Your digital game files and receipt are available immediately.
            </p>
          </div>

          {tranId && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs flex items-center justify-between font-mono">
              <span className="text-slate-400">Transaction Ref:</span>
              <span className="text-cyan-400 font-bold">{tranId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/downloads"
              className="w-full py-3.5 rounded-xl gradient-btn text-xs font-bold flex items-center justify-center gap-2 shadow-neon-cyan"
            >
              <Download className="w-4 h-4" />
              <span>Go to My Downloads</span>
            </Link>
            <Link
              to="/orders"
              className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>View Orders</span>
            </Link>
          </div>
        </motion.div>
      )}

      {status === 'FAILED' && (
        <div className="rounded-3xl glass-card border border-rose-500/30 p-8 sm:p-10 space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white font-display">Payment Failed or Cancelled</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              The payment could not be completed or was cancelled in the ABA app. No funds were charged.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/checkout" className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold">
              Try Checkout Again
            </Link>
          </div>
        </div>
      )}

      {status === 'PENDING' && (
        <div className="rounded-3xl glass-card border border-amber-500/30 p-8 sm:p-10 space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-12 h-12 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white font-display">Payment Pending Verification</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              We are waiting for final confirmation from the ABA PayWay network. Your balance or game download will unlock automatically once confirmed.
            </p>
          </div>
          <Link to="/orders" className="inline-block px-6 py-3 rounded-xl gradient-btn text-xs font-bold">
            Check Orders
          </Link>
        </div>
      )}
    </div>
  );
}
