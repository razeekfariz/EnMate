import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { services } from '@/lib/services-data';

export const revalidate = 3600;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const service = services[slug];

  if (!service) return {};

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `https://enmate.in/services/${slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `https://enmate.in/services/${slug}`,
      type: 'website',
      images: [{ url: '/logos/site-logo.png', width: 512, height: 512, alt: 'EnMate Branding Matrix' }]
    }
  };
}

export default async function IndividualServicePage({ params }: PageProps) {
  const { slug } = params;
  const service = services[slug];

  if (!service) notFound();

  const whatsappUrl = `https://wa.me/918075186078?text=Hi%20👋,%20I%20want%20to%20consult%20EnMate%20regarding%20${encodeURIComponent(service.title)}.`;

  return (
    <div className="min-h-screen bg-[#05030a] text-[var(--text-main)] pt-32 pb-24 font-sans selection:bg-[var(--accent)] selection:text-white">
      <div className="container max-w-[1100px] space-y-16 md:space-y-24">
        
        {/* ─── BREADCRUMBS & HERO INTRO ─── */}
        <header className="space-y-5 text-left">
          <nav className="text-xs text-[var(--text-muted)] flex items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            <Link href="/services" className="hover:text-white transition-colors">Our Services</Link>
            <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            <span className="text-white font-medium truncate max-w-[200px] md:max-w-none">{service.title}</span>
          </nav>

          <div className="space-y-3 max-w-[850px]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <i className={`${service.icon} text-xs text-[var(--accent-soft)]`}></i>
              </div>
              <span className="text-[11px] font-mono tracking-widest text-[var(--accent-soft)] uppercase font-bold">Premium Service Node</span>
            </div>
            <h1 className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-none">{service.title}</h1>
            <p className="text-sm md:text-base font-semibold text-[var(--accent-soft)] font-mono">{service.tagline}</p>
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed font-light pt-1">{service.overview}</p>
          </div>
        </header>

        {/* ─── CAPABILITY BENEFITS & ADVANTAGES ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          <div className="lg:col-span-4">
            <span className="section-tag">Value Matrix</span>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">Key Business Benefits</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 font-light leading-relaxed">Strategic outcomes engineered into this operational framework blueprint.</p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.benefits.map((benefit, idx) => (
              <div key={idx} className="p-4 bg-[#07040f]/60 border border-white/5 rounded-xl flex gap-3 items-start">
                <div className="w-4 h-4 rounded-full bg-[var(--accent)]/10 border border-[var(--accent-soft)]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="fas fa-check text-[8px] text-[var(--accent-soft)]"></i>
                </div>
                <p className="text-xs md:text-sm text-[var(--secondary)] leading-relaxed font-light">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── EXECUTION TIMELINE FRAMEWORK ─── */}
        <section className="space-y-8 text-left">
          <div className="max-w-[600px]">
            <span className="section-tag">Methodology</span>
            <h2 className="text-xl md:text-3xl font-bold text-white">Our Tactical Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.process.map((stepData, idx) => (
              <div key={idx} className="p-5 bg-[#07040f]/40 border border-white/5 rounded-xl flex flex-col justify-between hover:border-[var(--accent-soft)]/20 transition-colors">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-[var(--accent-soft)] tracking-wider block">{stepData.step}</span>
                  <p className="text-xs font-bold text-white font-mono uppercase">{stepData.step.split('. ')[1] || 'Execution Step'}</p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-light">{stepData.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── STACK ARCHITECTURE & TOOLS ─── */}
        <section className="p-6 md:p-8 bg-gradient-to-r from-[#07040f]/80 to-[#0b0617]/50 border border-white/5 rounded-2xl text-left flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-[450px] space-y-1">
            <span className="section-tag !mb-0">Infrastructure</span>
            <h3 className="text-lg md:text-xl font-bold text-white">Technologies Deployed</h3>
            <p className="text-[11px] text-[var(--text-muted)] font-light leading-relaxed">Premium toolkits selected for absolute response speed, layout precision, and reliability.</p>
          </div>
          <div className="flex flex-wrap gap-2 max-w-[500px]">
            {service.technologies.map((tech, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white font-mono tracking-wide">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* ─── CASE STUDIES & INTEL METRICS ─── */}
        <section className="space-y-6 text-left">
          <div>
            <span className="section-tag">Track Record</span>
            <h2 className="text-xl md:text-3xl font-bold text-white">Related Case Studies</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-[#07040f]/60 border border-white/5 rounded-xl space-y-3">
              <span className="text-[9px] uppercase font-mono tracking-wider text-[var(--accent-soft)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-md border border-[var(--accent-soft)]/20">Operational Scaling Case</span>
              <h4 className="text-sm font-bold text-white">Scaling Local Enterprise to Worldwide Footprint</h4>
              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">How we integrated custom deployment models to achieve sustained visibility gains and lower operations overhead across regional hub nodes.</p>
            </div>
            <div className="p-5 bg-[#07040f]/60 border border-white/5 rounded-xl space-y-3">
              <span className="text-[9px] uppercase font-mono tracking-wider text-[var(--accent-soft)] bg-[var(--accent)]/10 px-2.5 py-0.5 rounded-md border border-[var(--accent-soft)]/20">UI/UX Revamp Conversion Case</span>
              <h4 className="text-sm font-bold text-white">Premium Re-Engineering for Consumer Brand</h4>
              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">Replacing rigid templates with highly responsive, customized visual code structures to double organic transaction loops.</p>
            </div>
          </div>
        </section>

        {/* ─── FREQUENTLY ASKED QUESTIONS (FAQs) ─── */}
        <section className="space-y-8 text-left">
          <div className="max-w-[550px]">
            <span className="section-tag">FAQ Matrix</span>
            <h2 className="text-xl md:text-3xl font-bold text-white">Answers Shared with Partners</h2>
          </div>
          <div className="space-y-4 max-w-[850px]">
            {service.faqs.map((faq, idx) => (
              <div key={idx} className="p-5 bg-[#07040f]/60 border border-white/5 rounded-xl space-y-1">
                <h4 className="text-xs md:text-sm font-semibold text-white flex items-center gap-2">
                  <span className="text-xs font-mono text-[var(--accent-soft)] font-bold">Q.</span> {faq.q}
                </h4>
                <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed pl-4 border-l border-white/10 mt-1">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── DYNAMIC CALL TO ACTION (CTA) ─── */}
        <section className="pt-4">
          <div className="p-6 md:p-12 bg-gradient-to-br from-[#07040f] via-[#cf0466]/5 to-[#07040f] border border-white/10 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-[650px] mx-auto">
              <span className="section-tag !mb-1">Initiate Growth Integration</span>
              <h2 className="text-xl md:text-3xl font-bold text-white">Ready to Deploy This Specialty?</h2>
              <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
                Connect with our strategy desk immediately to map your technical requirements, secure custom project timelines, and request a detailed operational quote.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 justify-center">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent text-xs uppercase tracking-wider font-bold">
                  <div className="btn-glow-layer" />
                  <span className="btn-content-nodes">Get Proposal & Quote</span>
                </a>
                <Link href="/services" className="btn btn-outline text-xs uppercase tracking-wider font-bold">
                  <div className="btn-glow-layer" />
                  <span className="btn-content-nodes">View Other Frameworks</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
