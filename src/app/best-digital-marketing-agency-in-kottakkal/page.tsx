'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function KottakkalLocalPage() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLElement | null>(null);

  const toggleMenu = () => setIsMenuOpen(prevState => !prevState);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20👋,%20I%20found%20EnMate%20on%20Google.%20We%20need%20the%20best%20digital%20marketing%20services%20in%20Kottakkal.";

  return (
    <div className="min-h-screen w-full bg-cover bg-fixed bg-center bg-no-repeat bg-[url('/images/bg-images/home-mobile-bg.webp')] md:bg-[url('/images/bg-images/home-lap-bg.webp')]">
      <div className="min-h-screen w-full bg-gradient-to-b from-[#05030a]/45 via-[#05030a]/30 to-[#0b0410]/45">

        {/* Header Link Tracking System */}
        <header className="main-header" ref={menuRef}>
          <div className="container nav-flex">
            <Link href="/" className="logo-container">
              <img src="/logos/site-logo.png" alt="EnMate Logo" className="logo-img" />
              <span className="logo-text font-anokha">EnMate</span>
            </Link>
            <nav className="navbar">
              <ul className={`nav-menu ${isMenuOpen ? 'active !flex' : 'hidden lg:flex'}`}>
                <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Home Base</Link></li>
                <li><a href="#services" onClick={() => setIsMenuOpen(false)}>Expertise</a></li>
                <li><a href="#process" onClick={() => setIsMenuOpen(false)}>Our Strategy</a></li>
                <li className="nav-cta-mobile flex justify-center mt-3">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-12 py-3" style={{ paddingLeft: '45px', paddingRight: '45px' }}>Connect Us</a>
                </li>
              </ul>
            </nav>
            <div className="header-actions">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-cta-desktop">Connect Us</a>
              <button className={`menu-toggle ${isMenuOpen ? 'is-active' : ''}`} onClick={toggleMenu} aria-label="Toggle Navigation">
                <span className="bar"></span><span className="bar"></span><span className="bar"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="pt-24">
          <section className="hero">
            <div className="container hero-grid">
              <div className="hero-content">
                <span className="badge reveal-fast font-mono text-[11px] sm:text-xs">Top Rated Agency Hub in Malappuram</span>
                <h1 className="flex flex-col items-start gap-1 sm:gap-2 pt-2">
                  <span className="font-anokha gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none inline-block pb-1">
                    EnMate
                  </span>
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                    Best Digital Marketing Agency in Kottakkal
                  </span>
                </h1>
                <p className="hero-subtitle text-sm sm:text-base md:text-lg font-semibold text-[var(--accent-soft)]">Premium Performance Frameworks Built for Local & Export Brands</p>
                <p className="hero-description text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed max-w-[650px]">
                  Based in Kottakkal, we empower local healthcare industries, hospitality properties, enterprise builders, and global export businesses with custom high-speed web apps, targeted lead acquisition systems, and data-driven organic ranking search marketing.
                </p>
                <div className="hero-btns pt-2">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-xs sm:text-sm uppercase tracking-wider font-bold">
                    <div className="btn-glow-layer" />
                    <span className="btn-content-nodes">Grow My Business</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}
