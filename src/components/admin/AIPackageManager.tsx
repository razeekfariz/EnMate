'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EnMatePackage, AIKnowledgeItem, AILead } from '@/types/ai';
import { VERIFIED_PACKAGES, VERIFIED_KNOWLEDGE } from '@/lib/ai-data';

interface AIDiagnosticsData {
  configuredProviders: { gemini: boolean; groq: boolean; openrouter: boolean };
  providerTests: { gemini: string; groq: string; openrouter: string };
  overallStatus: string;
  totalDurationMs?: number;
}

export default function AIPackageManager() {
  const [activeSubTab, setActiveSubTab] = useState<'packages' | 'knowledge' | 'diagnostics' | 'leads'>('packages');

  // Filter Categories
  const [pkgFilterCategory, setPkgFilterCategory] = useState<string>('all');
  const [kbFilterCategory, setKbFilterCategory] = useState<string>('all');

  // Packages state
  const [packages, setPackages] = useState<EnMatePackage[]>([]);
  const [isPkgLoading, setIsPkgLoading] = useState<boolean>(true);
  const [pkgModalOpen, setPkgModalOpen] = useState<boolean>(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState({
    package_name: '',
    category: 'social_media',
    price: 8000,
    currency: 'INR',
    billing_type: 'monthly' as 'one_time' | 'monthly' | 'quarterly' | 'annual' | 'custom',
    description: '',
    features: ['15 High-Quality Brand Posters', '2 AI-Generated Cinematic Videos'],
    ideal_for: ['Small to medium businesses wanting consistent social content'],
    keywords: 'social media, 8000 package, posters, ai video',
    badge: 'Most Popular',
    active: true,
    priority: 100
  });

  // Feature & Ideal-For helpers for form
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newIdealText, setNewIdealText] = useState('');

  // Knowledge base state
  const [knowledgeList, setKnowledgeList] = useState<AIKnowledgeItem[]>([]);
  const [kbModalOpen, setKbModalOpen] = useState<boolean>(false);
  const [editingKbId, setEditingKbId] = useState<string | null>(null);
  const [kbForm, setKbForm] = useState({
    category: 'company' as any,
    title: '',
    question: '',
    answer: '',
    keywords: '',
    priority: 100,
    active: true,
    visibility: 'public' as 'public' | 'internal' | 'client'
  });

  // Leads state
  const [leads, setLeads] = useState<AILead[]>([]);

  // Diagnostics & AI Sandbox state
  const [diagnostics, setDiagnostics] = useState<AIDiagnosticsData | null>(null);
  const [isDiagLoading, setIsDiagLoading] = useState<boolean>(false);
  const [isFlushingCache, setIsFlushingCache] = useState<boolean>(false);
  const [testPromptQuery, setTestPromptQuery] = useState<string>('What is your billing software and website calculator?');
  const [testPromptAnswer, setTestPromptAnswer] = useState<string | null>(null);
  const [testPromptProvider, setTestPromptProvider] = useState<string | null>(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState<boolean>(false);

  // Status/Feedback
  const [actionStatus, setActionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAllAIData();
  }, []);

  const loadAllAIData = async () => {
    setIsPkgLoading(true);
    try {
      // 1. Fetch Packages
      const { data: pkgData, error: pkgErr } = await supabase
        .from('enmate_ai_packages')
        .select('*')
        .order('priority', { ascending: false });

      if (!pkgErr && pkgData && pkgData.length > 0) {
        setPackages(pkgData as EnMatePackage[]);
      } else {
        setPackages(VERIFIED_PACKAGES);
      }

      // 2. Fetch Knowledge
      const { data: kbData, error: kbErr } = await supabase
        .from('enmate_ai_knowledge')
        .select('*')
        .order('priority', { ascending: false });

      if (!kbErr && kbData && kbData.length > 0) {
        setKnowledgeList(kbData as AIKnowledgeItem[]);
      } else {
        setKnowledgeList(VERIFIED_KNOWLEDGE);
      }

      // 3. Fetch Leads
      const { data: leadData, error: leadErr } = await supabase
        .from('enmate_ai_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!leadErr && leadData) {
        setLeads(leadData as AILead[]);
      }
    } catch (e: any) {
      console.warn('Error fetching AI admin data:', e);
      setPackages(VERIFIED_PACKAGES);
      setKnowledgeList(VERIFIED_KNOWLEDGE);
    } finally {
      setIsPkgLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionStatus({ message, type });
    setTimeout(() => setActionStatus(null), 4500);
  };

  // Instant AI Cache Invalidation Trigger
  const triggerInstantAICacheSync = async (silent = false) => {
    setIsFlushingCache(true);
    try {
      const res = await fetch('/api/ai/cache/clear', { method: 'POST' });
      if (res.ok) {
        if (!silent) showNotification('⚡ AI Cache instantly synchronized! All new details are live in AI memory.', 'success');
      }
    } catch (e) {
      console.warn('Cache flush ping error:', e);
    } finally {
      setIsFlushingCache(false);
    }
  };

  // Run Provider Diagnostics
  const runDiagnosticsSuite = async () => {
    setIsDiagLoading(true);
    try {
      const res = await fetch('/api/ai/test');
      if (res.ok) {
        const json = await res.json();
        setDiagnostics(json);
        showNotification('Provider diagnostics suite updated successfully.', 'success');
      } else {
        showNotification('Diagnostic test returned a non-200 response.', 'error');
      }
    } catch (err: any) {
      showNotification(`Diagnostic error: ${err?.message || 'Failed to ping test route'}`, 'error');
    } finally {
      setIsDiagLoading(false);
    }
  };

  // Run Sandbox Prompt
  const handleTestSandboxPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPromptQuery.trim()) return;
    setIsTestingPrompt(true);
    setTestPromptAnswer(null);
    setTestPromptProvider(null);

    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testPromptQuery.trim(), history: [] })
      });
      const data = await res.json();
      if (data.answer) {
        setTestPromptAnswer(data.answer);
        setTestPromptProvider(data.provider || data.source || 'EnMate AI');
      } else {
        setTestPromptAnswer('No response returned from AI.');
      }
    } catch (err: any) {
      setTestPromptAnswer(`Error calling AI consultation engine: ${err.message}`);
    } finally {
      setIsTestingPrompt(false);
    }
  };

  // --- PACKAGE ACTIONS ---
  const handleOpenNewPkgModal = () => {
    setEditingPkgId(null);
    setPkgForm({
      package_name: '',
      category: 'products',
      price: 15000,
      currency: 'INR',
      billing_type: 'one_time',
      description: '',
      features: ['High-Performance Next.js Architecture', 'Custom Responsive UI/UX Design'],
      ideal_for: ['Businesses seeking custom digital products or high-converting web applications'],
      keywords: 'custom product, software, web app, billing',
      badge: 'New Launch',
      active: true,
      priority: 100
    });
    setPkgModalOpen(true);
  };

  const handleEditPkg = (pkg: EnMatePackage) => {
    setEditingPkgId(pkg.id);
    setPkgForm({
      package_name: pkg.package_name,
      category: pkg.category,
      price: pkg.price,
      currency: pkg.currency || 'INR',
      billing_type: pkg.billing_type,
      description: pkg.description,
      features: [...pkg.features],
      ideal_for: [...(pkg.ideal_for || [])],
      keywords: Array.isArray(pkg.keywords) ? pkg.keywords.join(', ') : '',
      badge: pkg.badge || '',
      active: pkg.active,
      priority: pkg.priority || 100
    });
    setPkgModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgForm.package_name.trim() || pkgForm.price < 0) {
      alert('Please provide a valid package name and price.');
      return;
    }

    const payload = {
      package_name: pkgForm.package_name.trim(),
      category: pkgForm.category,
      price: Number(pkgForm.price),
      currency: pkgForm.currency || 'INR',
      billing_type: pkgForm.billing_type,
      description: pkgForm.description.trim(),
      features: pkgForm.features,
      ideal_for: pkgForm.ideal_for,
      keywords: pkgForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      badge: pkgForm.badge?.trim() || null,
      active: pkgForm.active,
      priority: Number(pkgForm.priority) || 100
    };

    try {
      if (editingPkgId) {
        const { error } = await supabase
          .from('enmate_ai_packages')
          .update(payload)
          .eq('id', editingPkgId);

        if (error) throw error;
        showNotification(`Package "${payload.package_name}" updated and AI cache synchronized!`);
      } else {
        const { error } = await supabase
          .from('enmate_ai_packages')
          .insert([payload]);

        if (error) throw error;
        showNotification(`New item "${payload.package_name}" created & AI memory updated instantly!`);
      }

      setPkgModalOpen(false);
      await triggerInstantAICacheSync(true);
      loadAllAIData();
    } catch (err: any) {
      alert(`Error saving package: ${err.message}.`);
    }
  };

  const handleTogglePkgActive = async (pkg: EnMatePackage) => {
    try {
      const { error } = await supabase
        .from('enmate_ai_packages')
        .update({ active: !pkg.active })
        .eq('id', pkg.id);

      if (error) throw error;
      showNotification(`Package status changed to ${!pkg.active ? 'Active' : 'Inactive'} and AI updated!`);
      await triggerInstantAICacheSync(true);
      loadAllAIData();
    } catch (err: any) {
      alert(`Status toggle failed: ${err.message}`);
    }
  };

  const handleDeletePackage = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('enmate_ai_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showNotification(`Item "${name}" deleted & AI cache flushed.`);
      await triggerInstantAICacheSync(true);
      loadAllAIData();
    } catch (err: any) {
      alert(`Failed to delete package: ${err.message}`);
    }
  };

  // --- KNOWLEDGE ACTIONS ---
  const handleOpenNewKbModal = () => {
    setEditingKbId(null);
    setKbForm({
      category: 'products',
      title: '',
      question: '',
      answer: '',
      keywords: '',
      priority: 100,
      active: true,
      visibility: 'public'
    });
    setKbModalOpen(true);
  };

  const handleEditKb = (item: AIKnowledgeItem) => {
    setEditingKbId(item.id);
    setKbForm({
      category: item.category,
      title: item.title,
      question: item.question,
      answer: item.answer,
      keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      priority: item.priority || 100,
      active: item.active,
      visibility: item.visibility || 'public'
    });
    setKbModalOpen(true);
  };

  const handleSaveKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbForm.question.trim() || !kbForm.answer.trim()) {
      alert('Question and answer cannot be empty.');
      return;
    }

    const payload = {
      category: kbForm.category,
      title: kbForm.title.trim() || kbForm.question.trim().slice(0, 50),
      question: kbForm.question.trim(),
      answer: kbForm.answer.trim(),
      keywords: kbForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
      priority: Number(kbForm.priority) || 100,
      active: kbForm.active,
      visibility: kbForm.visibility
    };

    try {
      if (editingKbId) {
        const { error } = await supabase
          .from('enmate_ai_knowledge')
          .update(payload)
          .eq('id', editingKbId);

        if (error) throw error;
        showNotification('Knowledge item updated and instantly synchronized to AI!');
      } else {
        const { error } = await supabase
          .from('enmate_ai_knowledge')
          .insert([payload]);

        if (error) throw error;
        showNotification('New knowledge item added and AI memory updated!');
      }

      setKbModalOpen(false);
      await triggerInstantAICacheSync(true);
      loadAllAIData();
    } catch (err: any) {
      alert(`Failed to save knowledge item: ${err.message}`);
    }
  };

  const handleDeleteKb = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const { error } = await supabase
        .from('enmate_ai_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showNotification('Knowledge item deleted & AI memory refreshed.');
      await triggerInstantAICacheSync(true);
      loadAllAIData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  // Seed default baseline data
  const handleSeedDefaults = async () => {
    if (!confirm('This will seed verified default packages (Social Media ₹8,000) and knowledge base into EnMate Central System. Proceed?')) return;

    try {
      for (const p of VERIFIED_PACKAGES) {
        const { id, ...rest } = p;
        await supabase.from('enmate_ai_packages').insert([rest]);
      }

      for (const k of VERIFIED_KNOWLEDGE) {
        const { id, ...rest } = k;
        await supabase.from('enmate_ai_knowledge').insert([rest]);
      }

      showNotification('Verified baseline data seeded successfully!');
      await triggerInstantAICacheSync(true);
      loadAllAIData();
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    }
  };

  // Filtered packages
  const filteredPackages = packages.filter(p => {
    if (pkgFilterCategory === 'all') return true;
    if (pkgFilterCategory === 'products_software') {
      return ['products', 'software', 'billing_software', 'tools'].includes(p.category);
    }
    return p.category === pkgFilterCategory;
  });

  // Filtered knowledge
  const filteredKnowledge = knowledgeList.filter(k => {
    if (kbFilterCategory === 'all') return true;
    if (kbFilterCategory === 'products_software') {
      return ['products', 'software', 'billing_software', 'tools'].includes(k.category);
    }
    if (kbFilterCategory === 'leadership') {
      return k.category === 'company';
    }
    return k.category === kbFilterCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & AI Engine Controls */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#090515]/95 border border-[var(--accent)]/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--accent)]/10 to-violet-600/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-soft)]">
              EnMate AI & Architecture Command Hub
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-1.5 tracking-tight">
            AI Memory & Product Control Center
          </h2>
          <p className="text-xs text-neutral-300 font-light mt-1 max-w-xl leading-relaxed">
            Manage packages, digital products, billing software details, interactive tools, and leadership facts. Every change is <strong className="text-white font-semibold">instantly detected</strong> by EnMate AI across the entire website.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <button
            onClick={() => triggerInstantAICacheSync()}
            disabled={isFlushingCache}
            title="Force immediate synchronization of all AI memory and knowledge base cache"
            className="px-3.5 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-xs font-mono text-violet-200 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <i className={`fas fa-bolt text-xs ${isFlushingCache ? 'animate-spin' : 'text-violet-400'}`} />
            <span>{isFlushingCache ? 'Syncing...' : '⚡ Sync AI Memory'}</span>
          </button>

          <button
            onClick={handleSeedDefaults}
            title="Seed baseline ₹8,000 package & verified FAQs"
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center gap-2"
          >
            <i className="fas fa-database text-xs text-neutral-400" />
            <span>Seed Baseline</span>
          </button>

          <button
            onClick={activeSubTab === 'packages' ? handleOpenNewPkgModal : handleOpenNewKbModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(207,4,102,0.4)] transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus text-xs" />
            <span>{activeSubTab === 'packages' ? 'Add Product / Package' : 'Add AI Detail / Tool'}</span>
          </button>
        </div>
      </div>

      {/* Security & System Guard Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <i className="fas fa-shield-halved text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Confidential Keys</span>
            <span className="text-xs text-neutral-200 font-semibold">100% Server Encrypted</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-violet-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <i className="fas fa-microchip text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block font-bold">Multi-Provider AI</span>
            <span className="text-xs text-neutral-200 font-semibold">Gemini • Groq • OpenRouter</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <i className="fas fa-server text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block font-bold">Database Tier</span>
            <span className="text-xs text-neutral-200 font-semibold">Free-Tier Optimized Cache</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-[var(--accent)]/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent-soft)] shrink-0">
            <i className="fas fa-chart-line text-sm" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[var(--accent-soft)] uppercase tracking-wider block font-bold">Google Scaling</span>
            <span className="text-xs text-neutral-200 font-semibold">JSON-LD SEO Live</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {actionStatus && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
          actionStatus.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
        }`}>
          <i className={`fas ${actionStatus.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} />
          <span>{actionStatus.message}</span>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('packages')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'packages'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-white/[0.03] text-neutral-400 hover:text-white'
          }`}
        >
          <i className="fas fa-box text-xs" />
          <span>Products & Packages ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'knowledge'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-white/[0.03] text-neutral-400 hover:text-white'
          }`}
        >
          <i className="fas fa-brain text-xs" />
          <span>AI Knowledge & Tools ({knowledgeList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'diagnostics'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-white/[0.03] text-neutral-400 hover:text-white'
          }`}
        >
          <i className="fas fa-stethoscope text-xs" />
          <span>Live AI Diagnostics & Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'leads'
              ? 'bg-[var(--accent)] text-white shadow-md'
              : 'bg-white/[0.03] text-neutral-400 hover:text-white'
          }`}
        >
          <i className="fas fa-user-check text-xs" />
          <span>Consultation Leads ({leads.length})</span>
        </button>
      </div>

      {/* ─── 1. PACKAGES & PRODUCTS SUB-TAB ─── */}
      {activeSubTab === 'packages' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'products_software', label: 'Products & Software' },
              { id: 'social_media', label: 'Social Media' },
              { id: 'web_development', label: 'Web Development' },
              { id: 'seo', label: 'SEO' },
              { id: 'branding', label: 'Branding' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPkgFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  pkgFilterCategory === cat.id
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'bg-white/[0.03] text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 rounded-3xl bg-[#090515]/90 border transition-all flex flex-col justify-between ${
                  pkg.active ? 'border-white/15 hover:border-[var(--accent)]/60' : 'border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        pkg.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {pkg.active ? 'Active in AI' : 'Draft'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-white/10 text-neutral-300">
                        {pkg.category}
                      </span>
                      {pkg.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[var(--accent)] text-white">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-white">₹{pkg.price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-mono text-neutral-400 block capitalize">/ {pkg.billing_type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{pkg.package_name}</h3>
                  <p className="text-xs text-neutral-300 font-light mt-1.5 line-clamp-2">{pkg.description}</p>

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-soft)]">Inclusions:</span>
                    <ul className="space-y-1 text-xs text-neutral-200">
                      {pkg.features.map((f, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5">
                          <i className="fas fa-check text-emerald-400 text-[10px] mt-1 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTogglePkgActive(pkg)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white transition-all"
                  >
                    {pkg.active ? 'Deactivate' : 'Activate'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPkg(pkg)}
                      className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white transition-all text-xs"
                      title="Edit Item"
                    >
                      <i className="fas fa-pencil" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id, pkg.package_name)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white transition-all text-xs"
                      title="Delete Item"
                    >
                      <i className="fas fa-trash-can" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. KNOWLEDGE & FAQS SUB-TAB ─── */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Knowledge' },
              { id: 'products_software', label: 'Products & Tools' },
              { id: 'billing_software', label: 'Billing Software' },
              { id: 'tools', label: 'Calculators & Tools' },
              { id: 'web_development', label: 'Web Dev' },
              { id: 'seo', label: 'SEO & Scaling' },
              { id: 'leadership', label: 'Leadership / Boss' },
              { id: 'faq', label: 'General FAQs' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setKbFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  kbFilterCategory === cat.id
                    ? 'bg-white/20 text-white font-bold border border-white/30'
                    : 'bg-white/[0.03] text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKnowledge.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 hover:border-[var(--accent)]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-white/[0.05] text-[var(--accent-soft)]">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">Priority: {item.priority}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{item.question}</h4>
                  <p className="text-xs text-neutral-300 mt-2 whitespace-pre-line leading-relaxed">{item.answer}</p>

                  {item.keywords && item.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.keywords.map((kw, kwIdx) => (
                        <span key={kwIdx} className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/[0.03] text-neutral-400">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditKb(item)}
                    className="p-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white transition-all text-xs"
                    title="Edit Item"
                  >
                    <i className="fas fa-pencil" />
                  </button>
                  <button
                    onClick={() => handleDeleteKb(item.id, item.question)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white transition-all text-xs"
                    title="Delete Item"
                  >
                    <i className="fas fa-trash-can" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 3. LIVE AI DIAGNOSTICS & SIMULATOR SUB-TAB ─── */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#090515]/95 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Live AI Provider Diagnostics Suite</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verify latency and health across all AI providers without exposing secret keys.
                </p>
              </div>

              <button
                onClick={runDiagnosticsSuite}
                disabled={isDiagLoading}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold transition-all flex items-center gap-2"
              >
                <i className={`fas fa-arrows-rotate ${isDiagLoading ? 'animate-spin' : ''}`} />
                <span>{isDiagLoading ? 'Running Tests...' : 'Run Diagnostics'}</span>
              </button>
            </div>

            {diagnostics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Google Gemini</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${diagnostics.providerTests.gemini === 'pass' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-sm font-bold text-white capitalize">{diagnostics.providerTests.gemini}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Groq High-Speed</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${diagnostics.providerTests.groq === 'pass' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-sm font-bold text-white capitalize">{diagnostics.providerTests.groq}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">OpenRouter Fallback</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${diagnostics.providerTests.openrouter === 'pass' ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                    <span className="text-sm font-bold text-white capitalize">{diagnostics.providerTests.openrouter}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Sandbox Playground */}
          <div className="p-6 rounded-3xl bg-[#090515]/95 border border-[var(--accent)]/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Instant AI Sandbox / Simulator</h3>
            <p className="text-xs text-neutral-400">
              Ask anything to verify how the AI detects newly added billing software, website calculator tools, and products right now.
            </p>

            <form onSubmit={handleTestSandboxPrompt} className="flex gap-2">
              <input
                type="text"
                value={testPromptQuery}
                onChange={(e) => setTestPromptQuery(e.target.value)}
                placeholder="Ask about website cost calculator, billing software, founder, etc."
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={isTestingPrompt}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isTestingPrompt ? 'Testing...' : 'Test AI'}
              </button>
            </form>

            {testPromptAnswer && (
              <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[var(--accent-soft)]">
                    Response from {testPromptProvider}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Live Grounded</span>
                </div>
                <div className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed">
                  {testPromptAnswer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 4. LEADS & INQUIRIES SUB-TAB ─── */}
      {activeSubTab === 'leads' && (
        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#090515]/90 border border-white/10 text-center space-y-2">
              <i className="fas fa-inbox text-3xl text-neutral-600" />
              <h4 className="text-base font-bold text-white">No Consultation Inquiries Yet</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                When visitors request a proposal or consultation from EnMate AI, their details will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead, lIdx) => (
                <div key={lIdx} className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                      {lead.business_name && (
                        <span className="text-[11px] font-mono text-[var(--accent-soft)] block">
                          {lead.business_name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-300">
                    {lead.phone && (
                      <p className="flex items-center gap-2">
                        <i className="fab fa-whatsapp text-emerald-400" />
                        <span>{lead.phone}</span>
                      </p>
                    )}
                    {lead.email && (
                      <p className="flex items-center gap-2">
                        <i className="fas fa-envelope text-violet-400" />
                        <span>{lead.email}</span>
                      </p>
                    )}
                    {lead.package_interest && (
                      <p className="flex items-center gap-2 text-white font-semibold">
                        <i className="fas fa-box text-[var(--accent-soft)]" />
                        <span>Package: {lead.package_interest}</span>
                      </p>
                    )}
                    {lead.requirements && (
                      <p className="mt-2 p-2.5 rounded-xl bg-white/[0.03] text-neutral-300 italic">
                        "{lead.requirements}"
                      </p>
                    )}
                  </div>

                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20thank%20you%20for%20contacting%20EnMate.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <i className="fab fa-whatsapp" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT PACKAGE OR PRODUCT ─── */}
      {pkgModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090515] border border-[var(--accent)]/40 p-6 sm:p-8 text-white shadow-2xl">
            
            <button
              onClick={() => setPkgModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center transition-all text-xs"
            >
              <i className="fas fa-xmark" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingPkgId ? 'Edit Package / Product' : 'Create New Package or Digital Product'}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Custom Billing Software / ₹8000 Package"
                    value={pkgForm.package_name}
                    onChange={e => setPkgForm(prev => ({ ...prev, package_name: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={pkgForm.category}
                    onChange={e => setPkgForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#120826] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                  >
                    <option value="products">Digital Product / SaaS</option>
                    <option value="software">Custom Software</option>
                    <option value="billing_software">Billing Software & Invoicing</option>
                    <option value="tools">Interactive Tool / Calculator</option>
                    <option value="social_media">Social Media</option>
                    <option value="web_development">Web Development</option>
                    <option value="seo">SEO & Google Scaling</option>
                    <option value="branding">Branding & Identity</option>
                    <option value="video">Video Editing & Production</option>
                    <option value="digital_marketing">Digital Marketing</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={pkgForm.price}
                    onChange={e => setPkgForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={pkgForm.billing_type}
                    onChange={e => setPkgForm(prev => ({ ...prev, billing_type: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#120826] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="one_time">One Time</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="custom">Custom Quote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular / Featured"
                    value={pkgForm.badge}
                    onChange={e => setPkgForm(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of what this product/package offers..."
                  value={pkgForm.description}
                  onChange={e => setPkgForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              {/* Dynamic Feature Inclusions */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Inclusions / Deliverables
                </label>
                <div className="space-y-2 mb-2">
                  {pkgForm.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={e => {
                          const updated = [...pkgForm.features];
                          updated[fIdx] = e.target.value;
                          setPkgForm(prev => ({ ...prev, features: updated }));
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPkgForm(prev => ({
                            ...prev,
                            features: prev.features.filter((_, i) => i !== fIdx)
                          }));
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs"
                      >
                        <i className="fas fa-trash-can" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add new inclusion (e.g. Automated GST Billing)..."
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeatureText.trim()) {
                        setPkgForm(prev => ({ ...prev, features: [...prev.features, newFeatureText.trim()] }));
                        setNewFeatureText('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  AI Matching Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="billing software, pos, invoice, digital product"
                  value={pkgForm.keywords}
                  onChange={e => setPkgForm(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-300">
                  <input
                    type="checkbox"
                    checked={pkgForm.active}
                    onChange={e => setPkgForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 rounded text-[var(--accent)] bg-neutral-900 border-white/20"
                  />
                  <span>Active & Immediately Live in AI Memory</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save & Sync AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT KNOWLEDGE ─── */}
      {kbModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090515] border border-[var(--accent)]/40 p-6 sm:p-8 text-white shadow-2xl">
            
            <button
              onClick={() => setKbModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center transition-all text-xs"
            >
              <i className="fas fa-xmark" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingKbId ? 'Edit AI Knowledge Item' : 'Add AI Detail, Tool or Knowledge'}
            </h3>

            <form onSubmit={handleSaveKb} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={kbForm.category}
                  onChange={e => setKbForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#120826] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                >
                  <option value="products">Digital Products & SaaS</option>
                  <option value="software">Custom Software</option>
                  <option value="billing_software">Billing Software & Invoicing</option>
                  <option value="tools">Interactive Tools (Website Calculator, etc.)</option>
                  <option value="company">Company & Leadership (Razeek / Hanoon)</option>
                  <option value="packages">Packages & Pricing</option>
                  <option value="web_development">Web Development</option>
                  <option value="social_media">Social Media</option>
                  <option value="seo">SEO & Google Search Scaling</option>
                  <option value="branding">Branding & Design</option>
                  <option value="video">Video Editing & Production</option>
                  <option value="digital_marketing">Digital Marketing</option>
                  <option value="faq">General FAQ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Client Question / Trigger *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does your billing software work? or What tools do you provide?"
                  value={kbForm.question}
                  onChange={e => setKbForm(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  EnMate AI Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="The verified, grounded answer the AI will provide to clients..."
                  value={kbForm.answer}
                  onChange={e => setKbForm(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="billing software, calculator, pos, web app"
                  value={kbForm.keywords}
                  onChange={e => setKbForm(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Save & Synchronize AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
