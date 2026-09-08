'use client';

import React from 'react';

export default function GlobalWorkspaceLoading() {
  return (
    <div className="min-h-screen w-full bg-[#05030a] flex items-center justify-center fixed inset-0 z-[999999]">
      <div className="text-center space-y-6 max-w-[320px] px-6 select-none">
        
        {/* ─── ELITE ENMATE HIGH-TECH NEON METRIC SPINNER ─── */}
        <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
          {/* External Ambient Pulse Vector */}
          <div className="absolute inset-0 rounded-full border border-[var(--accent-soft)]/20 animate-ping opacity-75" />
          
          {/* Inner Accelerated Core Ring Spinner */}
          <div 
            className="w-full h-full rounded-full border-[2px] border-t-[var(--accent-soft)] border-r-transparent border-b-transparent border-l-transparent animate-spin" 
            style={{ animationDuration: '0.65s' }}
          />
          
          {/* Stationary Core Logo Node */}
          <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>

        {/* ─── TECHNICAL TRACKING METRIC PROSE TEXT ─── */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/90">
            Synchronizing Matrix
          </h4>
          <p className="text-[9px] font-mono tracking-widest text-[var(--text-muted)] opacity-60 uppercase">
            Fetching secure database rows...
          </p>
        </div>

      </div>
    </div>
  );
}
