import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Download,
  ShieldCheck,
  Calendar,
  Layers,
  HardDrive,
  CheckCircle,
  ArrowLeft,
  Monitor,
  Loader2,
  Sparkles,
} from 'lucide-react';
import API from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CutLuyPayModal from '../components/CutLuyPayModal.jsx';

export default function GameDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isOwned, setIsOwned] = useState(false);
  const [cutluyModalOpen, setCutluyModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    fetchGame();
  }, [slug]);

  useEffect(() => {
    if (product && isAuthenticated) {
      checkOwnership();
    }
  }, [product, isAuthenticated]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${slug}`);
      if (res.data.success) {
        setProduct(res.data.product);
      }
    } catch (err) {
      toast.error('Game not found');
      navigate('/games');
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      const res = await API.get('/downloads');
      if (res.data.success) {
        const owned = res.data.downloads.some(
          (d) => d.product_id === product.id || d.productId === product.id || d.product?.id === product.id
        );
        setIsOwned(owned);
      }
    } catch (err) {
      console.warn('Ownership check error:', err);
    }
  };

  const handleBuyNowDirect = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in or register to purchase games');
      navigate('/login');
      return;
    }

    try {
      const res = await API.post('/orders', {
        productIds: [product.id],
        paymentMethod: 'CUTLUY',
      });

      if (res.data.success) {
        setPaymentData(res.data);
        setCutluyModalOpen(true);
      }
    } catch (err) {
      toast.error(err.formattedMessage || 'Failed to initiate purchase');
    }
  };

  const handlePaymentSuccess = () => {
    setCutluyModalOpen(false);
    toast.success('Payment verified! Game unlocked in your downloads.');
    setIsOwned(true);
    navigate('/downloads');
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading game details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Game Not Found</h2>
        <p className="text-sm text-slate-400">The game file you are looking for does not exist or has been removed.</p>
        <Link to="/games" className="inline-block px-6 py-2.5 rounded-xl gradient-btn text-sm font-semibold">
          Browse All Games
        </Link>
      </div>
    );
  }

  const reqs = product.system_requirements || {
    os: 'Windows 10/11 64-bit',
    processor: 'Intel Core i5 / AMD Ryzen 5',
    memory: '8 GB RAM',
    graphics: 'NVIDIA GTX 1060 / AMD RX 580',
    storage: '20 GB available space',
  };

  const allMedia = [product.cover_image, ...(product.screenshots || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Breadcrumbs & Title */}
      <div className="space-y-2">
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Games</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {product.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-300">
              {product.platform || 'PC'}
            </span>
            {product.category?.name && (
              <span className="px-3 py-1 rounded-full bg-brand-cyan/20 border border-cyan-500/30 text-xs font-semibold text-brand-cyan">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Gallery on Left (7 cols), Pricing & Purchase on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Showcase Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl bg-slate-900 group">
            <img
              src={allMedia[activeMediaIndex] || product.cover_image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.discount_price && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                SALE -{Math.round((1 - product.discount_price / product.price) * 100)}%
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {allMedia.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {allMedia.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeMediaIndex === idx
                      ? 'border-brand-cyan shadow-neon-cyan scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-cyan" /> About the Game
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* System Requirements Tab */}
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-4">
            <h2 className="text-base font-bold text-white font-display uppercase tracking-wider">
              System Requirements (PC)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold block uppercase">Operating System</span>
                <span className="text-white font-medium">{reqs.os || 'Windows 10 64-bit'}</span>
              </div>
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold block uppercase">Processor (CPU)</span>
                <span className="text-white font-medium">{reqs.processor || 'Intel i5 / Ryzen 5'}</span>
              </div>
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold block uppercase">Memory (RAM)</span>
                <span className="text-white font-medium">{reqs.memory || '8 GB RAM'}</span>
              </div>
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 font-semibold block uppercase">Graphics Card (GPU)</span>
                <span className="text-white font-medium">{reqs.graphics || 'NVIDIA GTX 1060 / AMD RX 580'}</span>
              </div>
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5 sm:col-span-2">
                <span className="text-slate-400 font-semibold block uppercase">Storage</span>
                <span className="text-white font-medium">{reqs.storage || '15 GB available space'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Buy Button & Direct Signed Download */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl glass-card border border-white/10 p-6 space-y-6 shadow-2xl sticky top-24">
            {/* Price Header */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Official Digital License
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black text-white font-display">
                    ${Number(product.discount_price || product.price).toFixed(2)}
                  </span>
                  {product.discount_price && (
                    <span className="text-base text-slate-400 line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Approx. KHR
                </span>
                <span className="text-sm font-bold text-cyan-300">
                  ៛{(Number(product.discount_price || product.price) * 4100).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buy / Download Buttons */}
            {isOwned ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    You own this game!
                  </span>
                  <span className="text-[10px] text-slate-400">Digital Copy Active</span>
                </div>

                <Link
                  to="/downloads"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Go to Downloads
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleBuyNowDirect}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-rose-600/30"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  Buy Now with CutLuy KHQR
                </button>
              </div>
            )}

            {/* Product Specifications List */}
            <div className="border-t border-white/10 pt-6 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" /> File Size
                </span>
                <span className="font-semibold text-white">{product.file_size || '4.8 GB'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> Version
                </span>
                <span className="font-semibold text-white">{product.version || 'v1.0'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" /> Platform
                </span>
                <span className="font-semibold text-white">{product.platform || 'PC / Windows'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" /> Release Date
                </span>
                <span className="font-semibold text-white">{product.release_date || '2025'}</span>
              </div>
              {product.developer && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Developer</span>
                  <span className="font-semibold text-white">{product.developer}</span>
                </div>
              )}
            </div>

            {/* Guarantee badge */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                <span>Verified Direct Download Delivery</span>
              </div>
              <p>
                Files are stored securely in encrypted private buckets. Generates tamper-proof short-lived signed URLs upon verified payment.
              </p>
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
