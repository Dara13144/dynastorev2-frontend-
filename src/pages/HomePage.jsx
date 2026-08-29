import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Tag,
  ArrowRight,
} from 'lucide-react';
import API from '../utils/api.js';
import GameCard from '../components/GameCard.jsx';
import { GameCardSkeleton } from '../components/SkeletonLoader.jsx';

export default function HomePage() {
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
    <div className="space-y-16 sm:space-y-24">

      {/* 2. Categories Horizontal Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              Browse by Genre
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">Explore game files curated by game category</p>
          </div>
          <Link to="/categories" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
            <span>View All</span>
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
              <span className="text-[10px] text-slate-400 mt-1 block">Explore Collection →</span>
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
                Popular Games
              </h2>
              <p className="text-xs text-slate-400">Most downloaded games this week</p>
            </div>
          </div>
          <Link to="/games" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
            <span>See All</span>
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
                  Special Offers
                </h2>
                <p className="text-xs text-slate-400">Limited time discounts on top releases</p>
              </div>
            </div>
            <Link to="/games" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
              <span>View Offers</span>
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
                New Releases
              </h2>
              <p className="text-xs text-slate-400">Fresh additions to the DynaStore vault</p>
            </div>
          </div>
          <Link to="/games" className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1">
            <span>Explore All</span>
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
