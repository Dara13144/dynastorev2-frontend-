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
  Tag,
  X,
  Sparkles,
} from 'lucide-react';
import API from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ABAPayModal from '../components/ABAPayModal.jsx';
import CutLuyPayModal from '../components/CutLuyPayModal.jsx';
import SpinWheelModal from '../components/SpinWheelModal.jsx';

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
  const [spinOrderId, setSpinOrderId] = useState(null);

  // Promo / Discount Code States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const items = cart.items || [];
  // Compute subtotal directly from items for accuracy (cart.total may lag on first load)
  const subtotal = items.length > 0
    ? Number(items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0).toFixed(2))
    : Number(cart.total || 0);
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const totalAmount = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const userBalance = Number(user?.balance || 0);
  const hasSufficientWalletBalance = userBalance >= totalAmount;

  const handleApplyCoupon = async (codeToApply) => {
    const targetCode = (typeof codeToApply === 'string' ? codeToApply : couponInput).trim();
    if (!targetCode) {
      setCouponError('Please enter a discount code');
      return;
    }
    setCouponError(null);
    setCouponLoading(true);
    try {
      const res = await API.post('/orders/validate-coupon', {
        code: targetCode,
        cartTotal: subtotal,
      });
      if (res.data.success && res.data.valid) {
        setAppliedCoupon(res.data.coupon);
        setCouponInput(res.data.coupon.code);
        toast.success(res.data.message || `Code ${res.data.coupon.code} applied!`);
      }
    } catch (err) {
      const msg = err.formattedMessage || err.response?.data?.message || 'Invalid or expired coupon code';
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    toast.info('Discount code removed');
  };

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
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to complete your checkout');
      navigate('/login?redirect=/checkout');
      return;
    }

    try {
      setLoading(true);
      const productIds = items.map((i) => i.productId);

      const res = await API.post('/orders', {
        productIds,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });

      if (res.data.success) {
        const newOrderId = res.data.orderId;
        // Store orderId so spin wheel can retrieve it after any payment path
        if (newOrderId) sessionStorage.setItem('spin_order_id', newOrderId);

        if (paymentMethod === 'WALLET_BALANCE') {
          // Instant completion via wallet balance — show spin immediately
          await refreshUser();
          clearCart();
          toast.success('Order completed! 🎉 Spin the wheel for a prize!');
          setSpinOrderId(newOrderId);
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
    toast.success('Payment verified! 🎉 Spin the wheel for a prize!');
    // Get orderId from paymentData (always present from /orders response)
    const confirmedOrderId = paymentData?.orderId || null;
    if (confirmedOrderId) {
      // Show spin wheel right here before navigating
      setSpinOrderId(confirmedOrderId);
    } else {
      // Fallback: navigate to payment status page
      const tran = payment?.transaction_id || paymentData?.transactionId;
      navigate(`/payment/status?status=paid&tran_id=${tran}`);
    }
  };

  const handleSpinClose = () => {
    setSpinOrderId(null);
    navigate('/payment/status?status=paid');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Spin Wheel Modal (appears after purchase) */}
      {spinOrderId && (
        <SpinWheelModal orderId={spinOrderId} onClose={handleSpinClose} />
      )}
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
        {/* Payment Methods Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Unauthenticated Alert Prompt */}
          {!isAuthenticated && (
            <div className="rounded-3xl glass-card border border-brand-cyan/30 p-5 bg-gradient-to-r from-brand-cyan/10 via-brand-purple/10 to-transparent shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center shrink-0 shadow-neon-cyan">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-display">Sign In Required to Checkout</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sign in to associate your purchase, access downloads, and spin for cash prizes!
                  </p>
                </div>
              </div>
              <Link
                to="/login?redirect=/checkout"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white shrink-0 shadow-md"
              >
                Sign In / Register →
              </Link>
            </div>
          )}

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

            {/* Promo / Discount Code Card */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-brand-cyan" /> Promo / Discount Code
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponError) setCouponError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="e.g. 0.05, 0.10, 0.15, 5$"
                        className="w-full bg-background-card text-white text-xs font-mono font-bold uppercase rounded-xl pl-9 pr-3 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan placeholder:normal-case placeholder:font-sans placeholder:text-slate-500"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <button
                      type="button"
                      disabled={couponLoading || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 shrink-0"
                    >
                      {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>


                  {couponError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-300 text-xs">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {appliedCoupon.discountType === 'PERCENTAGE'
                            ? `${appliedCoupon.discountValue}% OFF`
                            : `$${Number(appliedCoupon.discountValue).toFixed(2)} OFF`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate">
                        {appliedCoupon.description || 'Special promotional discount'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-400 shrink-0">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Discount ({appliedCoupon.code})
                  </span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
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
              disabled={loading || (isAuthenticated && paymentMethod === 'WALLET_BALANCE' && !hasSufficientWalletBalance)}
              className="w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-rose-600/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : !isAuthenticated ? (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Sign In to Complete Purchase →</span>
                </>
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
