import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
} from 'lucide-react';
import API from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ABAPayModal from '../components/ABAPayModal.jsx';
import CutLuyPayModal from '../components/CutLuyPayModal.jsx';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated, refreshUser, loginWithGoogle, loginWithGoogleEmail } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('CUTLUY'); // CUTLUY, ABA_PAYWAY, WALLET_BALANCE
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [abaModalOpen, setAbaModalOpen] = useState(false);
  const [cutluyModalOpen, setCutluyModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const items = cart.items || [];
  const totalAmount = cart.total || 0;
  const userBalance = Number(user?.balance || 0);
  const hasSufficientWalletBalance = userBalance >= totalAmount;

  const handleGoogleCheckoutLogin = async () => {
    try {
      setGoogleLoading(true);
      const res = await loginWithGoogle();
      if (res?.success) {
        toast.success(`Welcome to DynaStore, ${res.user?.username || 'Gamer'}! Ready to complete your order.`);
      }
    } catch (err) {
      console.warn('Google checkout login notice:', err);
      navigate('/login?redirect=/checkout');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center glass-card rounded-3xl border border-white/10 max-w-md mx-auto p-8 space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center mx-auto text-brand-cyan shadow-neon-cyan">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Login Required</h2>
          <p className="text-xs text-slate-400 mt-1">
            Please log in or register to complete your digital game purchase.
          </p>
        </div>

        {/* 1-Click Google Sign-In */}
        <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogleCheckoutLogin}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{googleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-background-card px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider absolute">
            Or with account
          </span>
        </div>

        <div className="flex items-center gap-3 justify-center">
          <Link to="/login?redirect=/checkout" className="flex-1 py-2.5 rounded-xl gradient-btn text-xs font-bold text-center">
            Log In
          </Link>
          <Link to="/register?redirect=/checkout" className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 text-center">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center glass-card rounded-3xl border border-white/10 max-w-md mx-auto p-8 space-y-4">
        <h2 className="text-xl font-bold text-white">No items in checkout</h2>
        <Link to="/games" className="inline-block px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold">
          Explore Games
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const productIds = items.map((i) => i.productId);

      const res = await API.post('/orders', {
        productIds,
        paymentMethod,
      });

      if (res.data.success) {
        if (paymentMethod === 'WALLET_BALANCE') {
          // Instant completion via wallet balance
          await refreshUser();
          clearCart();
          toast.success('Order completed with wallet balance!');
          navigate(`/payment/status?status=paid&order_id=${res.data.orderId}`);
        } else if (paymentMethod === 'CUTLUY') {
          // CutLuy KHQR Gateway
          setPaymentData(res.data);
          setCutluyModalOpen(true);
        } else {
          // ABA PayWay Gateway
          setPaymentData(res.data);
          setAbaModalOpen(true);
        }
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (payment) => {
    setAbaModalOpen(false);
    setCutluyModalOpen(false);
    await refreshUser();
    clearCart();
    toast.success('Payment verified! Your game download is available.');
    navigate(`/payment/status?status=paid&tran_id=${payment?.transaction_id || paymentData?.transactionId}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/games" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store Catalog</span>
        </Link>
        <h1 className="text-3xl font-black text-white font-display">Checkout & Payment</h1>
        <p className="text-sm text-slate-400 mt-1">Select your preferred payment method to complete purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-5 shadow-xl">
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
              1. Select Payment Method
            </h3>

            {/* KHQR Bakong Option (Recommended) */}
            <label
              onClick={() => setPaymentMethod('CUTLUY')}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'CUTLUY'
                  ? 'bg-rose-500/15 border-rose-500 shadow-lg ring-1 ring-rose-500/50'
                  : 'bg-black/20 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 text-white shrink-0 mt-0.5 shadow-md">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white font-display">KHQR</span>
                    <span className="bg-[#E1251B] text-white text-[9px] font-black px-1.5 py-0.2 rounded tracking-wider">BAKONG</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    All Banks • Instant
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Scan & pay with Bakong, ABA, Wing, ACLEDA, Canadia, TrueMoney, or any banking app.
                </p>
              </div>
            </label>

            {/* Wallet Balance Option */}
            <label
              onClick={() => setPaymentMethod('WALLET_BALANCE')}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'WALLET_BALANCE'
                  ? 'bg-brand-purple/20 border-brand-purple shadow-neon-purple'
                  : 'bg-black/20 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-brand-purple text-white shrink-0 mt-0.5 shadow-md">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white font-display">DynaStore Wallet</span>
                  <span className="text-xs font-bold text-brand-cyan">
                    Balance: ${userBalance.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Instant 1-click deduction from your pre-funded digital wallet.
                </p>

                {!hasSufficientWalletBalance && paymentMethod === 'WALLET_BALANCE' && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      Insufficient balance
                    </span>
                    <Link to="/wallet" className="font-bold underline text-cyan-400 hover:text-cyan-300">
                      Top up now →
                    </Link>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Customer Account Info */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Account Information
            </h3>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account</span>
              <span className="font-semibold text-white">
                {user?.username && user?.username !== user?.email && !user?.username.startsWith('dynastore2-')
                  ? `${user.username} (${user.email})`
                  : (user?.email || 'Guest')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Digital Delivery</span>
              <span className="text-emerald-400 font-semibold">Immediate Signed Download URL</span>
            </div>
          </div>
        </div>

        {/* Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-display uppercase tracking-wider">
              Order Review
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product?.cover_image}
                      alt={item.product?.title}
                      className="w-10 h-8 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <span className="font-medium text-white truncate">{item.product?.title}</span>
                  </div>
                  <span className="font-bold text-white shrink-0">${Number(item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Processing Fee</span>
                <span className="text-emerald-400 font-medium">$0.00 (Free)</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline text-base font-bold">
                <span className="text-white">Total Due</span>
                <span className="text-2xl font-black text-brand-cyan font-display">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || (paymentMethod === 'WALLET_BALANCE' && !hasSufficientWalletBalance)}
              className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-rose-600/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    {paymentMethod === 'WALLET_BALANCE'
                      ? 'Pay with Wallet Balance'
                      : 'Pay with KHQR (Bakong / All Banks)'}
                  </span>
                </>
              )}
            </button>

            <div className="p-3 rounded-xl bg-white/5 text-[11px] text-slate-400 text-center">
              🔒 Encrypted 256-bit checkout. No payment details are ever stored on DynaStore servers.
            </div>
          </div>
        </div>
      </div>

      {/* CutLuy KHQR Modal */}
      {paymentData && (
        <CutLuyPayModal
          isOpen={cutluyModalOpen}
          onClose={() => setCutluyModalOpen(false)}
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
