'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AgencyConnectPortal() {
  
  useEffect(() => {
    const ring = document.getElementById('cursor-ring');
    const onMouseEnter = () => ring?.classList.add('cursor-hovered');
    const onMouseLeave = () => ring?.classList.remove('cursor-hovered');

    const elements = document.querySelectorAll('.custom-connect-link, .social-icon-node');
    elements.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      elements.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, []);

  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20,%20I%20found%20EnMate%20online.%20I%20want%20to%20scale%20our%20business%20with%20your%20digital%20marketing%20services.";
  const mailUrl = "mailto:contact@enmate.in?subject=Agency%20Inquiry%20-%20Scaling%20Operations";
  const phoneUrl = "tel:+918075186078";
  const reviewUrl = "https://g.page/r/CYquQCQPPkByEAI/review"; 

  return (
    <div className="min-h-screen bg-[#05030a] text-white font-sans px-4 flex items-center justify-center pt-28 pb-16 selection:bg-[var(--accent)] selection:text-white">
      
      {/* Background Ambient Spotlight Layer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] h-[500px] bg-gradient-to-b from-[#cf0466]/10 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Main Premium Card Container */}
      <div className="w-full max-w-[380px] bg-[#07040f]/90 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 text-center shadow-2xl relative z-10 space-y-7">
        
        {/* Profile Logo & Agency Branding Header */}
        <div className="space-y-4">
          <div className="relative w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-[#cf0466]/5 overflow-hidden">
            <Image 
              src="/logos/site-logo.png" 
              alt="EnMate Logo"
              width={40}
              height={40}
              priority
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-anokha gradient-text tracking-wide uppercase">EnMate</h1>
            <p className="text-xs font-mono font-bold text-[var(--accent-soft)] tracking-widest uppercase">Digital Marketing Agency</p>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed max-w-[320px] mx-auto">
            Engineering high-performance web solutions, luxury brand layouts, and globally optimized conversion pipelines
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-7 text-white/90">
          <a href="https://linkedin.com/company/enmate" target="_blank" rel="noopener noreferrer" className="social-icon-node text-lg hover:text-white transition-all transform hover:scale-110">
            <i className="fab fa-linkedin-in" />
          </a>
          <a href="https://www.instagram.com/enmate.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="social-icon-node text-lg hover:text-white transition-all transform hover:scale-110">
            <i className="fab fa-instagram" />
          </a>
          <a href={mailUrl} className="social-icon-node text-lg hover:text-[#cf0466] transition-all transform hover:scale-110">
            <i className="fas fa-envelope" />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="social-icon-node text-lg hover:text-green-400 transition-all transform hover:scale-110">
            <i className="fab fa-whatsapp" />
          </a>
        </div>

        {/* Links */}
        <div className="w-full space-y-3 pt-1">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="custom-connect-link w-full h-[54px] px-5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white transition-all duration-300 group"
          >
            <div className="w-6 flex items-center justify-start text-white text-base shrink-0">
              <i className="fab fa-whatsapp" />
            </div>
            <div className="flex-1 text-center pr-6 text-neutral-200 group-hover:text-white transition-colors">
              Book a Consultation
            </div>
          </a>

          <Link 
            href="/" 
            className="custom-connect-link w-full h-[54px] px-5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white transition-all duration-300 group"
          >
            <div className="w-6 flex items-center justify-start text-white text-base shrink-0">
              <i className="fas fa-globe" />
            </div>
            <div className="flex-1 text-center pr-6 text-neutral-200 group-hover:text-white transition-colors">
              Website
            </div>
          </Link>

          <a 
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="custom-connect-link w-full h-[54px] px-5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white transition-all duration-300 group"
          >
            <div className="w-6 flex items-center justify-start text-white text-base shrink-0">
              <i className="far fa-star" />
            </div>
            <div className="flex-1 text-center pr-6 text-neutral-200 group-hover:text-white transition-colors">
              Share your experience
            </div>
          </a>

          <a 
            href={phoneUrl} 
            className="custom-connect-link w-full h-[54px] px-5 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 rounded-2xl flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white transition-all duration-300 group"
          >
            <div className="w-6 flex items-center justify-start text-white text-base shrink-0">
              <i className="fas fa-phone-alt" />
            </div>
            <div className="flex-1 text-center pr-6 text-neutral-200 group-hover:text-white transition-colors">
              Contact Us
            </div>
          </a>
        </div>

        {/* Powered By Bottom Tagline */}
        <div className="pt-2 opacity-20 select-none">
          <span className="text-[9px] font-mono tracking-widest uppercase">Engineered By EnMate Matrix</span>
        </div>

      </div>
    </div>
  );
}
