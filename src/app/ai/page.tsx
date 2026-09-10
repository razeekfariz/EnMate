'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AIMessage, EnMatePackage } from '@/types/ai';
import { VERIFIED_PACKAGES, SUGGESTED_QUERIES } from '@/lib/ai-data';
import {
  getStoredChatMessages,
  saveStoredChatMessages,
  clearStoredChatMessages,
  AI_UPDATE_EVENT
} from '@/lib/ai-storage';
import AIMessageRenderer from '@/components/ai/AIMessageRenderer';
import PackageCard from '@/components/ai/PackageCard';
import LeadCaptureModal from '@/components/ai/LeadCaptureModal';

export default function DedicatedAIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activePackages, setActivePackages] = useState<EnMatePackage[]>(VERIFIED_PACKAGES);
  const [selectedLeadPkg, setSelectedLeadPkg] = useState<EnMatePackage | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Load persistent shared messages on mount and subscribe to update events
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

  // 2. Fetch live active packages from API
  useEffect(() => {
    fetch('/api/ai/packages')
      .then(res => res.json())
      .then(data => {
        if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
          setActivePackages(data.packages);
        }
      })
      .catch(() => {
        // Fallback already set to VERIFIED_PACKAGES
      });
  }, []);

  // 3. Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isThinking) return;

    const userMessage: AIMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    saveStoredChatMessages(updated);

    setInputQuery('');
    setIsThinking(true);

    try {
      const historyContext = updated
        .filter(m => !m.id.startsWith('msg-welcome'))
        .slice(-6)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyContext,
          source: 'full_ai_page',
          currentPage: '/ai',
          pageTitle: 'EnMate AI Studio & Consultation'
        })
      });

      const data = await res.json();

      const aiResponse: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || "I'm here to help. What specific digital goals is your brand targeting?",
        timestamp: Date.now(),
        source: data.source,
        matchedPackage: data.matchedPackage,
        suggestions: data.suggestions || ['Explore other packages', 'Talk to EnMate team']
      };

      const finalMessages = [...updated, aiResponse];
      setMessages(finalMessages);
      saveStoredChatMessages(finalMessages);
    } catch (err) {
      const errorMsg: AIMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble reaching the network right now. You can view our verified services or connect with our team directly via WhatsApp at +91 80751 86078.",
        timestamp: Date.now(),
        suggestions: ['Connect on WhatsApp', 'View Website Development', 'View Social Media Services']
      };
      const finalMessages = [...updated, errorMsg];
      setMessages(finalMessages);
      saveStoredChatMessages(finalMessages);
    } finally {
      setIsThinking(false);
    }
  };

  const handleResetChat = () => {
    const fresh = clearStoredChatMessages();
    setMessages(fresh);
  };

  const handleOpenLeadModal = (pkg: EnMatePackage) => {
    setSelectedLeadPkg(pkg);
    setIsLeadModalOpen(true);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#040208] text-white pt-24 pb-16 px-4 md:px-8 selection:bg-[var(--accent)] selection:text-white relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-2/3 right-10 w-[450px] h-[450px] bg-[#8338ec]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* ─── 1. TOP HERO / BRAND BANNER (With EnMate Logo) ─── */}
        <header className="rounded-3xl bg-gradient-to-r from-[#0d061c]/95 via-[#130728]/95 to-[#090515]/95 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* EnMate Official Logo Badge */}
              <div className="relative shrink-0 mt-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0a0416] border border-[var(--accent)]/60 p-2.5 flex items-center justify-center shadow-[0_0_25px_rgba(207,4,102,0.4)]">
                  <img
                    src="/logos/site-logo.png"
                    alt="EnMate Logo"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(207,4,102,0.8)]"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#090515]" />
                </span>
              </div>

              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent-soft)]">
                    Official AI Consultant
                  </span>
                  <span className="text-xs font-mono text-neutral-400">• enmate.in/ai</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Synced with Widget
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span className="font-anokha gradient-text">EnMate</span> AI Studio
                </h1>
                
                <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl leading-relaxed">
                  Your intelligent digital partner for evaluating custom web architecture, high-impact content strategy, brand identity, and scalable growth packages.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleResetChat}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center gap-2"
              >
                <i className="fas fa-rotate-right text-xs" />
                <span>Clear History</span>
              </button>

              <a
                href={`https://wa.me/918075186078?text=${encodeURIComponent("Hi EnMate team 👋, I am using EnMate AI and would like to connect with a specialist.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(207,4,102,0.4)] transition-all flex items-center gap-2"
              >
                <i className="fab fa-whatsapp text-sm" />
                <span>Connect with Team</span>
              </a>
            </div>
          </div>
        </header>

        {/* ─── 2. MAIN WORKSPACE GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT CHAT STUDIO (8 cols on large screens) */}
          <div className="lg:col-span-8 flex flex-col h-[700px] max-h-[80vh] rounded-3xl bg-[#090515]/90 border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden relative">
            
            {/* Chat Studio Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-[#0c061a]/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0d061c] border border-[var(--accent)]/50 p-1 flex items-center justify-center shadow-md">
                  <img
                    src="/logos/site-logo.png"
                    alt="EnMate AI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Continuous Consultation Stream</span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Synced with floating mini widget
                  </span>
                </div>
              </div>

              {/* Quick Preset Selector */}
              <div className="hidden sm:flex items-center gap-1.5">
                {['All', 'Packages', 'Web Dev', 'Social Media', 'SEO & Growth'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => {
                      if (filter === 'Packages') handleSendMessage('What packages are available?');
                      else if (filter === 'Web Dev') handleSendMessage('Tell me about your Website Development services');
                      else if (filter === 'Social Media') handleSendMessage('Tell me about the ₹8,000 Social Media package');
                      else if (filter === 'SEO & Growth') handleSendMessage('How do you help businesses rank on Google and scale?');
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-mono bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white border border-white/5 transition-all"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>


            {/* Message Stream */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'EnMate AI'}
                    </span>
                    {msg.source && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[var(--accent-soft)] border border-white/5">
                        {msg.source === 'package_engine' ? '✨ Verified Package' : msg.source === 'knowledge' ? '✨ Verified Insight' : '✦ AI Consultant'}
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[92%] sm:max-w-[85%] p-4 sm:p-5 rounded-3xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white rounded-tr-none shadow-[0_4px_20px_rgba(207,4,102,0.3)]'
                        : 'bg-white/[0.05] border border-white/10 text-neutral-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <AIMessageRenderer content={msg.content} />

                    {/* Attached Package Card */}
                    {msg.matchedPackage && (
                      <div className="mt-4">
                        <PackageCard
                          pkg={msg.matchedPackage}
                          onOpenLeadModal={handleOpenLeadModal}
                        />
                      </div>
                    )}
                  </div>

                  {/* Suggestion prompt pills */}
                  {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && msg.id === messages[messages.length - 1]?.id && (
                    <div className="mt-3 flex flex-wrap gap-2 pl-2 max-w-full">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-xs py-1.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-[var(--accent)]/20 border border-white/10 hover:border-[var(--accent)]/50 text-neutral-300 hover:text-white transition-all text-left flex items-center gap-1.5"
                        >
                          <i className="fas fa-chevron-right text-[9px] text-[var(--accent-soft)]" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* ─── Captivating Animated Thinking State ─── */}
              {isThinking && (
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-xl bg-[#0c051a] border border-[var(--accent)]/50 p-1 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(207,4,102,0.4)]">
                    <img src="/logos/site-logo.png" alt="EnMate AI" className="w-full h-full object-contain animate-pulse" />
                  </div>
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-[var(--accent)]/30 text-xs text-neutral-200 rounded-tl-none shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-2 relative overflow-hidden max-w-md">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent animate-shimmer" />

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-[#8338ec] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-white tracking-wide">
                        EnMate AI is formulating custom strategy...
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                      Evaluating custom web architecture, conversion optimization & verified service catalog
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Chat Input Console */}
            <div className="p-4 bg-[#090515] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ask about EnMate services, packages, pricing, or leadership..."
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    disabled={isThinking}
                    className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/15 focus:border-[var(--accent)] text-white text-xs sm:text-sm outline-none transition-all placeholder:text-neutral-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isThinking}
                  aria-label="Send Message"
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 disabled:opacity-30 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(207,4,102,0.4)] shrink-0"
                >
                  <i className="fas fa-paper-plane text-xs" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDEBAR: ACTIVE PACKAGES & DIRECT ACTIONS (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Package Spotlight Box */}
            <div className="p-6 rounded-3xl bg-[#090515]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-soft)]">
                    Verified Package Catalog
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Current Solutions
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-xs">
                  <i className="fas fa-boxes-stacked" />
                </div>
              </div>

              <div className="space-y-4">
                {activePackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[var(--accent)]/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {pkg.badge && (
                          <span className="inline-block px-2 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-[var(--accent)] text-white mb-1">
                            {pkg.badge}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-white">{pkg.package_name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-white">₹{pkg.price.toLocaleString('en-IN')}</span>
                        <span className="text-[9px] font-mono text-neutral-400 block capitalize">/ {pkg.billing_type}</span>
                      </div>
                    </div>

                    <ul className="space-y-1 text-xs text-neutral-300">
                      {pkg.features.slice(0, 3).map((f, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5">
                          <i className="fas fa-check text-emerald-400 text-[10px]" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSendMessage(`Tell me more about the ${pkg.package_name}`)}
                      className="w-full py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-magnifying-glass text-[10px] text-[var(--accent-soft)]" />
                      <span>Inquire in Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Leadership & Human Handoff Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#15092a] to-[#090515] border border-[var(--accent)]/30 backdrop-blur-xl shadow-xl space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-soft)]">
                Direct Specialist Access
              </span>
              <h4 className="text-base font-bold text-white">Need a Custom Proposal?</h4>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                Connect directly with <strong>Razeek Fariz</strong> (Founder) & <strong>Muhammed Hanoon</strong> (Creative Director) to plan custom enterprise web architecture, SEO scaling, or brand design.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/918075186078?text=${encodeURIComponent("Hi Razeek & EnMate team 👋, I need a custom proposal for my business.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2"
                >
                  <i className="fab fa-whatsapp text-sm" />
                  <span>WhatsApp +91 80751 86078</span>
                </a>

                <button
                  onClick={() => setIsLeadModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-envelope text-[11px] text-[var(--accent-soft)]" />
                  <span>Request Callback Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        defaultPackage={selectedLeadPkg}
      />

      {/* Google SEO JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: 'EnMate AI Digital Consultant',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web Browser',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'INR'
                },
                description: 'Instant grounded AI digital consultant for EnMate marketing packages, custom web architecture, billing software, and interactive tools.',
                author: {
                  '@type': 'Person',
                  name: 'Razeek Fariz',
                  jobTitle: 'Founder & Boss of EnMate'
                }
              },
              {
                '@type': 'Service',
                name: 'Custom Web Architecture & Digital Marketing',
                provider: {
                  '@type': 'Organization',
                  name: 'EnMate',
                  url: 'https://enmate.in',
                  telephone: '+918075186078',
                  founder: {
                    '@type': 'Person',
                    name: 'Razeek Fariz'
                  }
                },
                areaServed: ['IN', 'AE', 'US', 'GB', 'Worldwide'],
                serviceType: [
                  'Custom Web Development',
                  'Social Media Marketing',
                  'Billing & Invoicing Software',
                  'Interactive Web Cost Calculator',
                  'SEO Optimization'
                ]
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is the EnMate Social Media Package?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'EnMate provides a monthly Social Media Content Package for ₹8,000 including 15 high-quality brand posters and 2 AI-generated cinematic videos.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'Does EnMate build custom billing and invoicing software?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes, EnMate builds custom automated billing and invoicing software for retail, service businesses, and multi-branch companies with GST invoicing and WhatsApp delivery.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'How does the EnMate Website Cost Calculator work?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The EnMate Website Cost Calculator lets businesses estimate web architecture costs based on page volume, custom UI/UX design, animations, and dynamic backend features.'
                    }
                  }
                ]
              }
            ]
          })
        }}
      />
    </div>
  );
}
