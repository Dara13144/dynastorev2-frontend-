import React from 'react';

export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl glass-card overflow-hidden border border-white/5 animate-pulse flex flex-col">
      <div className="aspect-[16/10] bg-slate-800/60 w-full" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-3 w-1/3 bg-slate-800/80 rounded" />
          <div className="h-5 w-3/4 bg-slate-800 rounded" />
          <div className="h-3 w-full bg-slate-800/60 rounded" />
        </div>
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="h-6 w-16 bg-slate-800 rounded" />
          <div className="h-9 w-24 bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-slate-800/40 rounded-xl border border-white/5" />
      ))}
    </div>
  );
}
