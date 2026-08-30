import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Download, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t, isKhmer } = useLanguage();

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
              {t('footer.tagline')}
            </p>
            {/* Payment Badges */}
            <div className="pt-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">
                {isKhmer ? 'ប្រព័ន្ធទូទាត់ប្រាក់ផ្លូវការ' : 'Official Payment Partner'}
              </span>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 shadow-md">
                <span className="text-xs font-bold text-white tracking-wide">Bakong KHQR</span>
                <span className="text-xs text-cyan-400 font-semibold">• All Banks & Cards</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/games" className="hover:text-brand-cyan transition-colors">{t('nav.exploreGames')}</Link></li>
              <li><Link to="/categories" className="hover:text-brand-cyan transition-colors">{t('nav.categories')}</Link></li>
              <li><Link to="/wallet" className="hover:text-brand-cyan transition-colors">{t('nav.wallet')}</Link></li>
              <li><Link to="/downloads" className="hover:text-brand-cyan transition-colors">{t('nav.downloads')}</Link></li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{isKhmer ? 'ប្រភេទហ្គេមល្បីៗ' : 'Top Genres'}</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/games?category=action" className="hover:text-brand-cyan transition-colors">{isKhmer ? 'ហ្គេមវាយប្រហារ & សកម្មភាព' : 'Action & Combat'}</Link></li>
              <li><Link to="/games?category=rpg" className="hover:text-brand-cyan transition-colors">{isKhmer ? 'ហ្គេមផ្សងព្រេង RPG' : 'Role Playing (RPG)'}</Link></li>
              <li><Link to="/games?category=racing" className="hover:text-brand-cyan transition-colors">{isKhmer ? 'ហ្គេមប្រណាំងឡាន' : 'Racing & Drift'}</Link></li>
              <li><Link to="/games?category=minecraft" className="hover:text-brand-cyan transition-colors">{isKhmer ? 'Minecraft & Modpacks' : 'Sandbox & Mods'}</Link></li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{isKhmer ? 'ការធានារបស់ហាង' : 'Store Guarantees'}</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Download className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                <span>{t('home.instantDeliveryDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('home.verifiedFilesDesc')}</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{t('home.khqrPaymentDesc')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DynaStore Cambodia. {t('footer.rightsReserved')}</p>
          <div className="flex items-center gap-6">
            <span>{isKhmer ? 'លក្ខខណ្ឌប្រើប្រាស់' : 'Terms of Service'}</span>
            <span>{isKhmer ? 'គោលការណ៍ឯកជនភាព' : 'Privacy Policy'}</span>
            <span>{isKhmer ? 'គោលការណ៍សងប្រាក់' : 'Refund Policy'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
