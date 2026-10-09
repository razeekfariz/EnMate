'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AIMessage, EnMatePackage } from '@/types/ai';
import { ROTATING_GREETINGS } from '@/lib/ai-data';
import {
  getStoredChatMessages,
  saveStoredChatMessages,
  clearStoredChatMessages,
  AI_UPDATE_EVENT
} from '@/lib/ai-storage';
import AIMessageRenderer from './AIMessageRenderer';
import PackageCard from './PackageCard';
import LeadCaptureModal from './LeadCaptureModal';

/**
 * Helper to derive readable page topic from pathname
 */
function getPageTopic(pathname: string): { topic: string; specificGreeting?: string } {
  if (pathname.includes('/admin')) {
    return { topic: 'EnMate Management Portal & Content Studio', specificGreeting: 'Management mode active! Need assistance optimizing articles, SEO, or configuring AI packages? ⚙️' };
  }
  if (pathname.includes('/tools/website-cost-calculator')) {
    return { topic: 'Website Cost Calculator & Project Estimator', specificGreeting: 'Need help estimating your website or software project budget? 🧮' };
  }
  if (pathname.includes('/tools')) {
    return { topic: 'Interactive Digital Tools & Calculators', specificGreeting: 'Exploring our digital tools? Ask me how we can build custom software for you! ⚡' };
  }
  if (pathname.includes('/products')) {
    return { topic: 'Digital Products & Software Solutions', specificGreeting: 'Exploring our software products? Ask me about features & pricing! 📦' };
  }
  if (pathname.includes('/software') || pathname.includes('/billing')) {
    return { topic: 'Custom Business Software & Billing Architecture', specificGreeting: 'Looking for custom billing software or business management systems? 💼' };
  }
  if (pathname.includes('/services/web-development')) {
    return { topic: 'Web Development & Custom Next.js Architecture', specificGreeting: 'Looking for a fast Next.js website or custom web app? 💻' };
  }
  if (pathname.includes('/services/video-editing')) {
    return { topic: 'Cinematic Video Editing & Motion Graphics', specificGreeting: 'Need scroll-stopping reels or cinematic brand videos? 🎬' };
  }
  if (pathname.includes('/services/graphic-design') || pathname.includes('/services/branding')) {
    return { topic: 'Visual Branding & Graphic Design', specificGreeting: 'Looking to elevate your brand visual identity or logo? 🎨' };
  }
  if (pathname.includes('/services/seo')) {
    return { topic: 'Technical SEO & Search Dominance', specificGreeting: 'Want to scale organic Google rankings for your business? 📈' };
  }
  if (pathname.includes('/services/social-media') || pathname.includes('/packages')) {
    return { topic: 'Social Media Management & Packages', specificGreeting: 'Interested in our popular ₹8,000 Social Media Package? 🚀' };
  }
  if (pathname.includes('/portfolio')) {
    return { topic: 'Portfolio & Case Studies', specificGreeting: 'Viewing our work? Ask me about turnaround times & pricing!' };
  }
  if (pathname.includes('/about')) {
    return { topic: 'About EnMate & Agency Vision', specificGreeting: 'Looking for the right digital growth partner for your brand? 🚀' };
  }
  if (pathname.includes('/best-digital-marketing-agency-in-kottakkal')) {
    return { topic: 'Kottakkal Digital Marketing Agency', specificGreeting: 'Looking for the best marketing partner in Kerala or worldwide? 🌟' };
  }
  if (pathname.includes('/blog')) {
    return { topic: 'EnMate Insights & Digital Growth Articles', specificGreeting: 'Reading our blog? Ask me how to implement these strategies for your brand! 📚' };
  }
  if (pathname.includes('/connect')) {
    return { topic: 'Connect & Contact EnMate Team', specificGreeting: 'Ready to start your project? Let me help you schedule a call with Razeek & the team! 📞' };
  }
  return { topic: 'EnMate Digital Architecture & Growth' };
}


