import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingCart, ShieldCheck, Gamepad2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="py-20 text-center glass-card rounded-3xl border border-white/10 max-w-xl mx-auto space-y-5 p-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center mx-auto text-slate-500">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-display">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Explore our collection of standalone games, Minecraft modpacks, and PC releases.
        </p>
        <Link
          to="/games"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-btn text-sm font-semibold"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Browse Games</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Shopping Cart</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your digital game files before proceeding to secure checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
                  alt={item.product?.title}
                  className="w-20 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                />
                <div>
                  <Link
                    to={`/games/${item.product?.slug}`}
                    className="text-base font-bold text-white hover:text-brand-cyan transition-colors line-clamp-1"
                  >
                    {item.product?.title || 'Game File'}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="text-brand-cyan">{item.product?.platform || 'PC'}</span>
                    <span>•</span>
                    <span>{item.product?.version || 'v1.0'}</span>
                    <span>•</span>
                    <span>Digital License (Qty: 1)</span>
                  </div>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                <span className="text-lg font-black text-white font-display">
                  ${Number(item.price).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId || item.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all flex items-center gap-1.5 shadow-sm group"
                  title="Delete game from cart"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* Digital Notice */}
          <div className="p-4 rounded-2xl bg-brand-surface/60 border border-brand-cyan/20 text-xs text-slate-300 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-cyan shrink-0" />
            <span>
              All purchases include verified digital game downloads, installation guides, and future version updates.
            </span>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl glass-card border border-white/10 p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-display">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items ({items.length})</span>
                <span className="text-white font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Digital Delivery</span>
                <span className="text-emerald-400 font-medium">Instant ($0.00)</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-2xl font-black text-brand-cyan font-display">
                  ${cart.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center justify-center gap-2 shadow-neon-cyan"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-[11px] text-slate-500">
                Verified payment via ABA PayWay & DynaStore Wallet
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
