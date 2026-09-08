import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import InteractiveCalculator from './InteractiveCalculator';

export const metadata: Metadata = {
  title: 'Website Cost Calculator India | 2026 Development Pricing Estimator',
  description: 'Estimate your corporate web application or small business website development cost and timeline in India instantly. Complete 2026 pricing guidelines for Kerala & worldwide platforms.',
  alternates: {
    canonical: 'https://enmate.in/tools/website-cost-calculator',
  },
  openGraph: {
    title: 'Website Cost Calculator India | Instant Price Estimator | EnMate',
    description: 'Calculate small business website prices, SEO breakdown fees, and technical engineering timelines transparently before hiring an agency.',
    url: 'https://enmate.in/tools/website-cost-calculator',
    type: 'website',
  }
};

export default function WebsiteCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EnMate Website Cost & Price Estimator India",
    "url": "https://enmate.in/tools/website-cost-calculator",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "description": "Calculate custom web application pricing, dynamic portal deployment, and corporate site development costs in India.",
    "creator": {
      "@type": "Organization",
      "name": "EnMate",
      "url": "https://enmate.in"
    }
  };

  return (
    <>
      <Script
        id="calculator-schema-matrix"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#05030a] text-[var(--text-main)] pt-32 pb-24 font-sans selection:bg-[var(--accent)] selection:text-white">
        <div className="container max-w-[1100px] space-y-12">
          
          {/* Breadcrumb Structure */}
          <nav className="text-xs text-[var(--text-muted)] flex items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            <span className="text-[var(--text-muted)]">Tools</span>
            <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            <span className="text-white font-medium">Website Cost Calculator</span>
          </nav>

          <header className="text-left space-y-3 max-w-[850px]">
            <span className="section-tag badge inline-block">Interactive Pricing Desk</span>
            <h1 className="text-3xl md:text-5xl font-bold gradient-text leading-none tracking-tight">
              Website Investment Matrix
            </h1>
            <p className="text-sm md:text-base font-medium text-[var(--accent-soft)] tracking-tight">
              Estimate Website Pricing & Development Timeline in India
            </p>
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed font-light pt-1">
              Compute custom application pricing tiers, small business budgets, and implementation roadmaps instantly. Every estimation layer runs on clean framework parameters to give you a transparent blueprint.
            </p>
          </header>

          {/* Interactive Client Component */}
          <InteractiveCalculator />

          {/* Crawler-Optimized Static Underlay */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/5 items-start">
            <main className="lg:col-span-8 space-y-12 text-left blog-rich-surface">
              <section id="pricing-calculation" className="space-y-4">
                <h2>How Website Pricing is Calculated</h2>
                <p>
                  Modern web engineering models scale directly with the underlying data architecture complexity. Instead of relying on templates that add unnecessary code bloat, clean frameworks compute fees relative to the hours required for manual interface layouts, mobile viewport optimization parameters, and custom API trigger bindings. 
                </p>
              </section>

              <section id="cost-factors" className="space-y-4">
                <h2>Factors Affecting Website Cost in 2026</h2>
                <p>
                  Determining the total operational overhead of an enterprise application relies heavily on five structural parameters: data strategy, interface scale count, dynamic module loops, asset performance tuning, and security layers.
                </p>
              </section>

              <section id="faq-matrix" className="space-y-6 pt-4">
                <div className="border-t border-white/5 pt-8">
                  <h2>Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-5 bg-[#07040f]/40 border border-white/5 rounded-xl space-y-2">
                    <h3 className="text-base font-bold text-white">Q. Why is custom-coded development better than using visual page builders?</h3>
                    <p className="text-xs md:text-sm text-[var(--text-muted)] font-light leading-relaxed">
                      Visual page builders add excessive script overhead, which slows down loading speeds and hurts search visibility. Writing custom code from scratch allows us to optimize performance metrics, maintain absolute design control, and create a highly scalable foundation.
                    </p>
                  </div>
                </div>
              </section>
            </main>
          </div>

        </div>
      </div>
    </>
  );
}
