'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CinematicHeroEntranceProps {
  whatsappUrl: string;
}

type Stage = 'distant' | 'travelling' | 'resolving' | 'settled';

export default function CinematicHeroEntrance({ whatsappUrl }: CinematicHeroEntranceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cinematic sequence stages
  const [stage, setStage] = useState<Stage>('distant');
  const [isInViewport, setIsInViewport] = useState<boolean>(true);

  useEffect(() => {
    // 1. Accessibility: Check for prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setStage('settled');
        return;
      }
    }

    // 2. User Scroll Handling: Immediately resolve to settled if visitor scrolls
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setStage('settled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Viewport Intersection Observer to sleep when out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // 4. Refined Cinematic Timeline: Forward -> Orbital Curve -> Deceleration -> Arrival
    // Stage 1 (0ms): Distant & Calm
    // Stage 2 (350ms): Forward Acceleration & Orbital Curve
    const t1 = setTimeout(() => {
      setStage((prev) => (prev === 'settled' ? 'settled' : 'travelling'));
    }, 350);

    // Stage 3 (1550ms): Orbital Deceleration & EnMate Content Emergence
    const t2 = setTimeout(() => {
      setStage((prev) => (prev === 'settled' ? 'settled' : 'resolving'));
    }, 1550);

    // Stage 4 (3000ms): Perfect Docking & Stable Hero Arrival
    const t3 = setTimeout(() => {
      setStage('settled');
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // 5. GPU-Accelerated 3D Orbital-Curve Galaxy Engine
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
    const starCount = isMobile ? 55 : 125;
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
        size: 0.8 + Math.random() * 1.8,
        hue: Math.random() > 0.38 ? 335 : Math.random() > 0.5 ? 275 : 210, // EnMate Magenta, Violet, Diamond White/Cyan
        baseAlpha: 0.35 + Math.random() * 0.65,
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

      // ─── MATHEMATICAL ORBITAL TRAJECTORY MODEL ───
      // Smooth progress parameter through the 3.0s opening arc
      const progress = Math.min(1, Math.max(0, elapsed / 3.0));
      const arcEnvelope = Math.sin(progress * Math.PI); // 0 at start -> 1 at midpoint -> 0 at arrival

      let travelSpeed = 24; // Default ambient speed
      let cameraX = 0;
      let cameraY = 0;
      let rollAngle = 0;
      let focalShiftX = 0;
      let focalShiftY = 0;

      if (stage !== 'settled' && elapsed < 3.0) {
        if (elapsed < 0.35) {
          // Phase 1: Quiet atmospheric entry
          travelSpeed = 50 + elapsed * 90;
          cameraX = Math.sin(progress * Math.PI * 0.7) * 40 * arcEnvelope;
          cameraY = 0;
          rollAngle = -0.008 * arcEnvelope;
        } else if (elapsed < 1.6) {
          // Phase 2: Acceleration into sweeping orbital arc
          const t = (elapsed - 0.35) / 1.25;
          const easeIn = t * t;
          travelSpeed = 80 + easeIn * 1450;

          // Wide orbital arc in X and subtle banking in Y
          cameraX = Math.sin(progress * Math.PI * 0.9) * 280 * arcEnvelope;
          cameraY = -Math.cos(progress * Math.PI * 0.8) * 110 * arcEnvelope + 35 * (1 - progress);
          rollAngle = -0.052 * arcEnvelope; // ~3.0 degree smooth banking into the curve
          focalShiftX = Math.sin(progress * Math.PI) * 45;
          focalShiftY = -Math.sin(progress * Math.PI * 0.9) * 22;
        } else if (elapsed < 2.9) {
          // Phase 3: Deceleration along the curve rounding into alignment
          const t = (elapsed - 1.6) / 1.3;
          const easeOut = 1 - Math.pow(1 - t, 3);
          travelSpeed = 1530 - easeOut * 1490;

          cameraX = Math.sin(progress * Math.PI * 0.9) * 280 * (1 - easeOut) * arcEnvelope;
          cameraY = -Math.cos(progress * Math.PI * 0.8) * 110 * (1 - easeOut) * arcEnvelope;
          rollAngle = -0.052 * (1 - easeOut) * arcEnvelope;
          focalShiftX = Math.sin(progress * Math.PI) * 45 * (1 - easeOut);
          focalShiftY = -Math.sin(progress * Math.PI * 0.9) * 22 * (1 - easeOut);
        } else {
          // Final docking
          travelSpeed = 35;
          cameraX = 0;
          cameraY = 0;
          rollAngle = 0;
        }
      } else {
        // Settled: Gentle organic ambient micro-drift
        travelSpeed = 22;
        cameraX = Math.sin(now * 0.0003) * 18;
        cameraY = Math.cos(now * 0.00025) * 10;
        rollAngle = Math.sin(now * 0.0002) * 0.004;
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
        if (travelSpeed > 220 && streakLength > 1.5) {
          // Curved luminous light streaks showing 3D orbital travel
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `hsla(${star.hue}, 92%, 76%, ${alpha * 0.92})`;
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
  }, [isInViewport, stage]);

  const isDistant = stage === 'distant';
  const isTravelling = stage === 'travelling';
  const isSettled = stage === 'settled';

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
        className={`absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#cf0466]/12 rounded-full blur-[140px] pointer-events-none z-0 transition-all duration-[2200ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          isDistant || isTravelling
            ? 'scale-75 translate-x-8 -translate-y-6 opacity-30'
            : 'scale-100 translate-x-0 translate-y-0 opacity-80'
        }`}
      />
      <div
        className={`absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-[#8338ec]/10 rounded-full blur-[130px] pointer-events-none z-0 transition-all duration-[2600ms] cubic-bezier(0.16, 1, 0.3, 1) ${
          isDistant || isTravelling
            ? 'scale-75 -translate-x-8 translate-y-6 opacity-20'
            : 'scale-100 translate-x-0 translate-y-0 opacity-70'
        }`}
      />

      {/* ─── 3. CINEMATIC ENMATE HERO CONTENT CONTAINER ─── */}
      <div className="container relative z-10">
        <div
          className={`max-w-[850px] space-y-4 transform transition-all duration-[1400ms] cubic-bezier(0.16, 1, 0.3, 1) ${
            isDistant
              ? 'translate-y-6 scale-[0.95] rotate-[-0.8deg] opacity-0 blur-[8px]'
              : isTravelling
              ? 'translate-y-4 scale-[0.97] rotate-[-0.4deg] opacity-40 blur-[4px]'
              : 'translate-y-0 scale-100 rotate-0 opacity-100 blur-0'
          }`}
        >
          {/* Location Badge */}
          <span
            className={`badge font-mono text-[11px] sm:text-xs inline-block transition-all duration-700 ${
              isDistant || isTravelling ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Based in Kottakkal, Kerala • Serving Worldwide
          </span>

          {/* Main EnMate Brand & Headline */}
          <h1 className="flex flex-col items-start gap-1 sm:gap-2">
            <span
              className={`font-anokha gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none inline-block pb-1 transition-all duration-1000 ${
                isDistant ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
              }`}
            >
              EnMate
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              {'Digital Marketing Agency'.split(' ').map((word, i) => (
                <span className="word-reveal-wrap" key={i}>
                  <span
                    className="word-reveal"
                    style={{
                      animationDelay: isSettled ? '0s' : `${0.2 + i * 0.08}s`,
                    }}
                  >
                    {word}&nbsp;
                  </span>
                </span>
              ))}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`hero-subtitle text-sm sm:text-base md:text-lg font-semibold text-[var(--accent-soft)] transition-all duration-700 ${
              isDistant || isTravelling ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            Strategic Growth & High-Performance Digital Solutions
          </p>

          {/* Description */}
          <p
            className={`hero-description text-sm sm:text-base text-[var(--text-muted)] font-light leading-relaxed max-w-[650px] transition-all duration-700 ${
              isDistant || isTravelling ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            We engineer high-converting web applications, luxury visual branding, and data-backed marketing funnels to capture audience demand and scale your business globally.
          </p>

          {/* Hero CTAs */}
          <div
            className={`hero-btns flex flex-wrap gap-3 pt-2 transition-all duration-700 ${
              isDistant || isTravelling ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
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
