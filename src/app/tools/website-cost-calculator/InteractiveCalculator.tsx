'use client';

import React, { useState, useEffect } from 'react';

export default function InteractiveCalculator() {
  const [businessType, setBusinessType] = useState<string>('corporate'); 
  const [pagesCount, setPagesCount] = useState<number>(5);
  const [hasBlog, setHasBlog] = useState<boolean>(false);
  const [hasSeo, setHasSeo] = useState<boolean>(false);
  const [hasEcom, setHasEcom] = useState<boolean>(false);
  const [hasBooking, setHasBooking] = useState<boolean>(false);

  const [costMin, setComputedMin] = useState<number>(0);
  const [costMax, setComputedMax] = useState<number>(0);
  const [timelineMin, setTimelineMin] = useState<number>(2);
  const [timelineMax, setTimelineMax] = useState<number>(4);

  useEffect(() => {
    let baselineValue = 15000;
    let baselineDays = 10;

    if (businessType === 'corporate') {
      baselineValue = 22000;
      baselineDays = 14;
    } else if (businessType === 'startup') {
      baselineValue = 35000;
      baselineDays = 21;
    } else if (businessType === 'landing') {
      baselineValue = 10000;
      baselineDays = 6;
    }

    const addedPages = Math.max(0, pagesCount - 1);
    baselineValue += addedPages * 1500;
    baselineDays += Math.ceil(addedPages * 0.4);

    if (hasBlog) { baselineValue += 6000; baselineDays += 3; }
    if (hasSeo) { baselineValue += 8000; baselineDays += 3; }
    if (hasEcom) { baselineValue += 18000; baselineDays += 6; }
    if (hasBooking) { baselineValue += 10000; baselineDays += 4; }

    const varianceOffset = Math.round((baselineValue * 0.15) / 1000) * 1000;
    setComputedMin(Math.max(8000, baselineValue - varianceOffset));
    setComputedMax(baselineValue + varianceOffset);

    setTimelineMin(Math.max(1, Math.floor(baselineDays / 7)));
    setTimelineMax(Math.ceil((baselineDays + 5) / 7));
  }, [businessType, pagesCount, hasBlog, hasSeo, hasEcom, hasBooking]);

  const triggerLeadWhatsAppRouter = () => {
    const integrations = [
      hasBlog && 'Blog Hub',
      hasSeo && 'Schema SEO',
      hasEcom && 'Cart Layer',
      hasBooking && 'Calendar Sync'
    ].filter(Boolean).join(', ') || 'Core UI Only';

    const dataReportString = `Hi EnMate, I just generated an application estimation blueprint:\n- Architecture Scope: ${businessType}\n- Pages Volume: ${pagesCount}\n- Integrations: ${integrations}\n- Projected Cost Range: ₹${costMin.toLocaleString('en-IN')} - ₹${costMax.toLocaleString('en-IN')}\n- Timeline Range: ${timelineMin}-${timelineMax} Weeks.\n\nI want to book my free consultation proposal session.`;
    
    window.open(`https://wa.me/918075186078?text=${encodeURIComponent(dataReportString)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT FORM FIELDS */}
      <div className="lg:col-span-7 bg-[#07040f]/80 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl">
        <div className="space-y-3 text-left">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">1. Business Framework Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'landing', label: 'Single Landing Page', desc: 'High-converting layout' },
              { id: 'corporate', label: 'Corporate Profile Site', desc: 'Multi-page architecture' },
              { id: 'startup', label: 'Custom App Infrastructure', desc: 'Complex relational databases' }
            ].map(opt => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setBusinessType(opt.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${businessType === opt.id ? 'bg-[var(--accent)]/10 border-[var(--accent-soft)] text-white' : 'bg-black/40 border-white/10 text-neutral-400 hover:border-white/20'}`}
              >
                <span className="text-xs font-bold block mb-1">{opt.label}</span>
                <span className="text-[10px] text-neutral-500 font-light leading-normal">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">2. Total Dedicated Layout Screens</label>
            <span className="text-xs font-mono font-bold text-[var(--accent-soft)] bg-[var(--accent)]/10 border border-[var(--accent-soft)]/20 px-3 py-0.5 rounded-md">{pagesCount} Pages</span>
          </div>
          <input type="range" min="1" max="30" value={pagesCount} onChange={(e) => setPagesCount(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-soft)]" />
        </div>

        <div className="space-y-3 text-left">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">3. Operational Modules & Structural Layers</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'blog', state: hasBlog, setter: setHasBlog, title: 'Dynamic Blog System', desc: 'Heading scraping capabilities' },
              { id: 'seo', state: hasSeo, setter: setHasSeo, title: 'Technical Schema SEO', desc: 'JSONLD semantic script hooks' },
              { id: 'ecom', state: hasEcom, setter: setHasEcom, title: 'E-Commerce Pipeline', desc: 'Database checkout components' },
              { id: 'booking', state: hasBooking, setter: setHasBooking, title: 'Real-time Booking Sync', desc: 'Automated calendar sync engine' }
            ].map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => item.setter(!item.state)}
                className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${item.state ? 'bg-white/5 border-[var(--accent-soft)] text-white' : 'bg-black/40 border-white/5 text-neutral-400 hover:border-white/10'}`}
              >
                <div>
                  <span className="text-xs font-bold block">{item.title}</span>
                  <span className="text-[10px] text-neutral-500 font-light">{item.desc}</span>
                </div>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[9px] ${item.state ? 'bg-[var(--accent-soft)] border-[var(--accent-soft)] text-black' : 'border-neutral-700'}`}>
                  {item.state && <i className="fas fa-check"></i>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT ASIDE RESULT PANEL */}
      <aside className="lg:col-span-5 bg-[#040208]/90 border border-white/5 rounded-3xl p-6 md:p-8 lg:sticky lg:top-24 shadow-2xl space-y-6 text-left">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--accent-soft)] block border-b border-white/5 pb-2">✨ Budget Allocation Projection</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Estimated Project Budget Span</span>
          <div className="text-2xl md:text-3xl font-bold text-white font-sans tracking-tight">
            ₹{costMin.toLocaleString('en-IN')} – ₹{costMax.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="space-y-1 border-t border-white/5 pt-4">
          <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">Estimated Engineering Timeline Span</span>
          <div className="text-lg md:text-xl font-bold text-[var(--accent-soft)] font-mono tracking-tight">
            {timelineMin} – {timelineMax} Weeks
          </div>
        </div>

        {/* Conversion CTA */}
        <div className="border-t border-white/5 pt-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Want a detailed proposal?</h4>
            <p className="text-xs text-[var(--text-muted)] font-light leading-relaxed">
              Book a free consultation session with EnMate's core strategy desk to refine your operational requirements list into a final quotation code blueprint.
            </p>
          </div>
          
          <button 
            type="button" 
            onClick={triggerLeadWhatsAppRouter} 
            className="btn btn-accent w-full text-xs uppercase tracking-wider font-bold py-3.5 block text-center shadow-lg"
          >
            <div className="btn-glow-layer" />
            <span className="btn-content-nodes inline-flex items-center justify-center gap-2">
              Book Free Consultation <i className="fab fa-whatsapp text-sm"></i>
            </span>
          </button>
        </div>

        <p className="text-[10px] text-neutral-600 font-light leading-relaxed border-t border-white/5 pt-4">
          This estimate is based on the information provided and is intended for planning purposes only. Actual project costs and timelines may vary depending on requirements, complexity, third-party integrations, content availability, revisions, and other project-specific factors. A detailed consultation is required for an exact quotation.
        </p>
      </aside>

    </div>
  );
}