export default function FloatingAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedLeadPkg, setSelectedLeadPkg] = useState<EnMatePackage | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Shared persistent messages state
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isDedicatedAiPage = pathname === '/ai';
  const pageInfo = getPageTopic(pathname || '/');

  // Build dynamic notification greeting list based on page context (strictly user-assistance oriented)
  const dynamicGreetings = [
    pageInfo.specificGreeting || ROTATING_GREETINGS[0],
    "Hi, I'm EnMate AI 👋",
    "How can I help grow your business today?",
    "Looking for the ₹8,000 Social Media Package? 🚀",
    "Need a custom Next.js website or web app? ⚡",
    "Have questions about our services? Ask me 💡"
  ];


  // 1. Load initial persistent chat messages on mount & sync across events
  useEffect(() => {
    setIsMounted(true);
    const initial = getStoredChatMessages();
    setMessages(initial);

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<AIMessage[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        setMessages(customEvent.detail);
      }
    };

    window.addEventListener(AI_UPDATE_EVENT, handleSync);
    return () => window.removeEventListener(AI_UPDATE_EVENT, handleSync);
  }, []);

  // 2. Notification Pop-in & Periodic Rotation
  useEffect(() => {
    if (isDedicatedAiPage || isOpen || !isMounted) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('enmate_ai_notification_dismissed');
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 1000 * 60 * 15) {
      return;
    }

    // Initial popup after 3.5 seconds
    const initialTimer = setTimeout(() => {
      setShowNotification(true);
    }, 3500);

    // Periodic rotation every 7 seconds
    const rotateInterval = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % dynamicGreetings.length);
    }, 7000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(rotateInterval);
    };
  }, [isDedicatedAiPage, isOpen, isMounted, pathname]);

  // 3. Auto-scroll: When AI replies, scroll smoothly to the BEGINNING / top of the reply message
  useEffect(() => {
    if (!isOpen) return;

    if (isThinking) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const msgEl = document.getElementById(`floating-msg-${lastMsg.id}`);

      if (msgEl && lastMsg.role === 'assistant') {
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (msgEl) {
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isThinking, isOpen]);

  const handleDismissNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotification(false);
    localStorage.setItem('enmate_ai_notification_dismissed', Date.now().toString());
  };

  const handleToggleChat = () => {
    setIsOpen(prev => !prev);
    setShowNotification(false);
  };

  const handleClearChat = () => {
    const fresh = clearStoredChatMessages();
    setMessages(fresh);
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveStoredChatMessages(updated);

    setInputQuery('');
    setIsThinking(true);

    try {
      const historyContext = updated
        .filter(m => !m.id.startsWith('msg-welcome'))
        .slice(-5)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyContext,
          source: 'floating_widget',
          currentPage: pathname,
          pageTitle: document.title || pageInfo.topic
        })
      });

      const data = await res.json();

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || "I'm ready to assist. What digital solutions does your business need?",
        timestamp: Date.now(),
        source: data.source,
        matchedPackage: data.matchedPackage,
        suggestions: data.suggestions || ['What packages are available?', 'Talk to EnMate team']
      };

      const finalMessages = [...updated, aiMsg];
      setMessages(finalMessages);
      saveStoredChatMessages(finalMessages);
    } catch (err) {
      const errorMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. You can explore EnMate's verified services or connect directly with our team at +91 80751 86078.",
        timestamp: Date.now(),
        suggestions: ['Connect via WhatsApp', 'Explore Services']
      };
      const finalMessages = [...updated, errorMsg];
      setMessages(finalMessages);
      saveStoredChatMessages(finalMessages);
    } finally {
      setIsThinking(false);
    }
  };

  const handleOpenLeadModal = (pkg: EnMatePackage) => {
    setSelectedLeadPkg(pkg);
    setIsLeadModalOpen(true);
  };

  if (isDedicatedAiPage || !isMounted) {
    return null;
  }

  const currentGreeting = dynamicGreetings[greetingIndex % dynamicGreetings.length];

  return (
    <>
      {/* Floating Container (Bottom-Right) */}
      <aside aria-label="EnMate AI Assistant" className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end select-none">
        
        {/* ─── 1. SLEEK PROFESSIONAL NOTIFICATION TOAST (Compact & High-Clarity) ─── */}
        {!isOpen && showNotification && (
          <div
            onClick={handleToggleChat}
            className="mb-2.5 mr-0.5 w-[255px] sm:w-[275px] p-2.5 sm:p-3 rounded-2xl bg-[#090515]/95 border border-[var(--accent)]/45 text-white shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_18px_rgba(207,4,102,0.3)] backdrop-blur-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] animate-slideUp relative group overflow-hidden"
          >
            {/* Ambient subtle glow background */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/15 rounded-full blur-xl pointer-events-none -z-10" />

            {/* Close / Dismiss Button */}
            <button
              onClick={handleDismissNotification}
              aria-label="Dismiss notification"
              className="absolute top-1.5 right-1.5 w-4.5 h-4.5 rounded-full bg-white/10 hover:bg-white/25 text-neutral-400 hover:text-white text-[9px] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 z-20"
            >
              <i className="fas fa-xmark" />
            </button>

            <div className="flex items-center gap-2.5">
              {/* EnMate Logo Avatar with pulsating neon status ring */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#0d061c] border border-white/20 p-1 flex items-center justify-center shadow-[0_0_10px_rgba(207,4,102,0.45)]">
                  <img
                    src="/logos/site-logo.png"
                    alt="EnMate AI"
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-[#090515]" />
                </span>
              </div>

              {/* Message Content */}
              <div className="flex-1 pr-2 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold text-white tracking-wide font-mono">
                    EnMate AI
                  </span>
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    Live
                  </span>
                </div>
                <p className="text-[11px] font-medium text-neutral-200 leading-snug line-clamp-2 transition-all duration-300">
                  {currentGreeting}
                </p>
                <span className="text-[9px] text-[var(--accent-soft)] font-mono mt-1 flex items-center gap-1 opacity-90 group-hover:underline">
                  <span>Chat now</span>
                  <i className="fas fa-chevron-right text-[7px]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── 2. COMPACT POPUP CHAT WINDOW ─── */}
        {isOpen && (
          <div className="mb-3 w-[92vw] sm:w-[410px] h-[570px] max-h-[82vh] rounded-3xl bg-[#090515]/98 border border-[var(--accent)]/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(207,4,102,0.3)] backdrop-blur-2xl flex flex-col overflow-hidden animate-scaleUp text-white">
            
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#140728] via-[#100520] to-[#090515] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Official EnMate Logo in Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-[#0c051a] border border-[var(--accent)]/70 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(207,4,102,0.5)]">
                    <img
                      src="/logos/site-logo.png"
                      alt="EnMate AI Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#090515] animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs tracking-tight text-white font-mono">
                      ENMATE AI
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      v2.0
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 truncate max-w-[170px] sm:max-w-[210px] block">
                    {pageInfo.topic}
                  </span>
                </div>
              </div>

              {/* Actions: Clear Chat, Full AI Studio, Minimize */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  aria-label="Clear Chat History"
                  className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-neutral-400 hover:text-white text-xs transition-all"
                >
                  <i className="fas fa-trash-can text-[10px]" />
                </button>

                {/* Full AI Page Link */}
                <Link
                  href="/ai"
                  onClick={() => setIsOpen(false)}
                  title="Open Fullscreen AI Studio"
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--accent)]/20 hover:bg-[var(--accent)]/35 border border-[var(--accent)]/40 text-[var(--accent-soft)] hover:text-white text-[11px] font-medium transition-all flex items-center gap-1.5"
                >
                  <i className="fas fa-expand text-[10px]" />
                  <span className="hidden sm:inline font-mono">Full /ai</span>
                </Link>

                {/* Minimize Button */}
                <button
                  onClick={handleToggleChat}
                  aria-label="Minimize Chat"
                  className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition-all text-xs"
                >
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>

            {/* Page Awareness Pill */}
            <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1.5 truncate">
                <i className="fas fa-compass text-[var(--accent-soft)]" />
                <span>Browsing: <strong className="text-neutral-200">{pathname}</strong></span>
              </span>
              <span className="text-neutral-500 font-mono shrink-0">Grounded AI</span>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`floating-msg-${msg.id}`}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} scroll-mt-4`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white rounded-br-none shadow-[0_4px_15px_rgba(207,4,102,0.3)]'
                        : 'bg-white/[0.06] border border-white/10 text-neutral-100 rounded-bl-none'
                    }`}
                  >
                    <AIMessageRenderer content={msg.content} />

                    {/* Matched Package Card (if any) */}
                    {msg.matchedPackage && (
                      <PackageCard
                        pkg={msg.matchedPackage}
                        compact
                        onOpenLeadModal={handleOpenLeadModal}
                      />
                    )}
                  </div>

                  {/* Suggestions Pills for latest assistant message */}
                  {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-1 max-w-[95%]">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="text-[10px] py-1 px-2.5 rounded-full bg-white/[0.04] hover:bg-[var(--accent)]/20 border border-white/10 hover:border-[var(--accent)]/40 text-neutral-300 hover:text-white transition-all text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* ─── Captivating Animated Thinking State ─── */}
              {isThinking && (
                <div className="flex items-start gap-2.5 animate-fadeIn">
                  <div className="w-7 h-7 rounded-xl bg-[#0c051a] border border-[var(--accent)]/50 p-1 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(207,4,102,0.4)]">
                    <img src="/logos/site-logo.png" alt="EnMate" className="w-full h-full object-contain animate-pulse" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-[var(--accent)]/30 text-xs text-neutral-200 rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-2 relative overflow-hidden">
                    {/* Glowing shimmer bar */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent animate-shimmer" />

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-[#8338ec] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-white tracking-wide">
                        EnMate AI is architecting solution...
                      </span>
                    </div>

                    <p className="text-[10px] text-neutral-400 font-light leading-snug">
                      Analyzing project goals, Next.js architecture & verified growth packages
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>


            {/* Input Bar */}
            <div className="p-3 bg-[#0c061a] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Ask about ${pageInfo.topic.split('&')[0].trim()}...`}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={isThinking}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-[var(--accent)] text-white text-xs outline-none transition-all placeholder:text-neutral-500 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isThinking}
                  aria-label="Send Message"
                  className="w-9 h-9 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-md shrink-0"
                >
                  <i className="fas fa-arrow-up text-xs" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ─── 3. FLOATING TRIGGER BUTTON (Featuring EnMate Logo) ─── */}
        <button
          onClick={handleToggleChat}
          aria-label={isOpen ? 'Close EnMate AI Assistant' : 'Open EnMate AI Assistant'}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#cf0466] via-[#81046a] to-[#ff2f92] p-[2px] shadow-[0_8px_32px_rgba(207,4,102,0.55),0_0_15px_rgba(131,56,236,0.3)] transform transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
        >
          {/* Inner Circle with Glass Backdrop & EnMate Logo */}
          <div className="w-full h-full rounded-full bg-[#090515]/95 flex items-center justify-center text-white backdrop-blur-md relative overflow-hidden p-2.5">
            
            {/* Subtle glow highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--accent)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {isOpen ? (
              <i className="fas fa-xmark text-lg text-white transition-transform duration-200" />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/logos/site-logo.png"
                  alt="EnMate AI"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(207,4,102,0.8)] group-hover:rotate-6 transition-transform duration-300"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090515] animate-pulse" />
              </div>
            )}
          </div>
        </button>
      </aside>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultPackage={selectedLeadPkg}
      />
    </>
  );
}
