'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <span className="font-anokha footer-logo">EnMate</span>
          <p>EnMate – Premium performance growth structures and full-stack system software solutions serving clients locally and worldwide.</p>
          <p className="footer-global">Location: Kottakkal, Kerala, India 🇮🇳 | Globally Distributed 🌍</p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            <i className="fas fa-envelope mr-2 text-[var(--accent-soft)]"></i> contact@enmate.in<br />
            <i className="fas fa-phone mr-2 text-[var(--accent-soft)]"></i> +91 80751 86078
          </p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/enmate.in" target="_blank" rel="noopener noreferrer" className="remove-link-underline" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/company/enmate" target="_blank" rel="noopener noreferrer" className="remove-link-underline" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://www.youtube.com/@enmate.official" target="_blank" rel="noopener noreferrer" className="remove-link-underline" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        
        <div className="footer-nav">
          <h6>Core Operations</h6>
          <ul className="footer-links">
            <li><Link href="/services">Digital Marketing</Link></li>
            <li><Link href="/services">SEO Optimization</Link></li>
            <li><Link href="/services">Web Architecture</Link></li>
          </ul>
        </div>
        
        <div className="footer-nav">
          <h6>Company Info</h6>
          <ul className="footer-links">
            <li><Link href="/">Home Base</Link></li>
            <li><Link href="/about">Our Team</Link></li>
            <li><Link href="/blog">Our Publications</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="copyright">
        &copy; {new Date().getFullYear()} <span className="font-anokha">EnMate</span> Digital Marketing Agency. All rights reserved.
      </div>
    </footer>
  );
}
