'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  client_name?: string;
  category_id?: string;
  project_url?: string;
  images: string[];
  thumbnail_url?: string;
  alt_text?: string;
  is_featured?: boolean;
  img_width?: number;
  img_height?: number;
  portfolio_categories?: {
    name: string;
  } | null;
}

export default function SecureAdminPortfolioManager() {
  const router = useRouter();
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [newCatName, setNewCatName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    description: string;
    clientName: string;
    categoryId: string;
    projectUrl: string;
    images: string[];
    altText: string;
    isFeatured: boolean;
    imgWidth: number;
    imgHeight: number;
  }>({
    title: '', slug: '', description: '', clientName: '',
    categoryId: '', projectUrl: '', images: [],
    altText: '', isFeatured: false, imgWidth: 1200, imgHeight: 630
  });

  // 1. Authentication Layer Guard
  useEffect(() => {
    const checkAdminSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        loadDatabaseContext();
      }
    };
    checkAdminSession();
  }, [router]);

  const loadDatabaseContext = async () => {
    const [catRes, portRes] = await Promise.all([
      supabase.from('portfolio_categories').select('*').order('name', { ascending: true }),
      supabase.from('portfolio').select('*, portfolio_categories(name)').order('created_at', { ascending: false })
    ]);
    if (catRes.data) setCategories(catRes.data as PortfolioCategory[]);
    if (portRes.data) setItems(portRes.data as PortfolioItem[]);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cleanSlug = newCatName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    
    try {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .insert([{ name: newCatName.trim(), slug: cleanSlug }])
        .select()
        .single();

      if (error) throw error;
      setCategories(p => [...p, data as PortfolioCategory]);
      setFormData(p => ({ ...p, categoryId: data.id }));
      setNewCatName('');
      alert('Showroom category tab deployed securely.');
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadStatus(`Processing ${files.length} visual assets...`);
    
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `showcase/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...uploadedUrls],
        imgWidth: 1200,
        imgHeight: 630
      }));
      setUploadStatus('All assets verified and appended.');
    } catch (err: any) {
      setUploadStatus('Upload operation dropped.');
      alert(err.message);
    }
  };

  const removeImageFromStack = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return alert('At least one showroom layout asset is mandatory.');
    setIsSubmitting(false);

    let finalSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
    
    try {
      setIsSubmitting(true);
      
      let isUnique = false;
      let counter = 0;
      let currentCheckSlug = finalSlug;

      while (!isUnique) {
        currentCheckSlug = counter === 0 ? finalSlug : `${finalSlug}-${counter}`;
        const { data: match } = await supabase
          .from('portfolio')
          .select('slug, id')
          .eq('slug', currentCheckSlug)
          .maybeSingle();

        if (!match || match.id === editingId) {
          isUnique = true;
          finalSlug = currentCheckSlug;
        } else {
          counter++;
        }
      }

      const payload = {
        title: formData.title,
        slug: finalSlug,
        description: formData.description,
        client_name: formData.clientName || 'Premium Enterprise Portfolio Client',
        category_id: formData.categoryId || null,
        project_url: formData.projectUrl,
        images: formData.images,
        alt_text: formData.altText || `${formData.title} premium profile matrix by EnMate`,
        is_featured: formData.isFeatured,
        img_width: formData.imgWidth,
        img_height: formData.imgHeight
      };

      const { error } = editingId 
        ? await supabase.from('portfolio').update(payload).eq('id', editingId)
        : await supabase.from('portfolio').insert([payload]);

      if (error) throw error;

      alert(editingId ? 'Case record re-aligned safely.' : 'Portfolio timeline node appended live.');
      setEditingId(null);
      setFormData({ title: '', slug: '', description: '', clientName: '', categoryId: '', projectUrl: '', images: [], altText: '', isFeatured: false, imgWidth: 1200, imgHeight: 630 });
      loadDatabaseContext();
    } catch (err: any) {
      alert(`Transaction failure: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurge = async (item: PortfolioItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.title}"?`)) return;
    try {
      if (item.images && item.images.length > 0) {
        for (const url of item.images) {
          const path = url.split('/storage/v1/object/public/portfolio-images/')[1];
          if (path) await supabase.storage.from('portfolio-images').remove([path]);
        }
      }
      const { error } = await supabase.from('portfolio').delete().eq('id', item.id);
      if (error) throw error;
      loadDatabaseContext();
    } catch (err: any) {
      alert(`Purge execution rejected: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05030a] flex items-center justify-center font-mono text-xs text-neutral-500 tracking-widest">
        VERIFYING AUTH GATE ENCRYPTION MATRIX...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] text-white pt-24 pb-12 px-4 md:px-8 text-left selection:bg-[var(--accent)] selection:text-white">
      <div className="max-w-[1700px] mx-auto space-y-10">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div>
            <span className="section-tag font-mono text-[10px]">Back-Office Showroom Grid Engine</span>
            <h1 className="text-2xl md:text-4xl font-bold gradient-text uppercase">Portfolio Command Node</h1>
          </div>
          <button onClick={() => router.push('/admin')} className="btn px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold font-mono tracking-wide transition-all">
            ← Main Terminal
          </button>
        </div>

        {/* Categories Dynamic Injection Layer */}
        <div className="bg-[#07040f]/90 border border-white/5 rounded-3xl p-5 max-w-xl shadow-xl">
          <form onSubmit={handleCreateCategory} className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">Inject Dynamic Showroom Filter Tab</label>
            <div className="flex gap-2">
              <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[var(--accent-soft)] outline-none" placeholder="e.g., Packaging Design" required />
              <button type="submit" className="btn px-4 py-2 bg-white/5 border border-white/10 hover:border-[var(--accent-soft)] rounded-xl text-xs font-bold font-mono transition-all">+ Add Tab</button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSubmit} className="xl:col-span-7 bg-[#07040f]/80 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Showcase Presentation Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim(), altText: `${e.target.value} case study profile by EnMate` }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent-soft)]" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Filter Destination Tab Attachment</label>
                <select value={formData.categoryId} onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent-soft)]" required>
                  <option value="">-- Select Active Target Tab --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Client Corporate Name</label>
                <input type="text" value={formData.clientName} onChange={(e) => setFormData(p => ({ ...p, clientName: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent-soft)]" placeholder="e.g., Skymit travels" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Showcase Redirection Link (Optional)</label>
                <input type="url" value={formData.projectUrl} onChange={(e) => setFormData(p => ({ ...p, projectUrl: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent-soft)]" placeholder="https://www.clientwork.com" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Showcase Narrative Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:border-[var(--accent-soft)] leading-relaxed font-light" placeholder="Detail the brand strategy optimization loops..." required />
            </div>

            {/* MULTI IMAGE UPLOAD ARCHITECTURE GRID SECTION */}
            <div className="p-5 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">Project Canvas Assets (Upload side-1, side-2, etc. simultaneously or sequentially)</label>
              <input type="file" accept=".webp" multiple onChange={handleImageUpload} className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent)] file:text-white" />
              {uploadStatus && <div className="text-xs font-mono text-[var(--accent-soft)]">{uploadStatus}</div>}
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative group aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => removeImageFromStack(idx)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} className="accent-[var(--accent)] w-4 h-4 rounded" />
              <label htmlFor="isFeatured" className="text-xs text-neutral-400 select-none cursor-pointer">Feature item on the primary showroom portal viewport grid</label>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3.5 text-xs uppercase font-bold tracking-widest font-mono">
              {isSubmitting ? 'Syncing Tables...' : editingId ? 'Apply Database Structural Update' : 'Execute Core Node Ingress Injection'}
            </button>
          </form>

          {/* Active Sidebar Listing */}
          <div className="xl:col-span-5 bg-[#040208]/90 border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl sticky top-24 max-h-[80vh] overflow-y-auto">
            <span className="text-xs font-mono text-[var(--accent-soft)] block border-b border-white/5 pb-2 uppercase tracking-widest">Active Showroom Records ({items.length})</span>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center gap-4 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3 truncate text-left">
                    <img src={item.images?.[0] || item.thumbnail_url} className="w-12 h-12 object-cover rounded-xl border border-white/10 shrink-0" alt="" />
                    <div className="truncate space-y-1">
                      <h4 className="text-sm font-bold text-white truncate leading-tight">{item.title}</h4>
                      <span className="inline-block text-[9px] bg-white/5 px-2 py-0.5 rounded text-[var(--accent-soft)] border border-white/5 font-mono uppercase tracking-wide">{item.portfolio_categories?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => { setEditingId(item.id); setFormData({ title: item.title, slug: item.slug, description: item.description, clientName: item.client_name || '', categoryId: item.category_id || '', projectUrl: item.project_url || '', images: item.images || [], altText: item.alt_text || '', isFeatured: !!item.is_featured, imgWidth: item.img_width || 1200, imgHeight: item.img_height || 630 }); }} className="btn px-2.5 py-1.5 bg-white/5 hover:bg-[var(--accent)] border border-white/10 rounded-lg text-[10px] text-white font-mono uppercase transition-all font-bold">Edit</button>
                    <button onClick={() => handlePurge(item)} className="btn px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg text-[10px] text-red-400 font-mono uppercase transition-all font-bold">Purge</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
