'use client';

import React, { useEffect } from 'react';

export default function WholeCursor() {
  useEffect(() => {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    const onGlobalMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      const target = e.target as HTMLElement | null;
      const hoveredTarget = target?.closest('.service-card, .tilt-grid-card, .value-card, .team-card, .btn') as HTMLElement | null;
      if (hoveredTarget) {
        const rect = hoveredTarget.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        hoveredTarget.style.setProperty('--mouse-x', `${lx}px`);
        hoveredTarget.style.setProperty('--mouse-y', `${ly}px`);
      }
    };

    const tickRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(tickRing);
    };

    const onMouseEnterLink = () => ring.classList.add('cursor-hovered');
    const onMouseLeaveLink = () => ring.classList.remove('cursor-hovered');

    window.addEventListener('mousemove', onGlobalMouseMove);
    const animId = requestAnimationFrame(tickRing);

    const refreshListeners = () => {
      document.querySelectorAll('a, button, .service-card, .tilt-grid-card, .btn, .value-card, .team-card').forEach(item => {
        item.removeEventListener('mouseenter', onMouseEnterLink);
        item.removeEventListener('mouseleave', onMouseLeaveLink);
        item.addEventListener('mouseenter', onMouseEnterLink);
        item.addEventListener('mouseleave', onMouseLeaveLink);
      });
    };

    refreshListeners();
    const interval = setInterval(refreshListeners, 1500);

    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      cancelAnimationFrame(animId);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" className="custom-cursor-dot" />
      <div id="cursor-ring" className="custom-cursor-ring" />
    </>
  );
}
