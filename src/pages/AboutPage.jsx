import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AboutPage() {
  const { isKhmer } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 relative"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold uppercase tracking-wider shadow-neon-cyan">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span>{isKhmer ? 'អំពីគេហទំព័រ DynaStore' : 'About DynaStore Cambodia'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white font-display">
          {isKhmer ? 'វេទិកាហ្គេមឌីជីថលឈានមុខគេ' : 'Cambodia’s Premier Digital Game Platform'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isKhmer
            ? 'បង្កើតឡើងដោយក្រុមការងារ Developer ជំនាញ ក្នុងគោលបំណងផ្តល់ជូននូវបទពិសោធន៍ទិញ និងទាញយកហ្គេម PC, កម្មវិធី និង Minecraft Modpacks បានលឿន និងមានសុវត្ថិភាពបំផុត។'
            : 'Engineered by the DynaStore Developer Team to deliver the fastest, safest instant PC game and digital software distribution powered by Bakong KHQR.'}
        </p>
      </motion.div>

      {/* Developer Team Declaration Banner */}
      <div className="rounded-3xl glass-panel border border-brand-cyan/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0c101a] via-[#101525] to-[#0c101a]">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/95 p-2 shadow-neon-cyan flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="DynaStore Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-3 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'កម្មសិទ្ធិបញ្ញាផ្លូវការ' : 'Official Copyright & IP Protected'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              DYNASTORE DEVELOPER TEAM
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isKhmer
                ? 'ពួកយើងគឺជាក្រុមការងារ Developer ដែលបានរចនា បង្កើត និងគ្រប់គ្រងគេហទំព័រផ្លូវការ www.dynastore ទាំងស្រុង។ រាល់ទម្រង់ UI/UX, Component, ប្រព័ន្ធកូដ Frontend & Backend គឺជាស្នាដៃ និងជាកម្មសិទ្ធិផ្តាច់មុខ។'
                : 'The DynaStore Developer Team holds full ownership and exclusive intellectual property over all UI/UX designs, layouts, components, and codebase of www.dynastore.'}
            </p>
            <div className="pt-2">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan hover:text-cyan-300 transition-colors"
              >
                <span>{isKhmer ? 'អានលិខិតព្រមានផ្លូវច្បាប់ស្តីពីកម្មសិទ្ធិបញ្ញា' : 'Read Intellectual Property Legal Warning'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Core Platform Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isKhmer ? 'ទូទាត់ភ្លាម ទាញយកភ្លាម' : 'Instant KHQR Delivery'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isKhmer
              ? 'ប្រព័ន្ធទូទាត់ Bakong KHQR អូតូ ស្កេនទូទាត់ប្រាក់ពីគ្រប់ធនាគារនៅកម្ពុជា និងទទួលបាន Link ទាញយកផ្លូវការភ្លាមៗក្នុងរយៈពេលត្រឹមប៉ុន្មានវិនាទី។'
              : 'Direct Bakong KHQR integration generates immediate signed downloads within seconds after bank payment confirmation.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isKhmer ? 'ឯកសារស្អាត គ្មានមេរោគ' : '100% Virus-Free Files'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isKhmer
              ? 'ឯកសារហ្គេមទាំងអស់ត្រូវបានធ្វើតេស្ត ដំឡើង និងស្កេនមេរោគយ៉ាងហ្មត់ចត់ ដើម្បីធានាថាកុំព្យូទ័ររបស់អ្នកដំណើរការបានរលូន និងមានសុវត្ថិភាព។'
              : 'All game archives and installations are pre-tested and virus-scanned to ensure maximum PC security and flawless performance.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isKhmer ? 'បច្ចេកវិទ្យាទំនើប' : 'State-of-the-Art Tech'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isKhmer
              ? 'ដំណើរការដោយ Supabase Cloud Database, React 18, Tailwind CSS និង Cloudflare CDN ធានាល្បឿនលឿន និងស្ថេរភាព 24/7។'
              : 'Engineered with Supabase Cloud Database, React 18, Tailwind CSS, and Cloudflare CDN for 24/7 uptime and extreme speed.'}
          </p>
        </div>
      </div>

      {/* Mission statement */}
      <div className="rounded-3xl glass-panel border border-white/10 p-8 space-y-4">
        <h3 className="text-xl font-black text-white font-display">
          {isKhmer ? 'បេសកកម្មរបស់យើង' : 'Our Mission'}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {isKhmer
            ? 'DynaStore បង្កើតឡើងដោយក្ដីស្រលាញ់វិស័យ Gaming និងការអភិវឌ្ឍប្រព័ន្ធ Software នៅកម្ពុជា។ ពួកយើងប្តេជ្ញាផ្តល់ជូននូវសេវាកម្មទិញហ្គេមឌីជីថលដែលស្រួលប្រើប្រាស់ តម្លៃសមរម្យសម្រាប់យុវជន និងអ្នកលេងហ្គេមខ្មែរគ្រប់រូប ដោយមិនចាំបាច់មានកាត Visa/Mastercard អន្តរជាតិ គ្រាន់តែមានគណនីធនាគារក្នុងស្រុកតាមរយៈ Bakong KHQR។'
            : 'DynaStore was founded with passion for gaming and modern software engineering in Cambodia. Our mission is to make digital gaming accessible, secure, and affordable for every Cambodian gamer using local currency and Bakong KHQR without requiring international credit cards.'}
        </p>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/10">
        <span className="text-xs text-slate-400">
          © {new Date().getFullYear()} DynaStore Developer Team. All rights reserved.
        </span>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link to="/privacy" className="text-brand-cyan hover:underline">
            {isKhmer ? 'គោលការណ៍ឯកជនភាព & ច្បាប់' : 'Privacy & Legal Notice'}
          </Link>
          <span className="text-slate-600">•</span>
          <Link to="/games" className="text-slate-300 hover:text-white transition-colors">
            {isKhmer ? 'មើលហ្គេមទាំងអស់' : 'Explore Games'}
          </Link>
        </div>
      </div>
    </div>
  );
}
