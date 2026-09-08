'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

type TrajectoryMode = 'realtime' | 'velocity' | 'reach';

export default function LiveScalingTrajectory() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number; isHovered: boolean }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false,
  });

  // Real-Time Local Clock State
  const [timeState, setTimeState] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
    milliseconds: '00',
    period: 'AM',
    secondRatio: 0,
    minuteRatio: 0,
    hourRatio: 0,
    timeZoneName: 'LOCAL TIME',
    formattedDate: '',
  });

  const [activeMode, setActiveMode] = useState<TrajectoryMode>('realtime');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // 1. High-Precision Real-Time Clock Loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const rawMinutes = now.getMinutes();
      const rawSeconds = now.getSeconds();
      const rawMs = now.getMilliseconds();

      const period = rawHours >= 12 ? 'PM' : 'AM';
      const hours12 = rawHours % 12 || 12;

      const hours = String(hours12).padStart(2, '0');
      const minutes = String(rawMinutes).padStart(2, '0');
      const seconds = String(rawSeconds).padStart(2, '0');
      const milliseconds = String(Math.floor(rawMs / 10)).padStart(2, '0');

      // Continuous rotation ratios for smooth radar sweep
      const secondRatio = (rawSeconds + rawMs / 1000) / 60;
      const minuteRatio = (rawMinutes + secondRatio) / 60;
      const hourRatio = (hours12 + minuteRatio) / 12;

      let timeZoneName = 'LOCAL';
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        timeZoneName = tz.split('/').pop()?.replace('_', ' ').toUpperCase() || 'LOCAL';
      } catch {
        timeZoneName = 'UTC';
      }

      const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      setTimeState({
        hours,
        minutes,
        seconds,
        milliseconds,
        period,
        secondRatio,
        minuteRatio,
        hourRatio,
        timeZoneName,
        formattedDate,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 40); // 25fps fluid clock sync
    return () => clearInterval(interval);
  }, []);

  // 2. Viewport Observer to preserve CPU/GPU when scrolled out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 3. GPU-Accelerated Creative Living Growth Trajectory Engine
  useEffect(() => {
    if (!isVisible) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1));

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
    };

    window.addEventListener('resize', handleResize);

    // Dynamic stream particles
    interface StreamParticle {
      progress: number;
      speed: number;
      size: number;
      alpha: number;
      offsetY: number;
      hue: number;
    }

    const particleCount = 36;
    const particles: StreamParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        progress: Math.random(),
        speed: 0.0012 + Math.random() * 0.0022,
        size: 1.2 + Math.random() * 2.2,
        alpha: 0.3 + Math.random() * 0.7,
        offsetY: (Math.random() - 0.5) * 26,
        hue: Math.random() > 0.35 ? 330 : 275, // Magenta & Electric Violet
      });
    }

    let wavePhase = 0;
    let sparks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = [];
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Smooth mouse interpolation for magnetic deflection
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Trajectory Math: Exponential curve adjusted by mode
      const speedMultiplier = activeMode === 'velocity' ? 2.2 : activeMode === 'reach' ? 1.4 : 1.8;
      wavePhase += delta * speedMultiplier;

      const exponentPower = activeMode === 'velocity' ? 1.6 : activeMode === 'reach' ? 1.3 : 1.45;

      const getTrajectoryPoint = (t: number) => {
        const startX = width * 0.05;
        const endX = width * 0.95;
        const startY = height * 0.84;
        const endY = height * 0.16;

        const curveT = Math.pow(t, exponentPower);
        const baseX = startX + (endX - startX) * t;
        const baseY = startY - (startY - endY) * curveT;

        // Harmonic organic oscillations
        const wave1 = Math.sin(t * 7 - wavePhase * 1.6) * (11 * t);
        const wave2 = Math.cos(t * 12 + wavePhase * 2.2) * (5 * t);

        // Magnetic mouse deflection
        let mouseInfluenceY = 0;
        if (mouseRef.current.isHovered) {
          const dx = baseX - mouseRef.current.x;
          const dy = baseY - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = width * 0.3;
          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 28;
            mouseInfluenceY = -Math.sin((dist / maxDist) * Math.PI) * force;
          }
        }

        return {
          x: baseX,
          y: baseY + wave1 + wave2 + mouseInfluenceY,
        };
      };

      // ─── A. Ambient Elevation Tiers Grid ───
      const gridTiers = 3;
      ctx.lineWidth = 1;
      for (let i = 1; i <= gridTiers; i++) {
        const gridY = height * (0.22 + (i / (gridTiers + 1)) * 0.6);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(width * 0.05, gridY);
        ctx.lineTo(width * 0.95, gridY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tier Level indicator
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.font = `${Math.max(8, Math.floor(width * 0.016))}px monospace`;
        ctx.fillText(`LVL 0${4 - i} · ${(4 - i) * 33}% VELOCITY`, width * 0.05, gridY - 5);
      }

      // ─── B. Glow Gradient Fill Underneath Trajectory ───
      ctx.beginPath();
      const firstPoint = getTrajectoryPoint(0);
      ctx.moveTo(firstPoint.x, height);
      ctx.lineTo(firstPoint.x, firstPoint.y);

      const curveSegments = 50;
      for (let i = 1; i <= curveSegments; i++) {
        const pt = getTrajectoryPoint(i / curveSegments);
        ctx.lineTo(pt.x, pt.y);
      }

      const lastPoint = getTrajectoryPoint(1);
      ctx.lineTo(lastPoint.x, height);
      ctx.closePath();

      const fillGradient = ctx.createLinearGradient(0, height * 0.15, 0, height);
      fillGradient.addColorStop(0, 'rgba(207, 4, 102, 0.16)');
      fillGradient.addColorStop(0.5, 'rgba(131, 56, 236, 0.06)');
      fillGradient.addColorStop(1, 'rgba(5, 3, 10, 0)');
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // ─── C. Luminous Trajectory Glow Stroke ───
      ctx.beginPath();
      ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let i = 1; i <= curveSegments; i++) {
        const pt = getTrajectoryPoint(i / curveSegments);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(207, 4, 102, 0.35)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Precision Core Line
      const strokeGrad = ctx.createLinearGradient(firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);
      strokeGrad.addColorStop(0, 'rgba(207, 4, 102, 0.4)');
      strokeGrad.addColorStop(0.4, '#cf0466');
      strokeGrad.addColorStop(0.8, '#ff2d8a');
      strokeGrad.addColorStop(1, '#ffffff');

      ctx.beginPath();
      ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let i = 1; i <= curveSegments; i++) {
        const pt = getTrajectoryPoint(i / curveSegments);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // ─── D. Flowing Stream Particles ───
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          p.offsetY = (Math.random() - 0.5) * 24;
        }

        const pt = getTrajectoryPoint(p.progress);
        const px = pt.x;
        const py = pt.y + p.offsetY * (1 - p.progress * 0.7);
        const flare = Math.sin(p.progress * Math.PI) * p.alpha;

        ctx.beginPath();
        ctx.arc(px, py, p.size * (1 + p.progress * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${flare})`;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ─── E. Apex Ignition Spark & Pulse ───
      const apex = getTrajectoryPoint(0.995);

      const beaconRadius = (1 + Math.sin(wavePhase * 4)) * 10 + 8;
      ctx.beginPath();
      ctx.arc(apex.x, apex.y, beaconRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 45, 138, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(apex.x, apex.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff2d8a';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Apex Sparks
      if (Math.random() < 0.3) {
        sparks.push({
          x: apex.x,
          y: apex.y,
          vx: (Math.random() - 0.3) * 2.5 + 0.8,
          vy: (Math.random() - 0.6) * 3,
          life: 0,
          maxLife: 20 + Math.random() * 15,
          color: Math.random() > 0.5 ? '#ffffff' : '#ff2d8a',
        });
      }

      sparks = sparks.filter((s) => {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        const sparkAlpha = 1 - s.life / s.maxLife;

        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, sparkAlpha);
        ctx.fill();
        ctx.globalAlpha = 1;

        return s.life < s.maxLife;
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, activeMode]);

  // Pointer Interaction Handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mouseRef.current.targetX = (e.clientX - rect.left) * dpr;
    mouseRef.current.targetY = (e.clientY - rect.top) * dpr;
    mouseRef.current.isHovered = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.isHovered = false;
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  }, []);

  const whatsappUrl =
    'https://wa.me/918075186078?text=Hi%20👋,%20I%20saw%20EnMate%27s%20live%20scaling%20system.%20We%20want%20to%20scale%20our%20business%20growth%20right%20now.';

  // Calculate radar clock angles
  const secondDeg = timeState.secondRatio * 360;
  const minuteDeg = timeState.minuteRatio * 360;
  const hourDeg = timeState.hourRatio * 360;

  return (
    <section
      ref={sectionRef}
      id="live-scaling"
      className="relative py-10 md:py-16 overflow-hidden bg-gradient-to-b from-[#05030a] via-[#080413] to-[#05030a] border-y border-white/5 text-left select-none"
    >
      {/* Ambient background atmosphere glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[450px] h-[450px] bg-[#cf0466]/8 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-[#8338ec]/8 rounded-full blur-[110px] pointer-events-none z-0" />

      <div className="container relative z-10 space-y-6 md:space-y-8">
        
        {/* ─── COMPACT HEADER BADGE & TITLE ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-[650px]">
            <div className="flex items-center gap-2">
              <span className="badge font-mono text-[10px] sm:text-xs inline-flex items-center gap-2 border-[var(--accent-soft)]/30 bg-[var(--accent)]/10 text-[var(--accent-soft)]">
                <span className="w-2 h-2 rounded-full bg-[#ff2d8a] animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d8a] absolute" />
                REAL-TIME VELOCITY ENGINE
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline-block">
                KOTTAKKAL → GLOBAL
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Scaling Continuous Growth <span className="font-anokha gradient-text font-normal lowercase text-3xl sm:text-4xl md:text-5xl">Live.</span>
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYNC: 40MS LATENCY</span>
          </div>
        </div>

        {/* ─── SIDE-BY-SIDE ULTRA SECTION: CLOCK (LEFT) + CREATIVE GRAPH (RIGHT) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* ══════════════════════════════════════════════════
              LEFT SIDE: ULTRA ANIMATED CHRONOMETER CLOCK
              ══════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-[#090515]/85 border border-white/10 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group">
            {/* Background subtle radial flare */}
            <div className="absolute -top-16 -left-16 w-44 h-44 bg-[#cf0466]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-[#8338ec]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Clock HUD Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <i className="fas fa-satellite-dish text-[10px] text-[var(--accent-soft)] animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-soft)]">
                  CHRONO TELEMETRY
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {timeState.timeZoneName}
              </span>
            </div>

            {/* Center Chronograph Dial & Animated Analog/Radar Core */}
            <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-7 relative z-10">
              
              {/* Ultra High-Tech Radar Clock Face */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_20px_rgba(207,4,102,0.1)]" />
                
                {/* Dashed outer orbital ring */}
                <div className="absolute inset-1.5 rounded-full border border-dashed border-white/15 animate-[spin_60s_linear_infinite]" />
                
                {/* Gradient ring */}
                <div className="absolute inset-3 rounded-full border border-[#cf0466]/30" />

                {/* Dial Cardinal Ticks (12, 3, 6, 9) */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/60 rounded-full" />
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/30 rounded-full" />
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-1 bg-white/30 rounded-full" />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-1 bg-white/30 rounded-full" />

                {/* Radar Sweep Wedge Beam */}
                <div
                  className="absolute inset-3 rounded-full pointer-events-none transition-transform duration-75 ease-linear"
                  style={{
                    transform: `rotate(${secondDeg}deg)`,
                    background: 'conic-gradient(from -40deg, rgba(207, 4, 102, 0) 0deg, rgba(207, 4, 102, 0.35) 40deg, transparent 41deg)',
                  }}
                />

                {/* Clock Hands */}
                {/* Hour Hand */}
                <div
                  className="absolute w-1 h-10 bg-white/80 rounded-full origin-bottom bottom-1/2 left-[calc(50%-2px)] shadow-md"
                  style={{ transform: `rotate(${hourDeg}deg)` }}
                />

                {/* Minute Hand */}
                <div
                  className="absolute w-0.5 h-14 bg-white rounded-full origin-bottom bottom-1/2 left-[calc(50%-1px)] shadow-md"
                  style={{ transform: `rotate(${minuteDeg}deg)` }}
                />

                {/* Sweeping Second Hand with Glowing Tip */}
                <div
                  className="absolute w-[1.5px] h-16 bg-[#ff2d8a] origin-bottom bottom-1/2 left-[calc(50%-0.75px)] shadow-[0_0_8px_#ff2d8a]"
                  style={{ transform: `rotate(${secondDeg}deg)` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ff2d8a]" />
                </div>

                {/* Center Core Diode */}
                <div className="absolute w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#cf0466] to-[#ff2d8a] shadow-[0_0_12px_#ff2d8a] z-20 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>

              {/* Digital High-Contrast Chronometer Readout */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  {timeState.formattedDate}
                </span>

                {/* Digital Large Ticker */}
                <div className="flex items-baseline font-mono select-none">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline">
                    <span>{timeState.hours}</span>
                    <span className="text-[var(--accent-soft)] mx-0.5 animate-pulse">:</span>
                    <span>{timeState.minutes}</span>
                    <span className="text-[var(--accent-soft)] mx-0.5 animate-pulse">:</span>
                    <span className="text-white">{timeState.seconds}</span>
                  </div>
                  
                  <div className="flex flex-col items-start pl-2">
                    <span className="text-xs font-bold text-[var(--accent-soft)]">
                      .{timeState.milliseconds}
                    </span>
                    <span className="text-[9px] font-extrabold text-neutral-400 uppercase">
                      {timeState.period}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>CORE ACTIVE · NOMINAL</span>
                </div>
              </div>

            </div>

            {/* Bottom Clock Diagnostics Row */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 relative z-10 text-[10px] font-mono text-neutral-400">
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-neutral-500 block uppercase">LATITUDE</span>
                <span className="text-white font-bold">10.9985° N</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[9px] text-neutral-500 block uppercase">LONGITUDE</span>
                <span className="text-white font-bold">75.9926° E</span>
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════
              RIGHT SIDE: ANIMATED CREATIVE GRAPH STAGE
              ══════════════════════════════════════════════════ */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-6 rounded-3xl bg-[#070412]/90 border border-white/10 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group cursor-crosshair"
          >
            {/* Top Canvas Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/5 relative z-20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#cf0466] shadow-[0_0_10px_#cf0466]" />
                <span className="text-[11px] sm:text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Live Growth Trajectory
                </span>
              </div>

              {/* Mode Switcher Filter Tabs */}
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-full border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveMode('realtime')}
                  className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    activeMode === 'realtime'
                      ? 'bg-[var(--accent)] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Real-Time
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('velocity')}
                  className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    activeMode === 'velocity'
                      ? 'bg-[var(--accent)] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Velocity
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('reach')}
                  className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    activeMode === 'reach'
                      ? 'bg-[var(--accent)] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Capacity
                </button>
              </div>
            </div>

            {/* Dynamic Graph Canvas Canvas Display */}
            <div className="relative w-full h-[180px] sm:h-[220px] md:h-[240px] my-2 overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Apex Floating Coordinate Readout */}
              <div className="absolute top-2 right-2 pointer-events-none hidden sm:block text-right bg-black/60 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--accent-soft)] block font-bold">
                  APEX VECTOR T+{timeState.milliseconds}
                </span>
                <span className="text-xs font-bold font-mono text-white block">
                  VELOCITY: +340.8%
                </span>
              </div>

              {/* Subtle hover prompt */}
              <div className="absolute bottom-2 left-2 pointer-events-none hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-neutral-500 bg-black/40 px-2 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
                <i className="fas fa-wave-square text-[var(--accent-soft)] text-[8px]" />
                <span>Hover to deflect harmonic curve</span>
              </div>
            </div>

            {/* Bottom 3 Metrics Telemetry Cards & CTA */}
            <div className="space-y-3 pt-3 border-t border-white/5 relative z-20">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase text-neutral-400 block truncate">
                    Code Architecture
                  </span>
                  <div className="text-xs sm:text-sm font-bold font-mono text-white">
                    100% <span className="text-[9px] text-[var(--accent-soft)] font-normal">Custom</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase text-neutral-400 block truncate">
                    Edge Latency
                  </span>
                  <div className="text-xs sm:text-sm font-bold font-mono text-white">
                    &lt;42<span className="text-[9px] text-[var(--accent-soft)] font-normal">ms</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase text-neutral-400 block truncate">
                    Revenue Velocity
                  </span>
                  <div className="text-xs sm:text-sm font-bold font-mono text-white">
                    +340<span className="text-[9px] text-[var(--accent-soft)] font-normal">%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[10px] text-neutral-400 font-light hidden sm:inline-block">
                  Ready to deploy high-velocity digital scaling?
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary text-[10px] sm:text-xs uppercase tracking-wider font-bold py-2 px-3.5"
                  >
                    <div className="btn-glow-layer" />
                    <span className="btn-content-nodes">Deploy With Us</span>
                  </a>
                  <Link
                    href="/services"
                    className="btn btn-outline text-[10px] sm:text-xs uppercase tracking-wider font-bold py-2 px-3.5"
                  >
                    <div className="btn-glow-layer" />
                    <span className="btn-content-nodes">Services</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
