'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CinematicHeroEntranceProps {
  whatsappUrl: string;
}

export default function CinematicHeroEntrance({ whatsappUrl }: CinematicHeroEntranceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isInViewport, setIsInViewport] = useState<boolean>(true);

  useEffect(() => {
    // 1. Accessibility: Check for prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setIsLoaded(true);
        return;
      }
    }

    // 2. Immediate continuous entrance trigger
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    // 3. Viewport Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // 4. GPU-Accelerated 3D Continuous Space Rounding Camera Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * Math.min(window.devicePixelRatio || 1, 1.5));
    let height = (canvas.height = canvas.offsetHeight * Math.min(window.devicePixelRatio || 1, 1.5));

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
    };

    window.addEventListener('resize', handleResize);

    // 3D Star Particle Structure
    interface Star3D {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      prevRx: number;
      prevRy: number;
      size: number;
      hue: number;
      baseAlpha: number;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const starCount = isMobile ? 65 : 140;
    const maxZ = 1300;
    const stars: Star3D[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2600,
        y: (Math.random() - 0.5) * 1800,
        z: Math.random() * maxZ,
        prevZ: Math.random() * maxZ,
        prevRx: 0,
        prevRy: 0,
        size: 0.9 + Math.random() * 1.9,
        hue: Math.random() > 0.38 ? 335 : Math.random() > 0.5 ? 275 : 210, // EnMate Magenta, Violet, Diamond White/Cyan
        baseAlpha: 0.4 + Math.random() * 0.6,
      });
    }

    const startTime = performance.now();
    let lastTime = performance.now();
    const fov = 340;

    const render = (now: number) => {
      if (!isInViewport) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const elapsed = (now - startTime) / 1000;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.46;

      // ─── CONTINUOUS SPACE ROUNDING CAMERA TRAJECTORY ───
      // Flight Duration: 2.6 seconds continuous sweep
      const flightDuration = 2.6;
      const progress = Math.min(1, Math.max(0, elapsed / flightDuration));

      let travelSpeed = 22;
      let cameraX = 0;
      let cameraY = 0;
      let rollAngle = 0;
      let focalShiftX = 0;
      let focalShiftY = 0;

      if (progress < 1) {
        // Continuous smooth sinusoidal transition (zero abrupt jerks)
        const smoothT = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth S-curve 0 -> 1
        const arcWave = Math.sin(progress * Math.PI); // Envelope 0 -> 1 -> 0

        // Continuous orbital velocity curve
        travelSpeed = 24 + arcWave * 680 * (1 - progress * 0.6);

        // Continuous rounding camera swoops in space
        cameraX = Math.sin(smoothT * Math.PI * 0.85) * 230 * arcWave;
        cameraY = -Math.cos(smoothT * Math.PI * 0.8) * 80 * arcWave + 25 * (1 - smoothT);
        rollAngle = -0.042 * arcWave; // ~2.4 degree smooth space banking
        focalShiftX = Math.sin(smoothT * Math.PI) * 35 * arcWave;
        focalShiftY = -Math.sin(smoothT * Math.PI * 0.9) * 18 * arcWave;
      } else {
        // Continuous tranquil ambient drift in space
        travelSpeed = 22;
        cameraX = Math.sin(now * 0.0003) * 16;
        cameraY = Math.cos(now * 0.00025) * 8;
        rollAngle = Math.sin(now * 0.0002) * 0.003;
      }

      const activeFocalX = cx + focalShiftX;
      const activeFocalY = cy + focalShiftY;

      // Cosine and Sine for Camera Roll / Banking Matrix
      const cosR = Math.cos(rollAngle);
      const sinR = Math.sin(rollAngle);

      // Render 3D Orbit-Transformed Galaxy Particles
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.prevZ = star.z;
        star.z -= travelSpeed * dt * 2.2;

        if (star.z <= 1) {
          star.z = maxZ;
          star.prevZ = maxZ;
          star.x = (Math.random() - 0.5) * 2600;
          star.y = (Math.random() - 0.5) * 1800;
          star.prevRx = star.x;
          star.prevRy = star.y;
        }

        // Apply Camera Position Offset & Roll Rotation
        const dx = star.x - cameraX;
        const dy = star.y - cameraY;
        const rx = dx * cosR - dy * sinR;
        const ry = dx * sinR + dy * cosR;

        // Current 2D Screen Projection
        const k = fov / star.z;
        const px = activeFocalX + rx * k;
        const py = activeFocalY + ry * k;

        if (px < -140 || px > width + 140 || py < -140 || py > height + 140) {
          star.z = maxZ;
          star.prevZ = maxZ;
          continue;
        }

        // Previous 2D Screen Projection for Optical Flow Streak
        const prevK = fov / star.prevZ;
        const prevPx = activeFocalX + (star.prevRx || rx) * prevK;
        const prevPy = activeFocalY + (star.prevRy || ry) * prevK;

        star.prevRx = rx;
        star.prevRy = ry;

        const depthRatio = 1 - star.z / maxZ;
        const alpha = Math.min(1, depthRatio * 1.5 * star.baseAlpha);
        const streakLength = Math.hypot(px - prevPx, py - prevPy);

        ctx.beginPath();
        if (travelSpeed > 180 && streakLength > 1.2) {
          // Curved luminous light streaks showing 3D space travel
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `hsla(${star.hue}, 92%, 76%, ${alpha * 0.9})`;
          ctx.lineWidth = Math.max(1, star.size * (1 + depthRatio * 0.8));
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          // Floating photon nodes
          ctx.arc(px, py, Math.max(0.7, star.size * depthRatio * 1.35), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${star.hue}, 92%, 76%, ${alpha})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isInViewport]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="hero relative pt-28 md:pt-36 pb-12 md:pb-20 text-left overflow-hidden select-none"
    >
      {/* ─── 1. CINEMATIC 3D ORBITAL GALAXY CANVAS ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-opacity duration-1000 ${
            isInViewport ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* ─── 2. ATMOSPHERIC AURORA & BRAND NEBULA BACKLIGHT ─── */}
      <div
        className={`absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#cf0466]/12 rounded-full blur-[140px] pointer-events-none z-0 transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          isLoaded
            ? 'scale-100 translate-x-0 translate-y-0 opacity-80'
            : 'scale-90 -translate-y-4 opacity-30'
        }`}
      />
      <div
        className={`absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-[#8338ec]/10 rounded-full blur-[130px] pointer-events-none z-0 transition-all duration-[2200ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          isLoaded
            ? 'scale-100 translate-x-0 translate-y-0 opacity-70'
            : 'scale-90 translate-y-4 opacity-20'
        }`}
      />

      {/* ─── 3. CRISP & CONTINUOUS PROFESSIONAL HERO CONTENT ─── */}
      <div className="container relative z-10">
        <div className="max-w-[850px] space-y-4">
          
          {/* Location Badge */}
          <div
            className={`transition-all duration-700 ease-out transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <span className="badge font-mono text-[11px] sm:text-xs inline-block">
              Based in Kottakkal, Kerala • Serving Worldwide
            </span>
          </div>

          {/* Main EnMate Brand & Headline */}
          <h1 className="flex flex-col items-start gap-1 sm:gap-2">
            <span
              className={`font-anokha gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none inline-block pb-1 transition-all duration-700 delay-100 ease-out transform ${
                isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              EnMate
            </span>
            <span
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white transition-all duration-700 delay-200 ease-out transform ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Digital Marketing Agency
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`hero-subtitle text-sm sm:text-base md:text-lg font-semibold text-[var(--accent-soft)] transition-all duration-700 delay-300 ease-out transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Strategic Growth & High-Performance Digital Solutions
          </p>

          {/* Description */}
          <p
            className={`hero-description text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed max-w-[650px] transition-all duration-700 delay-400 ease-out transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            We engineer high-converting web applications, luxury visual branding, and data-backed marketing funnels to capture audience demand and scale your business globally.
          </p>

          {/* Hero CTAs */}
          <div
            className={`hero-btns flex flex-wrap gap-3 pt-2 transition-all duration-700 delay-500 ease-out transform ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary text-xs sm:text-sm uppercase tracking-wider font-bold"
            >
              <div className="btn-glow-layer" />
              <span className="btn-content-nodes">Connect Us</span>
            </a>
            <a
              href="/services"
              className="btn btn-outline text-xs sm:text-sm uppercase tracking-wider font-bold"
            >
              <div className="btn-glow-layer" />
              <span className="btn-content-nodes">Explore Services</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

