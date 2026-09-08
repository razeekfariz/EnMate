'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  featured_image_width?: number;
  featured_image_height?: number;
  alt_text?: string;
  reading_time: number;
  published_at: string;
  categories?: { name: string } | null;
}

interface BlogListingClientProps {
  initialPosts: BlogPostSummary[];
}

export default function BlogListingClient({ initialPosts }: BlogListingClientProps) {
  
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.tilt-grid-card');

    const handleCardMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = (x / rect.width) - 0.5;
      const percentY = (y / rect.height) - 0.5;

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
  }, [initialPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [initialPosts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {initialPosts.map((post, i) => (
        <Link 
          href={`/blog/${post.slug}`} 
          key={post.id} 
          className="tilt-grid-card reveal-on-scroll block relative overflow-hidden text-left group"
          style={{
            transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)',
          }}
        >
          <div className="curtain-panel" />
          <div className="p-5 relative z-10 space-y-4 card-content-wrapper">
            
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-neutral-900 border border-white/5">
              <Image
                src={post.featured_image}
                alt={post.alt_text || post.title}
                fill
                priority={i < 3}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {post.categories && (
                <span className="absolute top-3 left-3 bg-black/80 text-[var(--accent-soft)] text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-md">
                  {post.categories.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)]">
              <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>{post.reading_time} Min Read</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-bold text-white group-hover:text-[var(--accent-soft)] transition-colors line-clamp-2 tracking-tight">
                {post.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 font-light">
                {post.excerpt}
              </p>
            </div>

            <span className="text-xs font-bold text-[var(--accent-soft)] uppercase tracking-wider inline-flex items-center gap-1 pt-1 font-mono">
              Read Full Intel <i className="fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
