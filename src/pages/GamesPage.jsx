import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Gamepad2 } from 'lucide-react';
import API from '../utils/api.js';
import GameCard from '../components/GameCard.jsx';
import { GameCardSkeleton } from '../components/SkeletonLoader.jsx';

export default function GamesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const selectedPlatform = searchParams.get('platform') || '';
  const selectedSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (searchQuery) params.set('search', searchQuery);
        if (selectedPlatform) params.set('platform', selectedPlatform);
        if (selectedSort) params.set('sort', selectedSort);

        const res = await API.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, selectedPlatform, selectedSort]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Games Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse through all available game files, mods, and downloadable releases
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Filter by title or developer..."
            className="w-full bg-background-card text-sm text-white placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-cyan"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/5">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          <button
            onClick={() => updateFilter('category', '')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-brand-cyan text-black shadow-neon-cyan'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Genres
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => updateFilter('category', c.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.slug
                  ? 'bg-brand-cyan text-black shadow-neon-cyan'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort & Platform dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPlatform}
            onChange={(e) => updateFilter('platform', e.target.value)}
            className="bg-background-card text-xs text-slate-300 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          >
            <option value="">All Platforms</option>
            <option value="PC">PC / Windows</option>
            <option value="Java">Java Edition</option>
          </select>

          <select
            value={selectedSort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-background-card text-xs text-slate-300 rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-brand-cyan"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <GameCardSkeleton key={idx} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <GameCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-3xl border border-white/5 space-y-4">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No games found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search filters or browse other genres in our catalog.
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="px-4 py-2 rounded-xl gradient-btn text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
