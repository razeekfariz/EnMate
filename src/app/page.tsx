'use client';

import React, { useEffect } from 'react';
import LiveScalingTrajectory from '../components/LiveScalingTrajectory';
import CinematicHeroEntrance from '../components/CinematicHeroEntrance';

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": "https://www.enmate.in/#organization",
        "name": "EnMate Digital Marketing Agency",
        "url": "https://www.enmate.in",
        "logo": "https://www.enmate.in/logos/site-logo.png",
        "image": "https://www.enmate.in/images/bg-images/home-lap-bg.webp",
        "description": "EnMate is a premium digital marketing agency based in Kottakkal, Kerala, serving clients worldwide. Specializing in custom website development, graphic design, SEO, social media marketing, and business automation.",
        "telephone": "+918075186078",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kottakkal",
          "addressRegion": "Kerala",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "10.9985",
          "longitude": "75.9926"
        },
        "sameAs": [
          "https://www.instagram.com/enmate.in",
          "https://www.linkedin.com/company/enmate",
          "https://www.facebook.com/enmate.in"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.enmate.in/#website",
        "url": "https://www.enmate.in",
        "name": "EnMate",
        "publisher": {
          "@id": "https://www.enmate.in/#organization"
        }
      }
    ]
  };

  useEffect(() => {
    // Only run on non-touch devices with fine cursor pointer
    if (typeof window === 'undefined' || window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>('.service-card, .tilt-grid-card, .btn');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (card.classList.contains('service-card') || card.classList.contains('tilt-grid-card')) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -7;
          const rotateY = ((x - centerX) / centerX) * 7;
          card.style.setProperty('--tilt-x', `${rotateX}deg`);
          card.style.setProperty('--tilt-y', `${rotateY}deg`);
        }
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
    }, { threshold: 0.15 });

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20👋,%20I%20found%20EnMate%20online.%20I%20want%20to%20scale%20our%20business%20with%20the%20best%20digital%20marketing%20services.";

  return (
    <div className="w-full bg-cover bg-fixed bg-center bg-no-repeat bg-[url('/images/bg-images/home-mobile-bg.webp')] md:bg-[url('/images/bg-images/home-lap-bg.webp')] font-sans selection:bg-[var(--accent)] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="w-full bg-gradient-to-b from-[#05030a]/55 via-[#05030a]/50 to-[#0b0410]/65">

        <main>
          {/* ─── 1. CINEMATIC FIRST-VIEWPORT OPENING & HERO SECTION ─── */}
          <CinematicHeroEntrance whatsappUrl={whatsappUrl} />

          {/* ─── SIGNATURE LIVE SCALING TRAJECTORY EXPERIENCE ─── */}
          <LiveScalingTrajectory />

          {/* ─── 2. SERVICES MATRIX SECTION ─── */}
          <section id="services" className="services-section py-14 md:py-20">
            <div className="container">
              <div className="text-left mb-10 md:mb-14 reveal-on-scroll space-y-2 max-w-[800px]">
                <span className="section-tag font-mono text-[10px]">Our Services</span>
                <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">Digital Solutions Built to Grow Modern Businesses</h2>
                <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed font-light pt-1">
                  From custom web development and brand identity to performance advertising, workflow automation, and cinematic video, EnMate delivers end-to-end solutions that build authority and drive revenue.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {[
                  { icon: 'fa-laptop-code', title: 'Website Development', desc: 'Custom business websites, web applications, and landing pages built for high speed, conversion, and scalability.' },
                  { icon: 'fa-palette', title: 'Branding & Graphic Design', desc: 'Visual identity systems, logos, packaging, and marketing collateral that set your brand apart with a premium look.' },
                  { icon: 'fa-chart-line', title: 'Digital Marketing & Growth', desc: 'Social media management, SEO optimization, and data-driven ad campaigns focused on predictable client acquisition.' },
                  { icon: 'fa-video', title: 'Video & Creative Production', desc: 'Cinematic promotional video ads, social reels, and dynamic motion graphics designed for maximum engagement.' },
                  { icon: 'fa-diagram-project', title: 'Business Systems & Portals', desc: 'Custom employee portals, internal CRM workflows, and automation structures engineered to streamline business operations.' },
                  { icon: 'fa-globe', title: 'Search Authority & Support', desc: 'Google Business Profile ranking, organic SEO dominance, and dedicated technical maintenance to keep you ahead.' }
                ].map((srv, i) => (
                  <div 
                    key={i} 
                    className="service-card reveal-on-scroll text-left" 
                    style={{ 
                      animationDelay: `${0.05 * (i + 1)}s`,
                      transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)'
                    }}
                  >
                    <div className="curtain-panel" />
                    <div className="card-content p-5 space-y-2.5">
                      <div className="icon w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xs text-[var(--accent-soft)]">
                        <i className={`fas ${srv.icon}`}></i>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{srv.title}</h3>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">{srv.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── 3. EXECUTION FRAMEWORK ─── */}
          <section id="process" className="process-advanced py-14">
            <div className="container">
              <div className="process-wrapper reveal-on-scroll text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="process-left lg:col-span-4 space-y-1">
                  <span className="section-tag font-mono text-[10px]">How We Execute</span>
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">Our 3-Step Execution Framework</h2>
                </div>
                
                <div className="process-right lg:col-span-8 flex flex-col md:grid md:grid-cols-3 gap-5">
                  <div className="process-step border-l border-white/10 pl-5 space-y-1 h-full flex flex-col justify-start">
                    <span className="text-xs font-mono font-bold text-[var(--accent-soft)] tracking-wider block">01 / STRATEGY</span>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed">Audience search intent mapping, competitive analysis, and tactical conversion frameworks before writing a single line of code.</p>
                  </div>
                  <div className="process-step border-l border-white/10 pl-5 space-y-1 h-full flex flex-col justify-start">
                    <span className="text-xs font-mono font-bold text-[var(--accent-soft)] tracking-wider block">02 / DESIGN</span>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed">Crafting bespoke visuals, ultra-fast interfaces, and responsive layouts structured cleanly for frictionless customer journeys.</p>
                  </div>
                  <div className="process-step border-l border-white/10 pl-5 space-y-1 h-full flex flex-col justify-start">
                    <span className="text-xs font-mono font-bold text-[var(--accent-soft)] tracking-wider block">03 / GROWTH</span>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed">Deploying continuous SEO ranking signals, precision ad campaign funnels, and automated analytics to capture sustainable market share.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 4. SUMMARY SECTION ─── */}
          <section id="about-summary" className="py-14 md:py-20 relative overflow-hidden text-left">
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center reveal-on-scroll">
                <div className="lg:col-span-7 space-y-3">
                  <span className="section-tag font-mono text-[10px]">Who We Are</span>
                  <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">The Growth Engine Driving Modern Brands</h2>
                  <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-normal">
                    EnMate is a performance-focused digital marketing agency bridging local business authority in Kottakkal with scalable global reach. We construct tailored digital assets and marketing campaigns engineered to win market dominance.
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-light">
                    Our mission is simple: transform ambitious businesses into recognized leaders through rigorous optimization, elite design aesthetics, and total execution transparency.
                  </p>
                  <div className="pt-2">
                    <a href="/about" className="btn btn-outline text-xs sm:text-sm tracking-wider uppercase font-bold">
                      <div className="btn-glow-layer" />
                      <span className="btn-content-nodes inline-flex items-center gap-1.5">
                        Learn More About Us <i className="fas fa-arrow-right text-[10px] text-[var(--accent-soft)]"></i>
                      </span>
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                  <div className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-center space-y-1">
                    <span className="text-[var(--accent-soft)] text-xl md:text-2xl font-bold font-mono block">
                      4+
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider block">Core Disciplines</span>
                  </div>
                  <div className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-center space-y-1">
                    <span className="text-[var(--accent-soft)] text-xl md:text-2xl font-bold font-mono block">
                      100%
                    </span>
                    <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider block">Custom Code</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 5. CTA SECTION ─── */}
          <section className="cta-section py-10">
            <div className="container reveal-on-scroll">
              <div className="cta-card p-6 md:p-10 bg-gradient-to-br from-[#07040f] via-[#cf0466]/5 to-[#07040f] border border-white/10 rounded-2xl text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-1 max-w-[600px]">
                    <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight">Ready to scale your brand with a premium digital agency?</h2>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-light leading-relaxed">Let’s engineer something powerful together with EnMate.</p>
                  </div>
                  <div className="shrink-0 flex justify-center">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent text-xs sm:text-sm uppercase tracking-wider font-bold">
                      <div className="btn-glow-layer" />
                      <span className="btn-content-nodes">Connect Us</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}
