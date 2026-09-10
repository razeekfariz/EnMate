'use client';

import React from 'react';
import { EnMatePackage } from '@/types/ai';

interface PackageCardProps {
  pkg: EnMatePackage;
  onOpenLeadModal?: (pkg: EnMatePackage) => void;
  compact?: boolean;
}

export default function PackageCard({ pkg, onOpenLeadModal, compact = false }: PackageCardProps) {
  const whatsappUrl = `https://wa.me/918075186078?text=${encodeURIComponent(
    `Hi EnMate 👋, I am interested in the ${pkg.package_name} (₹${pkg.price.toLocaleString('en-IN')}). Could we discuss this for my business?`
  )}`;

  return (
    <div className={`mt-3 mb-2 rounded-2xl bg-gradient-to-b from-[#16092b]/95 to-[#0c0517]/95 border border-[var(--accent)]/40 p-4 sm:p-5 shadow-[0_8px_30px_rgba(207,4,102,0.15)] text-white backdrop-blur-xl transition-all duration-300 hover:border-[var(--accent)] ${compact ? 'max-w-md' : 'max-w-lg'}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {pkg.badge && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white shadow-sm mb-1.5">
              {pkg.badge}
            </span>
          )}
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{pkg.package_name}</span>
          </h4>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xl sm:text-2xl font-black text-white flex items-baseline justify-end gap-1">
            <span className="text-xs text-[var(--accent-soft)] font-mono">₹</span>
            <span>{pkg.price.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 capitalize">
            / {pkg.billing_type}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-300 font-light mt-2 line-clamp-2">
        {pkg.description}
      </p>

      {/* Feature Checklist */}
      <div className="mt-3.5 space-y-1.5 pt-3 border-t border-white/10">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--accent-soft)] font-semibold">
          Package Inclusions:
        </div>
        <ul className="space-y-1.5">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="text-xs text-neutral-200 flex items-start gap-2">
              <span className="text-emerald-400 text-xs shrink-0 mt-0.5">
                <i className="fas fa-circle-check" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-90 text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
        >
          <i className="fab fa-whatsapp text-sm" />
          <span>Connect on WhatsApp</span>
        </a>

        {onOpenLeadModal && (
          <button
            onClick={() => onOpenLeadModal(pkg)}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          >
            <i className="fas fa-paper-plane text-[10px] text-[var(--accent-soft)]" />
            <span>Talk to EnMate</span>
          </button>
        )}
      </div>
    </div>
  );
}
