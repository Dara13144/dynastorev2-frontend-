import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ShieldCheck, Zap, Download, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background-card/90 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="DynaStore"
                className="w-12 h-12 rounded-full object-contain bg-white/95 p-0.5 shadow-neon-cyan"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                  Dyna<span className="text-brand-cyan">Store</span>
                </span>
                <span className="text-[10px] tracking-widest text-cyan-400/80 uppercase font-medium">
                  Cambodia Digital Games
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Cambodia's premier digital game store for downloadable PC games, standalone releases, modpacks, and gaming assets. Fast, secure checkout via ABA PayWay KHQR.
            </p>
            {/* Payment Badges */}
            <div className="pt-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">
                Official Payment Gateway Partner
              </span>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 shadow-md">
                <span className="text-xs font-bold text-white tracking-wide">ABA PayWay</span>
                <span className="text-xs text-cyan-400 font-semibold">• KHQR & Cards</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/games" className="hover:text-brand-cyan transition-colors">All Games</Link></li>
              <li><Link to="/categories" className="hover:text-brand-cyan transition-colors">Categories</Link></li>
              <li><Link to="/wallet" className="hover:text-brand-cyan transition-colors">Wallet Top-up</Link></li>
              <li><Link to="/downloads" className="hover:text-brand-cyan transition-colors">My Downloads</Link></li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Top Genres</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/games?category=action" className="hover:text-brand-cyan transition-colors">Action & Combat</Link></li>
              <li><Link to="/games?category=rpg" className="hover:text-brand-cyan transition-colors">Role Playing (RPG)</Link></li>
              <li><Link to="/games?category=racing" className="hover:text-brand-cyan transition-colors">Racing & Drift</Link></li>
              <li><Link to="/games?category=minecraft" className="hover:text-brand-cyan transition-colors">Sandbox & Mods</Link></li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Store Guarantees</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Download className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                <span>Instant signed direct download links after payment verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Verified malware-free game archives and packages.</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Secure Cambodian Riel (KHR) and USD checkout via ABA PayWay.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DynaStore Cambodia. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
