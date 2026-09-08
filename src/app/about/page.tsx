'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20👋,%20I%20read%20the%20EnMate%20organization%20profile.%20I%20want%20to%20partner%20with%20your%20team.";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>('.team-card, .value-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { 
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach(target => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#05030a] text-[var(--text-main)] font-sans overflow-x-hidden selection:bg-[var(--accent)] selection:text-white">
      
      {/* ─── COMPACT HERO MANIFESTO ─── */}
      <header className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-b from-[#090514] to-[#05030a] border-b border-white/5 overflow-hidden">
        {/* Ambient background watermark */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16vw] font-extrabold text-white/[0.05] pointer-events-none select-none tracking-widest">
          ENMATE
        </span>
        
        <div className="container max-w-[1100px] text-left space-y-4 relative z-10">
          <span className="section-tag badge inline-block reveal-on-scroll">Corporate Profile</span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight max-w-[850px] reveal-on-scroll">
            <span className="hero-accent-word">Engineered Assets</span> for Market Dominance
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-[700px] leading-relaxed font-light reveal-on-scroll">
            EnMate bridges localized authority in Kottakkal, Kerala with high-performance worldwide digital marketing operations. We write 100% custom-coded conversion funnels and visibility frameworks.
          </p>
        </div>
      </header>

      <main className="divide-y divide-white/5">
        
        {/* ─── 1. CORE STORY & GENESIS ─── */}
        <section className="py-12 md:py-16">
          <div className="container max-w-[1100px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 text-left space-y-1 reveal-on-scroll">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--accent-soft)] uppercase about-tag-line">Origin Matrix</span>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Why EnMate Exists</h2>
              </div>
              <div className="lg:col-span-8 text-left space-y-4 text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed reveal-on-scroll">
                <p>
                  EnMate was born out of frustration with standard agency configurations. Most agencies run template campaigns and assemble slow, bloated websites utilizing heavy page builders that ruin conversion speeds.
                </p>
                <p>
                  We saw a critical market gap: modern businesses require custom-coded, performance-driven business assets optimized to convert raw user intent. We replaced typical aesthetic guesswork with clean, transparent engineering execution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. STRATEGIC MISSION & VISION ─── */}
        <section className="py-12 md:py-16 bg-[#06040c]/40">
          <div className="container max-w-[1100px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="value-card p-6 bg-[#07040f]/60 border border-white/5 rounded-xl text-left space-y-2 reveal-on-scroll about-stagger-1">
                <span className="text-[9px] font-mono font-bold tracking-wider text-[var(--accent-soft)] uppercase about-tag-line">Sustained Vector</span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Our Mission</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">
                  Transforming ambitious brands into absolute market leaders through rigorous optimization, clean framework execution, and elite visual branding layouts built to scale operations globally.
                </p>
              </div>

              <div className="value-card p-6 bg-[#07040f]/60 border border-white/5 rounded-xl text-left space-y-2 reveal-on-scroll about-stagger-2">
                <span className="text-[9px] font-mono font-bold tracking-wider text-[var(--accent-soft)] uppercase about-tag-line">Target Horizon</span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Our Vision</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">
                  Setting the global performance benchmark for custom software solutions—where technical, high-speed development structures perfectly match robust customer acquisition matrices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. FOUNDER BRIEF ─── */}
        <section className="py-12 md:py-16">
          <div className="container max-w-[1100px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 text-left reveal-on-scroll">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--accent-soft)] uppercase about-tag-line">Leadership Focus</span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1 tracking-tight">Founder's Story</h2>
              </div>
              <div className="lg:col-span-8 text-left space-y-3 text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed reveal-on-scroll">
                <h4 className="text-sm md:text-base font-bold text-white font-mono text-[var(--accent-soft)] founder-quote py-1">
                  "Code and design must function as a single lethal acquisition weapon."
                </h4>
                <p>
                  I've always been driven by a passion for building solutions that solve real problems. Through my experience in software development, technology, and business operations, I noticed that many organizations struggled with digital systems that were slow, disconnected, and difficult to scale.
                </p>
                <p>
                  That observation led me to create EnMate.
                </p>
                <p>
                  My goal was not simply to build websites or offer services, but to create a digital partner that helps businesses grow through thoughtful technology, strong execution, and long-term strategy. I believe that successful digital solutions should be fast, secure, user-focused, and built to support real business objectives.
                </p>
                <p>
                  Today, I continue to lead EnMate with a focus on innovation, quality, and continuous improvement, ensuring that every project delivers meaningful value and measurable results for our clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. VALUES & OPERATIONS METHODOLOGY ─── */}
        <section className="py-12 md:py-16 bg-[#06040c]/40">
          <div className="container max-w-[1100px] space-y-8">
            <div className="text-left reveal-on-scroll">
              <span className="section-tag">Strategic Core</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Values & Approach</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="value-card p-6 bg-[#07040f]/50 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-1">
                <span className="text-xs font-mono font-bold text-[var(--accent-soft)]">01 / Custom Development</span>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">
                  We write clean framework code to maximize browser speed compliance, avoiding slow templates and third-party plugin dependencies.
                </p>
              </div>
              <div className="value-card p-6 bg-[#07040f]/50 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-2">
                <span className="text-xs font-mono font-bold text-[var(--accent-soft)]">02 / Mobile-First Architecture</span>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">
                  With over 80% of search intent occurring on smartphones, we balance and fine-tune all system views specifically for mobile viewport tiers first.
                </p>
              </div>
              <div className="value-card p-6 bg-[#07040f]/50 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-3">
                <span className="text-xs font-mono font-bold text-[var(--accent-soft)]">03 / Data Transparency</span>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">
                  We focus exclusively on transaction capture, search engine visibility indexing layers, and concrete conversion growth metrics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. THE ENMATE INTELLIGENCE DESK ─── */}
        <section className="py-12 md:py-16">
          <div className="container max-w-[1100px] space-y-8">
            <div className="text-left reveal-on-scroll">
              <span className="section-tag">The Operators</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">The EnMate Intelligence Desk</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              
              <div className="team-card p-5 bg-[#07040f]/60 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-1">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">Razeek Fariz</h4>
                  <i className="fas fa-user-tie text-xs text-[var(--accent-soft)]"></i>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--accent-soft)] font-mono uppercase tracking-wider">Founder & Tech Lead</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed mt-2">
                    Engineers high-speed Next.js frontend matrices, manages custom relational databases, and builds secure business portal backends.
                  </p>
                </div>
              </div>

              <div className="team-card p-5 bg-[#07040f]/60 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">Muhammed Hanoon</h4>
                  <i className="fas fa-palette text-xs text-[var(--accent-soft)]"></i>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--accent-soft)] font-mono uppercase tracking-wider">Head of Creative</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed mt-2">
                    Structures cohesive corporate visual brand identities, clean layout design systems, and premium vector UI frameworks.
                  </p>
                </div>
              </div>

              <div className="team-card p-5 bg-[#07040f]/60 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">Sahina Sharaf</h4>
                  <i className="fas fa-chart-line text-xs text-[var(--accent-soft)]"></i>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--accent-soft)] font-mono uppercase tracking-wider">Digital Marketing Strategist</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed mt-2">
                    Deploys optimized keyword visibility maps, multi-region ad accounts, and conversion tracking frameworks.
                  </p>
                </div>
              </div>

              <div className="team-card p-5 bg-[#07040f]/60 border border-white/5 rounded-xl text-left space-y-3 reveal-on-scroll about-stagger-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">Muhammed Najad</h4>
                  <i className="fas fa-video text-xs text-[var(--accent-soft)]"></i>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--accent-soft)] font-mono uppercase tracking-wider">Motion Designer & Video Editor</p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed mt-2">
                    Produces scroll-stopping social reels, corporate promotional assets, and cinematic motion graphic sequences.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── CONDENSED HIGH-INTENT CONVERSION CTA ─── */}
        <section className="py-12 md:py-16">
          <div className="container max-w-[1100px]">
            <div className="cta-glow-card p-6 md:p-12 bg-gradient-to-br from-[#07040f] via-[#cf0466]/5 to-[#07040f] border border-white/10 rounded-2xl text-center space-y-4 shadow-xl relative overflow-hidden reveal-on-scroll">
              <div className="relative z-10 space-y-3 max-w-[650px] mx-auto">
                <span className="section-tag !mb-0 font-mono text-[10px]">Scale Your Framework</span>
                <h2 className="text-xl md:text-3xl font-bold text-white">Let's Build Something Powerful</h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed">
                  Connect directly with our strategy and core development desks to transform your operational blueprints into high-converting digital assets.
                </p>
                <div className="pt-2 flex flex-wrap gap-3 justify-center">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent text-xs sm:text-sm uppercase tracking-wider font-bold">
                    <div className="btn-glow-layer" />
                    <span className="btn-content-nodes">Initiate Consultation</span>
                  </a>
                  <Link href="/services" className="btn btn-outline text-xs sm:text-sm uppercase tracking-wider font-bold">
                    <div className="btn-glow-layer" />
                    <span className="btn-content-nodes inline-flex items-center gap-1.5">
                      Review Capabilities Layer <i className="fas fa-arrow-right text-[10px] text-[var(--accent-soft)]" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
