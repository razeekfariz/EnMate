'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  images: string[];
  client_name?: string;
  is_featured?: boolean;
  portfolio_categories?: {
    name: string;
    slug: string;
  } | null;
  currentImageIdx?: number;
  created_at?: string;
}

export default function UltimatePortfolioShowcase() {
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Lightbox Modal States
  const [activeLightboxProject, setActiveLightboxProject] = useState<PortfolioProject | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // 1. Core Data Retrieval Sync Engine
  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const [catRes, portRes] = await Promise.all([
          supabase.from('portfolio_categories').select('*').order('name', { ascending: true }),
          supabase.from('portfolio').select('*, portfolio_categories(name, slug)').order('created_at', { ascending: false })
        ]);

        if (catRes.data) setCategories(catRes.data as PortfolioCategory[]);
        if (portRes.data) setProjects(portRes.data as PortfolioProject[]);
      } catch (err) {
        console.error('Data pipeline exception:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowcaseData();
  }, []);

  // 2. Slow Cinematic Carousel Image Rotating Clock Loops (Runs every 3.5 seconds)
  useEffect(() => {
    if (loading || projects.length === 0) return;
    const interval = setInterval(() => {
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.images && project.images.length > 1) {
            const nextIdx = ((project.currentImageIdx || 0) + 1) % project.images.length;
            return { ...project, currentImageIdx: nextIdx };
          }
          return project;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [loading, activeTab, projects.length]);

  // 3. 3D Tilt Hover Optimization Engine for Premium Presentation Tiers
  useEffect(() => {
    if (loading) return;
    const cards = document.querySelectorAll<HTMLElement>('.portfolio-tilt-card');

    const handleMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--tilt-x', `${((y / rect.height) - 0.5) * -6}deg`);
      card.style.setProperty('--tilt-y', `${((x / rect.width) - 0.5) * 6}deg`);
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };

    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [loading, activeTab]);

  const filteredProjects = activeTab === 'all'
    ? projects
    : projects.filter(p => p.portfolio_categories?.slug === activeTab);

  const openLightbox = (project: PortfolioProject) => {
    setActiveLightboxProject(project);
    setLightboxIndex(0);
  };

  const closeLightbox = () => {
    setActiveLightboxProject(null);
  };

  const nextLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeLightboxProject) return;
    setLightboxIndex((prev) => (prev + 1) % activeLightboxProject.images.length);
  };

  const prevLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeLightboxProject) return;
    setLightboxIndex((prev) => (prev - 1 + activeLightboxProject.images.length) % activeLightboxProject.images.length);
  };

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    "name": "EnMate Digital Production Showroom",
    "description": "Premium case studies detailing high-performance web engineering, luxury brand design, visual packaging, and corporate customer acquisition architectures.",
    "url": "https://www.enmate.in/portfolio",
    "provider": {
      "@type": "Organization",
      "name": "EnMate",
      "url": "https://www.enmate.in"
    },
    "hasPart": filteredProjects.map(project => ({
      "@type": "CreativeWork",
      "name": project.title,
      "description": project.description,
      "image": project.images || [],
      "creator": { "@type": "Organization", "name": "EnMate" }
    }))
  };

  if (loading) return null;

  return (
    <div className="w-full bg-[#05030a] font-sans text-white selection:bg-[var(--accent)] selection:text-white">
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="w-full bg-gradient-to-b from-[#05030a] via-[#090514] to-[#05030a] pt-28 md:pt-36 pb-24 px-4 md:px-8">
        <div className="w-full max-w-[1400px] mx-auto space-y-8 md:space-y-12">
          
          {/* Header Typography Group */}
          <div className="text-left space-y-2 md:space-y-3 max-w-[700px]">
            <span className="section-tag font-mono text-[9px] md:text-[10px]">Our Production Showroom</span>
            <h1 className="text-3xl md:text-6xl font-bold gradient-text leading-tight tracking-tight uppercase">
              Proven Case Frameworks
            </h1>
            <p className="text-[11px] md:text-sm text-neutral-400 font-light leading-relaxed">
              We don't deal in conceptual promises; we deploy functional market infrastructure. Explore our luxury visual identities, high-speed architectures, and global conversion deployment grids.
            </p>
          </div>

          {/* Luxury Horizontal Slider Navigation Ribbon */}
          <div className="w-full border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory touch-pan-x">
              <button
                onClick={() => setActiveTab('all')}
                className={`btn snap-start px-5 py-2.5 rounded-full text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 border shrink-0 whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-[#cf0466] to-[#9c034e] text-white border-[#cf0466] shadow-md shadow-[#cf0466]/10'
                    : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:border-white/10 hover:text-white'
                }`}
              >
                All
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.slug)}
                  className={`btn snap-start px-5 py-2.5 rounded-full text-[10px] md:text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 border shrink-0 whitespace-nowrap ${
                    activeTab === cat.slug
                      ? 'bg-gradient-to-r from-[#cf0466] to-[#9c034e] text-white border-[#cf0466] shadow-md shadow-[#cf0466]/10'
                      : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Balanced Premium Production Framework Grid Layout */}
          {filteredProjects.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center font-mono text-[11px] text-neutral-500 italic border border-dashed border-white/5 rounded-2xl">
              <i className="fas fa-folder-open text-base mb-1 text-neutral-600" />
              <span>Staging pipeline active...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pt-2">
              {filteredProjects.map((project, index) => {
                const imgList = project.images || [];
                const activeImgIdx = project.currentImageIdx || 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => openLightbox(project)}
                    className="portfolio-tilt-card btn group relative w-full bg-[#07040f]/90 border border-white/5 hover:border-[var(--accent-soft)] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 shadow-lg flex flex-col text-left cursor-pointer"
                    style={{ transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateZ(0)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#cf0466]/0 to-[#cf0466]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Image Area Container with Slow Cinematic Opacity Crossfades */}
                    <div className="relative w-full overflow-hidden aspect-[4/3] bg-neutral-950 border-b border-white/5 pointer-events-none">
                      {imgList.length > 0 ? (
                        imgList.map((imgUrl, imgIdx) => (
                          <div 
                            key={imgIdx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                              imgIdx === activeImgIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                          >
                            <Image
                              src={imgUrl}
                              alt={`${project.title} canvas page ${imgIdx + 1}`}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              priority={index < 2}
                              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            />
                          </div>
                        ))
                      ) : (
                        <Image src="/images/placeholder.webp" alt="" fill className="object-cover" />
                      )}
                      
                      {project.is_featured && (
                        <span className="absolute top-2 left-2 z-20 bg-[var(--accent)] text-[8px] font-mono font-bold tracking-wider text-white px-1.5 py-0.5 rounded uppercase shadow-sm">
                          Featured
                        </span>
                      )}

                      {/* Stack Indicator Badge for Multi-Image Project Files */}
                      {imgList.length > 1 && (
                        <span className="absolute bottom-2 right-2 z-20 bg-black/70 backdrop-blur-md text-[8px] font-mono font-bold tracking-wider text-neutral-300 px-1.5 py-0.5 rounded border border-white/10 shadow-sm flex items-center gap-1">
                          <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                           ({activeImgIdx + 1}/{imgList.length})
                        </span>
                      )}
                    </div>

                    {/* Premium Description Block Content Stack */}
                    <div className="p-3 md:p-6 space-y-2 pointer-events-none flex-grow flex flex-col justify-between">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[8px] md:text-[10px] font-mono font-bold text-[#cf0466] uppercase tracking-wider block truncate">
                            {project.portfolio_categories?.name}
                          </span>
                          {project.client_name && (
                            <span className="hidden sm:inline text-[9px] font-mono text-neutral-500 font-light truncate max-w-[100px]">
                              @{project.client_name}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm md:text-xl font-bold text-white tracking-tight group-hover:text-[var(--accent-soft)] transition-colors duration-300 truncate">
                          {project.title}
                        </h3>
                        <p className="text-[10px] md:text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* 🎯 ULTRA-PREMIUM INTERACTIVE LIGHTBOX OVERLAY */}
      {activeLightboxProject && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8 transition-opacity duration-300 text-center select-none"
        >
          <button 
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors text-xs font-mono tracking-widest uppercase p-2 border border-white/5 hover:border-white/10 rounded-xl bg-white/[0.02]"
          >
            ✕ Close
          </button>

          <div className="w-full max-w-[1100px] flex flex-col items-center gap-6 relative" onClick={(e) => e.stopPropagation()}>
            
            {/* Main Fullscreen Display Panel Container */}
            <div className="relative w-full aspect-[4/3] max-h-[68vh] rounded-2xl overflow-hidden border border-white/5 bg-neutral-950/40 shadow-2xl">
              <Image 
                src={activeLightboxProject.images[lightboxIndex]}
                alt={activeLightboxProject.title}
                fill
                priority
                className="object-contain w-full h-full p-2 md:p-4 transition-transform duration-500"
              />

              {/* Slider Toggles */}
              {activeLightboxProject.images.length > 1 && (
                <>
                  <button 
                    onClick={prevLightboxImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-10 rounded-xl bg-black/60 border border-white/5 hover:bg-[var(--accent)] hover:border-[var(--accent-soft)] text-white flex items-center justify-center text-xs transition-all shadow-xl"
                  >
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button 
                    onClick={nextLightboxImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-10 rounded-xl bg-black/60 border border-white/5 hover:bg-[var(--accent)] hover:border-[var(--accent-soft)] text-white flex items-center justify-center text-xs transition-all shadow-xl"
                  >
                    <i className="fas fa-chevron-right" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Meta Data Descriptions readout */}
            <div className="text-center space-y-1.5 max-w-[620px] px-2">
              <h2 className="text-base md:text-2xl font-bold text-white tracking-wide uppercase">{activeLightboxProject.title}</h2>
              <p className="text-[11px] md:text-xs text-neutral-400 font-light leading-relaxed">{activeLightboxProject.description}</p>
              
              {activeLightboxProject.images.length > 1 && (
                <div className="pt-3 flex justify-center items-center gap-2">
                  {activeLightboxProject.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className={`h-1 rounded-full transition-all duration-300 ${i === lightboxIndex ? 'bg-[var(--accent)] w-5' : 'bg-white/10 w-1.5'}`}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
