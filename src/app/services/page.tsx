import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { services } from '@/lib/services-data';

export const metadata: Metadata = {
  title: 'Our Services | Web Development, Branding, SEO & Systems | EnMate',
  description: "Explore EnMate's specialized execution models — custom website development, visual branding identity setups, digital marketing funnels, cinematic video production, and business automation platforms. Based in Kottakkal, Kerala, serving clients worldwide.",
  alternates: {
    canonical: 'https://enmate.in/services',
  },
};

export default function ServicesIndexPage() {
  const serviceList = Object.entries(services);
  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20👋,%20I%20found%20EnMate%20online.%20I%20want%20to%20scale%20our%20business%20with%20the%20best%20digital%20marketing%20services.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "provider": {
      "@type": "Organization",
      "name": "EnMate",
      "url": "https://enmate.in"
    },
    "serviceType": "Digital Marketing, Web Engineering, & Branding Identity Systems",
    "areaServed": "Worldwide",
    "description": "Premium custom coded websites, dynamic software dashboards, SEO strategies, and enterprise visibility architectures."
  };

  return (
    <>
      <Script
        id="services-index-schema-matrix"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen w-full bg-[#05030a] text-[var(--text-main)] font-sans selection:bg-[var(--accent)] selection:text-white">
        
        {/* ─── HERO HEADER SECTION ─── */}
        <header className="relative pt-40 pb-16 bg-gradient-to-b from-[#090514] to-[#05030a] overflow-hidden border-b border-white/5">
          <div className="container max-w-[900px] text-center">
            <span className="section-tag badge mx-auto inline-block mb-4">Our Operations Capability</span>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6 leading-none tracking-tight">
              Engineered Systems to Dominate Markets
            </h1>
            <p className="text-[var(--text-muted)] text-sm md:text-base max-w-[750px] mx-auto leading-relaxed font-light">
              We don't provide cookie-cutter, basic setups. EnMate constructs highly scalable digital architectures, tactical search visibility models, and premium visual branding systems tailored to turn audience intent into clean business revenue.
            </p>
          </div>
        </header>

        {/* ─── VERTICAL OPERATIONS PRESENTATION STACK ─── */}
        <main className="divide-y divide-white/5">
          {serviceList.map(([slug, service], i) => {
            const isEven = i % 2 === 0;

            return (
              <section 
                key={slug} 
                className="py-16 md:py-24 relative overflow-hidden bg-cover bg-fixed bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(5,3,10,0.96), rgba(5,3,10,0.96)), url('/images/bg-images/${isEven ? 'home-lap-bg.webp' : 'home-mobile-bg.webp'}')`
                }}
              >
                <div className="container">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* TEXT CONTENT COLUMN LAYER */}
                    <div className={`lg:col-span-6 space-y-6 text-left ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                          <i className={`${service.icon} text-sm text-[var(--accent-soft)]`}></i>
                        </div>
                        <span className="text-[11px] font-mono font-bold tracking-widest text-[var(--accent-soft)] uppercase">
                          Capabilities Layer // 0{i + 1}
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                        {service.title}
                      </h2>

                      <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-light">
                        {service.overview}
                      </p>

                      {/* ACTION BUTTON ROW WITH GLOW & REFLECTION LAYERS */}
                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <a 
                          href={whatsappUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary text-xs sm:text-sm uppercase tracking-wider font-bold"
                        >
                          <div className="btn-glow-layer" />
                          <span className="btn-content-nodes">Deploy Solution</span>
                        </a>
                        
                        <Link 
                          href={`/services/${slug}`}
                          className="btn btn-outline text-xs sm:text-sm uppercase tracking-wider font-bold"
                        >
                          <div className="btn-glow-layer" />
                          <span className="btn-content-nodes inline-flex items-center gap-1.5">
                            Explore Specialty <i className="fas fa-arrow-right text-[10px] text-[var(--accent-soft)]" />
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* DISPLAY INFRASTRUCTURE ROW */}
                    <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'} h-full w-full`}>
                      <div className="p-6 md:p-8 bg-[#07040f]/60 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden text-left hover:border-[var(--accent-soft)]/20 transition-all duration-500 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <span className="text-[9px] uppercase font-mono text-neutral-500 block mb-3 tracking-widest">
                          System Specifications Matrix
                        </span>
                        
                        <h4 className="text-base sm:text-lg font-bold text-white mb-2">Operational Intent</h4>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light mb-5">
                          Optimized for business models requiring maximum operational conversion speed, custom styling components, global multi-region CDN delivery, and iron-clad data security protocols.
                        </p>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div>
                            <span className="text-[9px] uppercase text-neutral-500 block tracking-wider mb-0.5">Architecture</span>
                            <span className="text-xs text-white font-mono font-medium">100% Custom Code</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-neutral-500 block tracking-wider mb-0.5">Visibility Layer</span>
                            <span className="text-xs text-[var(--accent-soft)] font-mono font-medium">SEO Structured Base</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </section>
            );
          })}
        </main>

        {/* ─── FINAL CLOSING ACTION FOOTER ─── */}
        <section className="py-20 bg-gradient-to-t from-[#040208] to-[#05030a] border-t border-white/5">
          <div className="container max-w-[800px] text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white">Ready to Engineer Absolute Authority?</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-[600px] mx-auto font-light leading-relaxed">
              Let's construct your project correctly using premium, high-converting digital logic. Connect with our development and strategy desks today.
            </p>
            <div className="pt-2">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent text-xs sm:text-sm uppercase tracking-wider font-bold">
                <div className="btn-glow-layer" />
                <span className="btn-content-nodes">Initiate Discovery Session</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
