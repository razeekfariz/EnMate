'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const toggleMenu = () => setIsMenuOpen(prevState => !prevState);

  const whatsappUrl = "https://wa.me/918075186078?text=Hi%20👋,%20I%20found%20EnMate%20online.%20I%20want%20to%20scale%20our%20business%20with%20the%20best%20digital%20marketing%20services.";

  return (
    <header className="main-header">
      <div className="nav-flex">
        <Link href="/" className="logo-container">
          <img src="/logos/site-logo.png" alt="EnMate Logo" className="logo-img" />
          <span className="logo-text font-anokha">EnMate</span>
        </Link>

        <nav className="navbar">
          <ul className={`nav-menu ${isMenuOpen ? 'active !flex' : 'hidden lg:flex'}`}>
            <li><Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link href="/services" onClick={() => setIsMenuOpen(false)}>Services</Link></li>
            <li><Link href="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
            <li><Link href="/portfolio" onClick={() => setIsMenuOpen(false)}>Portfolio</Link></li>
            <li><Link href="/blog" onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
            <li><Link href="/tools" onClick={() => setIsMenuOpen(false)}>Tools</Link></li>
            <li className="nav-cta-mobile flex justify-center mt-4">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary text-center text-xs font-bold tracking-wider"
                style={{ paddingLeft: '45px', paddingRight: '45px', paddingTop: '12px', paddingBottom: '12px' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Connect Us
              </a>
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
  );
}
