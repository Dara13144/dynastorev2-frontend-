import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Server,
  UserCheck,
  Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function PrivacyPolicyPage() {
  const { isKhmer } = useLanguage();
  const [activeTab, setActiveTab] = useState('legal_notice'); // 'legal_notice' | 'privacy' | 'terms'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 relative"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{isKhmer ? 'សេចក្តីប្រកាសផ្លូវការ & គោលការណ៍ច្បាប់' : 'Official Legal & Privacy Notice'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display">
          {isKhmer ? 'គោលការណ៍ឯកជនភាព & កម្មសិទ្ធិបញ្ញា' : 'Privacy Policy & Intellectual Property'}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isKhmer
            ? 'ការការពារសិទ្ធិអ្នកប្រើប្រាស់ ការរក្សាការសម្ងាត់ទិន្នន័យ និងសេចក្តីប្រកាសកម្មសិទ្ធិបញ្ញាការពារ UI/UX នៃប្រព័ន្ធ DynaStore'
            : 'Protecting user data privacy, confidentiality standards, and legal intellectual property protection of DynaStore.'}
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('legal_notice')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'legal_notice'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 ring-2 ring-rose-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{isKhmer ? 'លិខិតព្រមានផ្លូវច្បាប់ (Legal Notice)' : 'Legal Warning Notice'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-brand-cyan text-slate-900 shadow-neon-cyan ring-2 ring-brand-cyan/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isKhmer ? 'គោលការណ៍ឯកជនភាព (Privacy Policy)' : 'Privacy Policy'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 ring-2 ring-purple-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isKhmer ? 'លក្ខខណ្ឌប្រើប្រាស់ (Terms of Service)' : 'Terms of Service'}</span>
          </button>
        </div>
      </motion.div>

      {/* TAB 1: OFFICIAL LEGAL NOTICE & WARNING (From Document) */}
      {activeTab === 'legal_notice' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl glass-panel border border-rose-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8 bg-[#0c101a]/95"
        >
          {/* Top Stamp / Header Banner */}
          <div className="border-b border-rose-500/20 pb-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/logo.png"
                alt="DynaStore Logo"
                className="w-12 h-12 rounded-full object-contain bg-white/95 p-0.5 shadow-neon-cyan"
              />
              <div className="text-left">
                <span className="text-xl font-black text-white font-display tracking-wide uppercase block">
                  DYNASTORE DEVELOPER TEAM
                </span>
                <span className="text-xs text-rose-400 font-medium tracking-wider uppercase">
                  {isKhmer
                    ? 'សេចក្តីប្រកាសផ្លូវការ និងការជូនដំណឹងផ្លូវច្បាប់ស្តីពីកម្មសិទ្ធិបញ្ញា UI'
                    : 'Official Declaration & Legal Notice on UI Intellectual Property'}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 pt-1">
              {isKhmer ? 'គេហទំព័រផ្លូវការ' : 'Official Website'}:{' '}
              <a href="https://www.dynastore" target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline font-mono">
                www.dynastore
              </a>
            </div>
          </div>

          {/* Official Document Banner */}
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-5 text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-rose-400 uppercase tracking-wide">
              លិខិតព្រមានផ្លូវច្បាប់ជាផ្លូវការ (LEGAL NOTICE & WARNING)
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wider uppercase">
              NOTICE OF INTELLECTUAL PROPERTY & UI/UX DESIGN PROTECTION
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">
                {isKhmer ? 'កាលបរិច្ឆេទ (Date)' : 'Date'}
              </span>
              <span className="text-slate-200 font-medium">04 កញ្ញា 2026</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">
                {isKhmer ? 'យោងលិខិត (Ref)' : 'Reference Ref'}
              </span>
              <span className="text-rose-400 font-mono font-bold">DYN-IP-2026/09</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">
                {isKhmer ? 'ភាគីចេញលិខិត' : 'Issuing Entity'}
              </span>
              <span className="text-slate-200 font-medium">ក្រុមការងារ Developer Dynastore</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-bold text-[10px]">
                {isKhmer ? 'ប្រភពគេហទំព័រ' : 'Source Website'}
              </span>
              <span className="text-brand-cyan font-mono">www.dynastore</span>
            </div>
          </div>

          {/* SECTION 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center font-black">
                ១
              </span>
              <span>សេចក្តីប្រកាសអត្តសញ្ញាណ និងកម្មសិទ្ធិផ្តាច់មុខ (Declaration of Ownership)</span>
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed pl-9 space-y-2">
              <p>
                ពួកយើងខ្ញុំគឺជាក្រុមការងារ Developer នៃគេហទំព័រ <strong>Dynastore</strong> ដែលជាអ្នកបង្កើត និងគ្រប់គ្រងគេហទំព័រផ្លូវការ <code className="text-brand-cyan px-1.5 py-0.5 rounded bg-white/5">www.dynastore</code>។
              </p>
              <p>
                សូមជូនដំណឹងជាផ្លូវការដល់សាធារណជន បុគ្គល ក្រុមហ៊ុន និងក្រុមអ្នកបង្កើតវេបសាយទាំងអស់ឱ្យបានជ្រាបថា៖
              </p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200 leading-relaxed">
                រាល់ទម្រង់នៃការរចនាផ្ទៃមុខកម្មវិធី (<strong>User Interface / UI</strong>), រចនាសម្ព័ន្ធទំព័រ (<strong>Layout</strong>), សមាសភាគ (<strong>Components</strong>), ក្រាហ្វិក រួមទាំងកូដប្រព័ន្ធ (<strong>Frontend & Backend Codebase</strong>) ទាំងអស់នៃគេហទំព័រ <span className="text-brand-cyan font-semibold">www.dynastore</span> គឺជាស្នាដៃ និងជាកម្មសិទ្ធិបញ្ញាផ្តាច់មុខស្របច្បាប់របស់ក្រុមការងារ Dynastore ទាំងស្រុង។
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center font-black">
                ២
              </span>
              <span>ការហាមឃាត់ជាដាច់ខាត (Strict Prohibitions)</span>
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed pl-9 space-y-3">
              <p className="text-slate-400">
                ក្រុមការងារ Dynastore សូមធ្វើការហាមឃាត់ជាដាច់ខាតចំពោះទង្វើដូចខាងក្រោម៖
              </p>
              <ul className="space-y-3">
                <li className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-rose-300 font-bold block">
                      ការលួចចម្លង UI (UI Copy / Cloning):
                    </strong>
                    <span className="text-slate-300 text-xs sm:text-sm">
                      ការចម្លងទាំងស្រុង ឬមួយផ្នែកនូវ UI, រូបរាង (Theme), ប្លង់ទំព័រ (Layout) និងរចនាបថនៃ www.dynastore យកទៅដាក់លើវេបសាយ ឬកម្មវិធីផ្សេង។
                    </span>
                  </div>
                </li>
                <li className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-rose-300 font-bold block">
                      ការលួចចម្លងកូដ (Code Scraping & Duplication):
                    </strong>
                    <span className="text-slate-300 text-xs sm:text-sm">
                      ការទាញយក ឬចម្លងកូដ HTML, CSS, JavaScript, API ឬប្រព័ន្ធគ្រប់គ្រងរបស់ពួកយើងដោយគ្មានការអនុញ្ញាតជាលាយលក្ខណ៍អក្សរ។
                    </span>
                  </div>
                </li>
                <li className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-rose-300 font-bold block">
                      ការបន្លំយីហោ (Impersonation & Brand Spoofing):
                    </strong>
                    <span className="text-slate-300 text-xs sm:text-sm">
                      ការប្រើប្រាស់ UI ឬធាតុផ្សំនៃ Dynastore ក្នុងគោលបំណងបន្លំភ្នែកអ្នកប្រើប្រាស់ ឬប្រកួតប្រជែងមិនស្មោះត្រង់។
                    </span>
                  </div>
                </li>
              </ul>

              {/* Legal Warning Notice Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 space-y-2 mt-4 shadow-lg">
                <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base text-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>សេចក្តីព្រមានចាត់វិធានការតាមផ្លូវច្បាប់ជាធរមាន៖</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  ប្រសិនបើពិនិត្យឃើញ ឬមានភស្តុតាងថាមានអ្នកណាម្នាក់បាន និងកំពុងធ្វើការលួចចម្លង UI, Component ឬប្រព័ន្ធរបស់ Dynastore គឺពួកយើងនឹងចាត់វិធានការតាមផ្លូវច្បាប់ជាធរមានភ្លាមៗ ដោយគ្មានការលើកលែង ឬយោគយល់ឡើយ។
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center font-black">
                ៣
              </span>
              <span>ចំណាត់ការផ្លូវច្បាប់ដែលត្រូវអនុវត្ត (Legal Consequences & Sanctions)</span>
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed pl-9 space-y-3">
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">ប្តឹងតាមផ្លូវតុលាការ៖</strong> ចាត់វិធានការតាមច្បាប់ស្តីពីសិទ្ធិអ្នកនិពន្ធ និងសិទ្ធិប្រហាក់ប្រហែល ព្រមទាំងច្បាប់ស្តីពីបទល្មើសបច្ចេកវិទ្យា (Cybercrime Laws)។
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">ការស្នើសុំបិទវេបសាយ (DMCA & Hosting Takedown):</strong> សហការជាមួយស្ថាប័នពាក់ព័ន្ធ Domain Registrar, Server/Hosting Provider និងបណ្តាញ Cloudflare ដើម្បីផ្អាកដំណើរការគេហទំព័រចម្លងជាបន្ទាន់។
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">ការទាមទារសំណងការខូចខាត (Damages Compensation):</strong> ទាមទារឱ្យសងសំណងជំងឺចិត្ត និងសំណងខូចខាតអាជីវកម្មយ៉ាងពេញទំហឹងតាមច្បាប់កំណត់។
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Signatures & Verification Stamp */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 uppercase font-semibold">Authorized By:</div>
              <div className="text-sm font-bold text-white">Dynastore Developer Team</div>
              <div className="text-xs text-brand-cyan">Lead Technical Engineering</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <div className="text-xs text-slate-400 uppercase font-semibold">Enforced By:</div>
              <div className="text-sm font-bold text-rose-300">Legal & Copyright Enforcement Unit</div>
              <div className="text-xs text-slate-400">Intellectual Property Division</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: PRIVACY POLICY */}
      {activeTab === 'privacy' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8"
        >
          <div className="space-y-2 border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'គោលការណ៍រក្សាការសម្ងាត់ទិន្នន័យ' : 'Customer Confidentiality'}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display">
              {isKhmer ? 'គោលការណ៍ឯកជនភាព និងសុវត្ថិភាពទិន្នន័យ DynaStore' : 'DynaStore Customer Privacy Policy'}
            </h2>
            <p className="text-xs text-slate-400">
              {isKhmer ? 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ខែកញ្ញា ឆ្នាំ ២០២៦' : 'Last Updated: September 2026'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <UserCheck className="w-6 h-6 text-brand-cyan" />
              <h3 className="text-base font-bold text-white">
                {isKhmer ? 'ទិន្នន័យគណនី' : 'Account Information'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isKhmer
                  ? 'យើងប្រមូលព័ត៌មានមូលដ្ឋានដូចជា ឈ្មោះ និងអ៊ីមែល តាមរយៈ Google OAuth សុវត្ថិភាព ដើម្បីផ្ដល់សិទ្ធិចូលប្រើប្រាស់ និងរក្សាកាបូបប្រាក់របស់អ្នក។'
                  : 'We only obtain basic profile info (email and display name) via Google OAuth for account verification and wallet storage.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                {isKhmer ? 'សុវត្ថិភាពការទូទាត់' : 'Payment Protection'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isKhmer
                  ? 'ការទូទាត់តាម Bakong KHQR និង ABA PayWay ត្រូវបានផ្ទៀងផ្ទាត់ដោយផ្ទាល់ពីធនាគារ។ គ្មានការរក្សាទុកលេខកាត ឬពាក្យសម្ងាត់ធនាគារក្នុងប្រព័ន្ធឡើយ។'
                  : 'All Bakong KHQR and ABA transactions are processed directly with banking gateways. We never store credit cards or banking passwords.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Server className="w-6 h-6 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                {isKhmer ? 'ការការពារទិន្នន័យ' : 'Zero Data Selling'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isKhmer
                  ? 'យើងធានាដាច់ខាតមិនលក់ មិនចែកចាយ ឬផ្ទេរព័ត៌មានឯកជនរបស់អ្នកទៅកាន់ភាគីទីបីណាមួយឡើយ ក្រោមលក្ខខណ្ឌណាក៏ដោយ។'
                  : 'DynaStore guarantees that your personal data, order histories, and contact info are strictly confidential and never sold to third parties.'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10 text-sm text-slate-300 leading-relaxed">
            <h4 className="text-base font-bold text-white">
              {isKhmer ? '១. សិទ្ធិគ្រប់គ្រងទិន្នន័យរបស់អ្នក' : '1. Your Data Rights'}
            </h4>
            <p>
              {isKhmer
                ? 'អ្នកមានសិទ្ធិមើលប្រវត្តិបញ្ជាទិញ សមតុល្យកាបូប ឯកសារទាញយក និងអាចស្នើសុំកែប្រែ ឬលុបគណនីរបស់អ្នកបានគ្រប់ពេលវេលាតាមរយៈទំព័រ Profile ឬទាក់ទងមកកាន់ Support។'
                : 'You have full right to access your order histories, wallet transactions, download records, and request profile updates or deletion anytime.'}
            </p>

            <h4 className="text-base font-bold text-white pt-2">
              {isKhmer ? '២. សុវត្ថិភាពឯកសារហ្គេម & Cloudflare' : '2. File Downloads & Security'}
            </h4>
            <p>
              {isKhmer
                ? 'រាល់ Link ទាញយកហ្គេម និងឯកសារទាំងអស់ត្រូវបានបង្កើតជា Signed URL ដែលផុតកំណត់តាមពេលកំណត់ ដើម្បីការពារការលួចទាញយកខុសច្បាប់ និងរក្សាល្បឿនទាញយកខ្ពស់បំផុត។'
                : 'All digital file downloads use time-limited secure signed URLs to guarantee speed, prevent link stealing, and protect user downloads.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* TAB 3: TERMS OF SERVICE */}
      {activeTab === 'terms' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl glass-panel border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6 text-sm text-slate-300 leading-relaxed"
        >
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-black text-white font-display">
              {isKhmer ? 'លក្ខខណ្ឌប្រើប្រាស់សេវាកម្ម (Terms of Service)' : 'Terms of Service'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isKhmer ? 'លក្ខខណ្ឌច្បាប់សម្រាប់អ្នកទិញ និងអ្នកប្រើប្រាស់គេហទំព័រ DynaStore' : 'Legal terms governing DynaStore users and purchasers'}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              {isKhmer ? '១. អាជ្ញាប័ណ្ណប្រើប្រាស់ឌីជីថល' : '1. Digital License Usage'}
            </h3>
            <p>
              {isKhmer
                ? 'ហ្គេម និងឯកសារដែលបានទិញលើ DynaStore គឺសម្រាប់តែការប្រើប្រាស់ផ្ទាល់ខ្លួនរបស់អ្នកទិញប៉ុណ្ណោះ។ ការចែកចាយបន្ត លក់បន្ត ឬយកទៅកែច្នៃធ្វើអាជីវកម្មដោយគ្មានការអនុញ្ញាត ត្រូវបានហាមឃាត់ដាច់ខាត។'
                : 'Files and game installations purchased on DynaStore are licensed solely for the buyer’s personal use. Unauthorized resale, redistribution, or modification is strictly prohibited.'}
            </p>

            <h3 className="text-base font-bold text-white">
              {isKhmer ? '២. គោលការណ៍សងប្រាក់' : '2. Refund Policy'}
            </h3>
            <p>
              {isKhmer
                ? 'ដោយសារផលិតផលជាឯកសារឌីជីថលទាញយកភ្លាមៗ យើងផ្ដល់ការគាំទ្របច្ចេកទេស និងការសងប្រាក់ត្រឡប់ទៅកាន់កាបូប (Wallet) ក្នុងករណីឯកសារមានបញ្ហា ឬ Link ខូច ហើយមិនអាចដោះស្រាយបាន។'
                : 'Because digital items grant immediate file access, refunds to the DynaStore wallet are evaluated if a download link is damaged and technical support is unable to resolve it.'}
            </p>

            <h3 className="text-base font-bold text-white">
              {isKhmer ? '៣. ភាពត្រឹមត្រូវនៃកម្មសិទ្ធិបញ្ញា' : '3. Intellectual Property Compliance'}
            </h3>
            <p>
              {isKhmer
                ? 'រាល់ការចូលមកកាន់គេហទំព័រនេះ តម្រូវឱ្យគោរពតាមលិខិតព្រមានផ្លូវច្បាប់ស្តីពីកម្មសិទ្ធិបញ្ញា (Ref: DYN-IP-2026/09) ទាំងស្រុង។'
                : 'All visitors and users must adhere strictly to the Intellectual Property Protection Notice (Ref: DYN-IP-2026/09).'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Direct Contact & Support Callout */}
      <div className="p-6 rounded-3xl glass-card border border-brand-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-neon-cyan">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-white">
            {isKhmer ? 'មានសំណួរទាក់ទងនឹងគោលការណ៍ឯកជនភាព ឬច្បាប់?' : 'Questions regarding privacy or legal terms?'}
          </h4>
          <p className="text-xs text-slate-400">
            {isKhmer
              ? 'ទំនាក់ទំនងមកកាន់ក្រុមការងារ DynaStore Developer Team តាមរយៈ Telegram ឬទំព័រ Support។'
              : 'Contact DynaStore Developer Team directly for official copyright or verification requests.'}
          </p>
        </div>
        <Link
          to="/about"
          className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shrink-0"
        >
          {isKhmer ? 'អំពីក្រុមការងារ (About Us)' : 'About Developer Team'}
        </Link>
      </div>
    </div>
  );
}
