'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ToolsIndexHub() {
  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20👋,%20I%20am%20exploring%20EnMate's%20digital%20business%20tools.";

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    
    document.querySelectorAll('.reveal-on-scroll').forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#05030a] text-[var(--text-main)] pt-32 pb-24 font-sans selection:bg-[var(--accent)] selection:text-white">
      <div className="container max-w-[1100px] space-y-12">
        
        {/* Header Block Layout */}
        <header className="text-left space-y-3 max-w-[750px]">
          <span className="section-tag badge inline-block font-mono text-[10px]">Free Strategic Utility Matrix</span>
          <h1 className="text-3xl md:text-5xl font-bold gradient-text leading-none tracking-tight">
            Free Utility Frameworks
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed font-light">
            Engineered tools to help modern enterprises calculate structural metrics, analyze optimization scopes, and project rollout costs without friction.
          </p>
        </header>

        {/* Tools Catalog Stack Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Active Tool Item: Website Cost Calculator */}
          <div className="p-6 bg-[#07040f]/60 border border-white/5 rounded-2xl text-left space-y-4 flex flex-col justify-between hover:border-[var(--accent-soft)]/20 transition-all duration-300 reveal-on-scroll stagger-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-[var(--accent-soft)] uppercase tracking-wider bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-md border border-[var(--accent-soft)]/10">Active Utility</span>
                <i className="fas fa-calculator text-xs text-neutral-600"></i>
              </div>
              <h3 className="text-base md:text-lg font-bold text-white tracking-tight pt-1">
                Website Cost Calculator
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
                Estimate custom framework architectures, single landing page configurations, and technical SEO deployment ranges in India instantly.
              </p>
            </div>
            
            <div className="pt-2">
              <Link href="/tools/website-cost-calculator" className="btn btn-outline text-xs uppercase tracking-wider font-bold w-full md:w-auto">
                <div className="btn-glow-layer" />
                <span className="btn-content-nodes inline-flex items-center justify-center gap-1.5">
                  Launch Tool <i className="fas fa-arrow-right text-[10px] text-[var(--accent-soft)]" />
                </span>
              </Link>
            </div>
          </div>

          {/* Pending Micro-Framework: Coming Soon Container Area */}
          <div className="p-6 bg-[#07040f]/20 border border-dashed border-white/5 rounded-2xl text-left space-y-3 flex flex-col justify-center min-h-[220px] reveal-on-scroll stagger-2 select-none">
            <div className="text-center space-y-2 max-w-sm mx-auto">
              <i className="fas fa-layer-group text-xl text-neutral-700 block mb-2"></i>
              <h4 className="text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider">More Free Business Tools</h4>
              <p className="text-[11px] text-neutral-600 font-light leading-relaxed">
                Our core development desk is compiling ROI calculators, speed digital audit matrices, and keyword intent match engines. Coming soon.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
