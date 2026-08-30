import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, Monitor, ShoppingCart, Trash2, Check } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function GameCard({ product }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const inCart = isInCart(product.id);
  const originalPrice = Number(product.price);
  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined && Number(product.discount_price) < originalPrice;
  const finalPrice = hasDiscount ? Number(product.discount_price) : originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  const handleToggleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col rounded-2xl glass-card overflow-hidden border border-white/10 hover:border-brand-cyan/40 hover:shadow-neon-cyan transition-all"
    >
      {/* Cover Image Container */}
      <Link to={`/games/${product.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-900 block">
        <img
          src={product.cover_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600/90 text-white font-black text-xs tracking-wider shadow-lg backdrop-blur-md">
            -{discountPercent}% OFF
          </div>
        )}

        {/* Platform & Version Tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[11px] text-slate-300 border border-white/10">
          <Monitor className="w-3 h-3 text-cyan-400" />
          <span>{product.platform || 'PC'}</span>
        </div>

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <span className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-brand-cyan hover:text-black transition-colors">
            <Eye className="w-5 h-5" />
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Version */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="text-brand-cyan font-medium tracking-wide uppercase text-[11px]">
              {product.category?.name || 'Action / Adventure'}
            </span>
            <span className="font-mono text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
              {product.version || 'v1.0'}
            </span>
          </div>

          {/* Game Title */}
          <Link to={`/games/${product.slug}`} className="block">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.short_description || product.description}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-slate-400 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-black text-white font-display">
              ${finalPrice.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Cart Toggle (Add / Remove) */}
            <button
              type="button"
              onClick={handleToggleCart}
              className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center justify-center ${
                inCart
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-white/5 border-white/15 text-slate-300 hover:text-white hover:border-brand-cyan/50 hover:bg-white/10'
              }`}
              title={inCart ? 'Remove from Cart' : 'Add to Cart'}
            >
              {inCart ? <Trash2 className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>

            {/* Buy Now */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="px-3.5 py-2 rounded-xl text-xs font-bold gradient-btn flex items-center justify-center gap-1 shadow-neon-cyan hover:scale-[1.02] transition-transform"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
