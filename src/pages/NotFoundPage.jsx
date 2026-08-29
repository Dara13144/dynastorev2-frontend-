import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-brand-surface border border-white/10 flex items-center justify-center mx-auto text-brand-cyan shadow-neon-cyan">
        <Gamepad2 className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-white font-display">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Stage Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested level, game, or page could not be located in the DynaStore matrix.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link to="/" className="px-6 py-3 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-neon-cyan">
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
