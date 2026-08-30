import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, toggleLang } = useLanguage();

  if (compact) {
    return (
      <button
        onClick={toggleLang}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-brand-surface border border-white/10 hover:border-brand-cyan/40 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm group"
        title="Switch Language / ប្តូរភាសា"
      >
        <span className="text-sm">{lang === 'km' ? '🇰🇭' : '🇬🇧'}</span>
        <span className="uppercase text-[11px] font-bold text-brand-cyan font-mono">
          {lang === 'km' ? 'KH' : 'EN'}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center bg-brand-surface/90 border border-white/10 rounded-full p-1 shadow-sm backdrop-blur-md">
      <button
        type="button"
        onClick={() => setLang('km')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          lang === 'km'
            ? 'bg-gradient-to-r from-brand-cyan to-cyan-400 text-black shadow-neon-cyan font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span className="text-xs">🇰🇭</span>
        <span>ខ្មែរ</span>
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
          lang === 'en'
            ? 'bg-gradient-to-r from-brand-cyan to-cyan-400 text-black shadow-neon-cyan font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
