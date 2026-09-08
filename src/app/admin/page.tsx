'use client';

import React from 'react';
import Link from 'next/link';

export default function UnifiedAdminDashboard() {
  return (
    <div className="min-h-screen bg-[#05030a] text-[var(--text-main)] pt-32 pb-12 px-4 md:px-8 font-sans selection:bg-[var(--accent)] selection:text-white">
      <div className="w-full max-w-[1200px] mx-auto space-y-12 text-left">
        
        <div>
          <span className="section-tag font-mono text-[10px]">Internal Executive Command</span>
          <h1 className="text-3xl md:text-5xl font-bold gradient-text tracking-tight uppercase"><span className="font-anokha">EnMate</span> Core Operations</h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] font-light mt-2 max-w-[600px]">
            Welcome back to your central system workspace. Select a production module below to deploy content streams or adjust live architecture elements.
          </p>
        </div>

        {/* Core App Control Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Portfolio Module Card Link */}
          <Link href="/admin/portfolio-manager" className="btn group relative p-6 md:p-8 bg-[#07040f]/80 border border-white/5 hover:border-[var(--accent-soft)] rounded-3xl transition-all duration-300 shadow-xl overflow-hidden block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#cf0466]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-4 pointer-events-none">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl text-[var(--accent-soft)]">
                <i className="fas fa-folder-open"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[var(--accent-soft)] transition-colors">Portfolio Showcase Subsystem</h3>
                <p className="text-xs text-[var(--text-muted)] font-light mt-1 leading-relaxed">
                  Inject client case studies, handle verified media uploads, and create dynamic work visual category filters natively.
                </p>
              </div>
            </div>
          </Link>

          {/* Blog Module Card Link */}
          <Link href="/admin/blog" className="btn group relative p-6 md:p-8 bg-[#07040f]/80 border border-white/5 hover:border-[var(--accent-soft)] rounded-3xl transition-all duration-300 shadow-xl overflow-hidden block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#cf0466]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative space-y-4 pointer-events-none">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl text-[var(--accent-soft)]">
                <i className="fas fa-pen-nib"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[var(--accent-soft)] transition-colors">Authority Blog Composer</h3>
                <p className="text-xs text-[var(--text-muted)] font-light mt-1 leading-relaxed">
                  Draft search-engine compliant insights, audit real-time SEO grading scales, and broadcast strategy articles globally.
                </p>
              </div>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
