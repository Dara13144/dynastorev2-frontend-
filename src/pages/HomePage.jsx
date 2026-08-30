import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Tag,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Gamepad2,
} from 'lucide-react';
import API from '../utils/api.js';
import GameCard from '../components/GameCard.jsx';
import { GameCardSkeleton } from '../components/SkeletonLoader.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HomePage() {
  const { t, isKhmer } = useLanguage();
  const [featuredData, setFeaturedData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          API.get('/products/featured'),
          API.get('/categories'),
        ]);

        if (featRes.data.success) {
          setFeaturedData(featRes.data);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 p-8 sm:p-14 text-center space-y-6 shadow-2xl bg-gradient-to-b from-brand-surface/90 via-background-card/95 to-background">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4" />
          <span>{t('home.heroBadge')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white font-display max-w-3xl mx-auto leading-tight">
          {t('home.heroTitlePrefix')}{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
            {t('home.heroTitleHighlight')}
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {t('home.heroSubtitle')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/games"
            className="px-6 py-3.5 rounded-2xl gradient-btn text-sm font-bold flex items-center gap-2 shadow-neon-cyan"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{t('home.browseCatalog')}</span>
          </Link>
          <Link
            to="/wallet"
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Zap className="w-4 h-4 text-brand-cyan fill-current" />
            <span>{t('home.topUpWallet')}</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-4xl mx-auto text-left">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-xl bg-brand-cyan/10 text-brand-cyan shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.instantDelivery')}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('home.instantDeliveryDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.verifiedFiles')}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('home.verifiedFilesDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t('home.khqrPayment')}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('home.khqrPaymentDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Horizontal Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              {isKhmer ? 'ស្វែងរកតាមប្រភេទ' : 'Browse by Genre'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isKhmer ? 'រើសហ្គេម និងកម្មវិធីតាមជំពូកដែលអ្នកចូលចិត្ត' : 'Explore game files curated by game category'}
            </p>
          </div>
          <Link to="/categories" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/games?category=${cat.slug}`}
              className="p-4 rounded-2xl glass-card border border-white/5 hover:border-brand-cyan/40 hover:bg-brand-hover transition-all text-center group"
            >
              <h4 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
                {cat.name}
              </h4>
              <span className="text-[10px] text-slate-400 mt-1 block">{isKhmer ? 'មើលហ្គេមទាំងអស់ →' : 'Explore Collection →'}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Popular Games */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                {t('home.featuredGames')}
              </h2>
              <p className="text-xs text-slate-400">{t('home.featuredSubtitle')}</p>
            </div>
          </div>
          <Link to="/games" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => <GameCardSkeleton key={idx} />)
            : featuredData?.popular?.map((p) => <GameCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* 4. Special Offers & Discounts */}
      {featuredData?.specialOffers?.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                  {isKhmer ? 'ការបញ្ចុះតម្លៃពិសេស' : 'Special Offers'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isKhmer ? 'ហ្គេមល្បីៗដែលមានការបញ្ចុះតម្លៃពិសេសក្នុងពេលកំណត់' : 'Limited time discounts on top releases'}
                </p>
              </div>
            </div>
            <Link to="/games" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
              <span>{t('home.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredData.specialOffers.map((p) => (
              <GameCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 5. New Releases */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
                {t('home.newReleases')}
              </h2>
              <p className="text-xs text-slate-400">{t('home.newReleasesSubtitle')}</p>
            </div>
          </div>
          <Link to="/games" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => <GameCardSkeleton key={idx} />)
            : featuredData?.newReleases?.map((p) => <GameCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
