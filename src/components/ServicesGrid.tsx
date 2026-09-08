'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ServiceItem } from '../lib/services-data';

interface ServicesGridProps {
  serviceList: [string, ServiceItem][];
}

export default function ServicesGrid({ serviceList }: ServicesGridProps) {
  
  // HARDWARE-ACCELERATED MOUSE GLOW + MAXIMUM RESPONSIVE 3D TILT
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(hover: none), (pointer: coarse)').matches) {
      return;
    }

    const cards = document.querySelectorAll<HTMLElement>('.service-grid-card-target');

    const handleCardMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = (x / rect.width) - 0.5;
      const percentY = (y / rect.height) - 0.5;

      // Injects maximum 3D responsiveness arrays directly to GPU processors
      card.style.setProperty('--tilt-x', `${percentY * -12}deg`);
      card.style.setProperty('--tilt-y', `${percentX * 12}deg`);
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleCardMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleCardMouseMove);
      card.addEventListener('mouseleave', handleCardMouseLeave);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleCardMouseMove);
        card.removeEventListener('mouseleave', handleCardMouseLeave);
      });
    };
  }, [serviceList]);

  // SCROLL REVEAL OBSERVERS
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [serviceList]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {serviceList.map(([slug, service]) => (
        <Link
          href={`/services/${slug}`}
          key={slug}
          className="service-grid-card-target tilt-grid-card reveal-on-scroll block relative overflow-hidden"
          style={{
            transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)',
          }}
        >
          <div className="curtain-panel" />
          
          <div className="card-content-wrapper p-6 md:p-8 space-y-4">
            <div className="service-card-icon-node w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300">
              <i className={`${service.icon} text-base text-[var(--accent-soft)]`} />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base md:text-lg font-bold text-white group-hover:text-[var(--accent-soft)] transition-colors">
                {service.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-light line-clamp-3">
                {service.overview}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-[var(--accent-soft)] uppercase tracking-wider">
              Learn More <i className="fas fa-arrow-right text-[10px]" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
