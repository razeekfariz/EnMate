'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface Tag {
  id: string;
  name: string;
  slug?: string;
}

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured_image?: string;
  category_id?: string;
}

export default function NextGenProductionAdminBlog() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [seoScore, setSeoScore] = useState<number>(0);
  const [seoWarnings, setSeoWarnings] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Inline Metadata Creation States
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newTagName, setNewTagName] = useState<string>('');
  const [isCreatingMeta, setIsCreatingMeta] = useState<boolean>(false);

  // Editorial Management States
  const [adminPosts, setAdminPosts] = useState<AdminPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', focusKeyword: '',
    metaTitle: '', metaDescription: '', altText: '', authorName: 'EnMate Team',
    categoryId: '', status: 'draft', featuredImage: '', imgWidth: 0, imgHeight: 0
  });

  // 1. Session check
  useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        refreshAdminDashboardLog();
      }
    };
    verifySession();
  }, [router]);

  // 2. Data loader
  const refreshAdminDashboardLog = async () => {
    const [catRes, tagRes, blogRes] = await Promise.all([
      supabase.from('categories').select('id, name'),
      supabase.from('tags').select('id, name'),
      supabase.from('blogs').select('id, title, slug, status, featured_image, category_id').order('created_at', { ascending: false })
    ]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (tagRes.data) setAvailableTags(tagRes.data as Tag[]);
    if (blogRes.data) setAdminPosts(blogRes.data as AdminPost[]);
  };

  // 3. Real-time SEO Scoring
  useEffect(() => {
    if (!isAuthenticated) return;
    let score = 0;
    let warnings: string[] = [];

    if (!formData.title) {
      setSeoScore(0);
      setSeoWarnings(['Provide a primary article title framework to kick off auditing.']);
      return;
    }

    if (formData.metaTitle.length >= 50 && formData.metaTitle.length <= 60) { score += 20; }
    else { warnings.push('Meta Title length is out of optimal search boundary (50-60 characters).'); }

    if (formData.metaDescription.length >= 130 && formData.metaDescription.length <= 160) { score += 20; }
    else { warnings.push('Meta Description length is out of optimal click boundary (130-160 characters).'); }

    if (formData.focusKeyword) {
      score += 15;
      const cleanContent = formData.content.toLowerCase();
      const keywordCount = (cleanContent.match(new RegExp(formData.focusKeyword.toLowerCase(), 'g')) || []).length;
      if (keywordCount >= 3) { score += 15; }
      else { warnings.push(`Focus Keyword density low (${keywordCount} matches). Aim for at least 3 appearances.`); }
    } else { warnings.push('Target Search Focus Keyword is missing.'); }

    if (formData.altText && formData.altText.length > 10) { score += 15; }
    else { warnings.push('Image Alternate validation text is missing or too brief for screen readers.'); }

    if (formData.content.includes('<h2') || formData.content.includes('<h3')) { score += 15; }
    else { warnings.push('Semantic structure layout missing: Incorporate at least one secondary H2 or H3 anchor point.'); }

    setSeoScore(score);
    setSeoWarnings(warnings);
  }, [formData.title, formData.metaTitle, formData.metaDescription, formData.focusKeyword, formData.altText, formData.content, isAuthenticated]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsCreatingMeta(true);
    const catSlug = newCategoryName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    try {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim(), slug: catSlug }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, newCat as Category]);
      setFormData(prev => ({ ...prev, categoryId: newCat.id }));
      setNewCategoryName('');
      alert(`Success! Master Category area "${newCat.name}" generated safely.`);
    } catch (err: any) {
      alert(`Database rejected Category creation: ${err.message}`);
    } finally {
      setIsCreatingMeta(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsCreatingMeta(true);
    const tagSlug = newTagName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    try {
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert([{ name: newTagName.trim(), slug: tagSlug }])
        .select()
        .single();

      if (error) throw error;

      setAvailableTags(prev => [...prev, newTag as Tag]);
      setSelectedTags(prev => [...prev, newTag.id]);
      setNewTagName('');
      alert(`Success! Relational structural tag "${newTag.name}" logged.`);
    } catch (err: any) {
      alert(`Database rejected Tag creation: ${err.message}`);
    } finally {
      setIsCreatingMeta(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanSlug = val.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setFormData(prev => ({
      ...prev,
      title: val,
      slug: cleanSlug,
      metaTitle: val.substring(0, 60)
    }));
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const getReadingTime = (htmlText: string) => {
    if (!htmlText) return 1;
    const cleanText = htmlText.replace(/<[^>]*>/g, '');
    const words = cleanText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 220));
  };

  const handleToolbarFormat = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText.length > 0) {
      const element = document.createElement(tag);
      element.textContent = selectedText;
      range.deleteContents();
      range.insertNode(element);
    } else {
      const element = document.createElement(tag);
      element.innerHTML = '&#8203;'; 
      range.insertNode(element);
    }
    
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, content: editorRef.current?.innerHTML || '' }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Analyzing graphic parameters...');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      const imageInstance = new (window as any).Image();
      imageInstance.src = event.target?.result as string;
      imageInstance.onload = async function () {
        const width = (this as any).width;
        const height = (this as any).height;

        if (width < 1200 || height < 630) {
          alert(`🚨 PROOFING FAILURE: Featured assets must measure at least 1200×630px. Dimensions: ${width}×${height}px.`);
          setUploadStatus('Asset rejected.');
          e.target.value = ''; 
          return;
        }

        try {
          setUploadStatus('Pushing verified asset file to bucket root...');
          const fileExt = file.name.split('.').pop();
          const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `featured/${uniqueName}`;

          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

          setFormData(prev => ({
            ...prev,
            featuredImage: publicUrl,
            imgWidth: width,
            imgHeight: height,
            altText: prev.altText || `${prev.title || 'EnMate Blog'} Featured Strategy Document`
          }));
          setUploadStatus('Asset verified and launched live.');
        } catch (err) {
          console.error(err);
          setUploadStatus('Authorization error processing storage bucket maps.');
        }
      };
    };
  };

  const loadPostToWorkspace = async (postId: string) => {
    try {
      const { data: currentPost, error } = await supabase
        .from('blogs')
        .select('*, blog_tags(tag_id)')
        .eq('id', postId)
        .single();

      if (error) throw error;

      setEditingPostId(currentPost.id);
      setFormData({
        title: currentPost.title,
        slug: currentPost.slug,
        excerpt: currentPost.excerpt || '',
        content: currentPost.content || '',
        focusKeyword: currentPost.focus_keyword || '',
        metaTitle: currentPost.meta_title || '',
        metaDescription: currentPost.meta_description || '',
        altText: currentPost.alt_text || '',
        authorName: currentPost.author_name || 'EnMate Team',
        categoryId: currentPost.category_id || '',
        status: currentPost.status || 'draft',
        featuredImage: currentPost.featured_image || '',
        imgWidth: currentPost.featured_image_width || 1200,
        imgHeight: currentPost.featured_image_height || 630
      });

      if (editorRef.current) {
        editorRef.current.innerHTML = currentPost.content || '';
      }

      const activeAssociatedTags = (currentPost.blog_tags || []).map((t: any) => t.tag_id);
      setSelectedTags(activeAssociatedTags);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Failed to pull data context layer: ${err.message}`);
    }
  };

  const executeDataPurgeWorkflow = async (post: AdminPost) => {
    const confirmation = confirm(`Are you sure you want to permanently delete "${post.title}"?\n\nThis will remove relational blog_tags and its storage asset layout completely.`);
    if (!confirmation) return;

    try {
      if (post.featured_image) {
        const fileLocationPath = post.featured_image.split('/storage/v1/object/public/blog-images/')[1];
        if (fileLocationPath) {
          await supabase.storage.from('blog-images').remove([fileLocationPath]);
        }
      }

      await supabase.from('blog_tags').delete().eq('blog_id', post.id);

      const { error: deletionError } = await supabase.from('blogs').delete().eq('id', post.id);
      if (deletionError) throw deletionError;

      alert('Content lifecycle entries purges completed safely.');
      
      if (editingPostId === post.id) {
        setEditingPostId(null);
        if (editorRef.current) editorRef.current.innerHTML = '';
        setSelectedTags([]);
        setFormData({
          title: '', slug: '', excerpt: '', content: '', focusKeyword: '',
          metaTitle: '', metaDescription: '', altText: '', authorName: 'EnMate Team',
          categoryId: '', status: 'draft', featuredImage: '', imgWidth: 0, imgHeight: 0
        });
      }
      refreshAdminDashboardLog();
    } catch (err: any) {
      alert(`Purge execution rejected by backend: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.featuredImage) {
      alert('A verified graphic asset header is mandatory.');
      return;
    }

    setIsSubmitting(true);
    let targetSlug = formData.slug;

    try {
      let absoluteUniqueFound = false;
      let counter = 0;

      while (!absoluteUniqueFound) {
        const currentCheckSlug = counter === 0 ? targetSlug : `${targetSlug}-${counter}`;
        const { data: duplicateMatch } = await supabase
          .from('blogs')
          .select('slug, id')
          .eq('slug', currentCheckSlug)
          .maybeSingle();

        if (!duplicateMatch || duplicateMatch.id === editingPostId) {
          targetSlug = currentCheckSlug;
          absoluteUniqueFound = true;
        } else {
          counter++;
        }
      }

      const postRowObject = {
        title: formData.title,
        slug: targetSlug,
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image: formData.featuredImage,
        featured_image_width: formData.imgWidth,
        featured_image_height: formData.imgHeight,
        alt_text: formData.altText,
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        focus_keyword: formData.focusKeyword,
        author_name: formData.authorName,
        reading_time: getReadingTime(formData.content),
        status: formData.status,
        category_id: formData.categoryId || null,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      let activeBlogId = editingPostId;

      if (editingPostId) {
        const { error: updateError } = await supabase
          .from('blogs')
          .update(postRowObject)
          .eq('id', editingPostId);

        if (updateError) throw updateError;
        await supabase.from('blog_tags').delete().eq('blog_id', editingPostId);
      } else {
        const { data: newPost, error: postError } = await supabase
          .from('blogs')
          .insert([postRowObject])
          .select()
          .single();

        if (postError) throw postError;
        if (newPost) activeBlogId = newPost.id;
      }

      if (selectedTags.length > 0 && activeBlogId) {
        const tagJunctionRows = selectedTags.map(tagId => ({
          blog_id: activeBlogId,
          tag_id: tagId
        }));
        const { error: junctionError } = await supabase
          .from('blog_tags')
          .insert(tagJunctionRows);
        if (junctionError) throw junctionError;
      }

      alert(editingPostId ? 'Content successfully re-aligned.' : `Success! Content fully integrated: /blog/${targetSlug}`);
      
      setEditingPostId(null);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setSelectedTags([]);
      setFormData({
        title: '', slug: '', excerpt: '', content: '', focusKeyword: '',
        metaTitle: '', metaDescription: '', altText: '', authorName: 'EnMate Team',
        categoryId: '', status: 'draft', featuredImage: '', imgWidth: 0, imgHeight: 0
      });
      refreshAdminDashboardLog();
    } catch (err: any) {
      alert(`Database rejected layer transaction: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-[#05030a] text-[var(--text-main)] pt-24 pb-12 px-4 md:px-8 selection:bg-[var(--accent)] selection:text-white">
      <div className="w-full max-w-[1700px] mx-auto space-y-12">
        
        <div className="border-b border-white/5 pb-4 flex flex-wrap justify-between items-center gap-4 text-left">
          <div>
            <span className="section-tag font-mono text-[10px]">Internal Content CMS Control Desk</span>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text uppercase">
              {editingPostId ? 'Modify Strategy Document Mode' : <><span className="font-anokha">EnMate</span> Authority Content Composer</>}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={() => router.push('/admin')} className="btn px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold font-mono tracking-wide transition-all">
              ← Main Terminal
            </button>
            <div className="bg-[#0e0a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-lg min-w-[240px]">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke={seoScore >= 80 ? '#22c55e' : seoScore >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="4" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - seoScore / 100)} className="transition-all duration-500" />
                </svg>
                <span className="absolute font-mono text-sm font-bold text-white">{seoScore}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block">Real-time SEO Matrix</span>
                <span className={`text-xs font-bold ${seoScore >= 80 ? 'text-green-400' : seoScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {seoScore >= 80 ? 'Production Ready' : seoScore >= 50 ? 'Needs Tweaking' : 'Optimization Required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FORM FIELD CONFIGURATIONS */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* METADATA QUICK CREATION LAYER PANEL */}
            <div className="bg-[#0b0816]/90 border border-white/5 rounded-3xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-md text-left">
              <form onSubmit={handleCreateCategory} className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">Create Fresh Master Category</label>
                <div className="flex gap-2">
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} disabled={isCreatingMeta} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[var(--accent-soft)] outline-none" placeholder="e.g., Performance Automation" required />
                  <button type="submit" disabled={isCreatingMeta} className="btn px-4 py-2 bg-white/5 border border-white/10 hover:border-[var(--accent-soft)] rounded-xl text-xs font-bold text-white whitespace-nowrap transition-all">
                    + Add Cat
                  </button>
                </div>
              </form>

              <form onSubmit={handleCreateTag} className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">Create Fresh Structural Tag</label>
                <div className="flex gap-2">
                  <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} disabled={isCreatingMeta} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[var(--accent-soft)] outline-none" placeholder="e.g., LeadGen" required />
                  <button type="submit" disabled={isCreatingMeta} className="btn px-4 py-2 bg-white/5 border border-white/10 hover:border-[var(--accent-soft)] rounded-xl text-xs font-bold text-white whitespace-nowrap transition-all">
                    + Add Tag
                  </button>
                </div>
              </form>
            </div>

            {/* MAIN CONTENT COMPOSER FRAME */}
            <form onSubmit={handleSubmit} className="bg-[#07040f]/80 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-xl text-left">
              
              {seoWarnings.length > 0 && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">⚠️ Search Engine Compliance Optimization Tips:</span>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-amber-200/70 font-light">
                    {seoWarnings.slice(0, 3).map((warn, i) => <li key={i}>{warn}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Content Master Title</label>
                  <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" placeholder="e.g., Tactical Local SEO Implementation Blueprints" required />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Target URL Slug Address Prefix</label>
                  <input type="text" value={formData.slug} className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-neutral-400 font-mono outline-none cursor-not-allowed" placeholder="auto-generated-slug-path" readOnly />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Assign Core Category Hub</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" required>
                    <option value="">-- Choose Vertical Area Hub --</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Target Strategy Focus Keyword</label>
                  <input type="text" value={formData.focusKeyword} onChange={(e) => setFormData(p => ({ ...p, focusKeyword: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" placeholder="e.g., SEO Tips Kottakkal" required />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">Map Relational Structural Tags Index</label>
                <div className="flex flex-wrap gap-2 bg-black/20 p-3 rounded-2xl border border-white/5">
                  {availableTags.map(tag => {
                    const isActive = selectedTags.includes(tag.id);
                    return (
                      <button type="button" key={tag.id} onClick={() => toggleTagSelection(tag.id)} className={`btn px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-[var(--accent)] text-white border border-[var(--accent-soft)] shadow-md' : 'bg-white/5 text-neutral-400 border border-white/5 hover:border-white/10'}`}>
                        {isActive ? `✓ ${tag.name}` : `+ ${tag.name}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Featured Landing Image (Mandatory: Strict WebP format | Min: 1200×630px)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input type="file" accept=".webp" onChange={handleImageUpload} className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent)] file:text-white" />
                  {uploadStatus && <span className="text-xs text-[var(--accent-soft)] font-medium font-mono">{uploadStatus}</span>}
                </div>
                
                {formData.featuredImage && (
                  <div className="mt-4 p-2 bg-black/40 border border-white/10 rounded-xl max-w-sm">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-green-400 mb-2 block">✓ Active Upload Source Asset Preview ({formData.imgWidth}×{formData.imgHeight}px)</span>
                    <img src={formData.featuredImage} alt="Live active input preview" className="w-full aspect-[21/9] object-cover rounded-lg border border-white/5 shadow-inner" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Media Alt Validation Text</label>
                <input type="text" value={formData.altText} onChange={(e) => setFormData(p => ({ ...p, altText: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" placeholder="Provide accurate alternate descriptive parameters..." required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    <span>Meta Title Index</span>
                    <span className={formData.metaTitle.length >= 50 && formData.metaTitle.length <= 60 ? 'text-green-400' : 'text-amber-400'}>{formData.metaTitle.length}/60</span>
                  </label>
                  <input type="text" value={formData.metaTitle} onChange={(e) => setFormData(p => ({ ...p, metaTitle: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" required />
                </div>

                <div>
                  <label className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    <span>Meta Description Index</span>
                    <span className={formData.metaDescription.length >= 130 && formData.metaDescription.length <= 160 ? 'text-green-400' : 'text-amber-400'}>{formData.metaDescription.length}/160</span>
                  </label>
                  <input type="text" value={formData.metaDescription} onChange={(e) => setFormData(p => ({ ...p, metaDescription: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" required />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Article Brief Excerpt Summary</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none resize-none" placeholder="Summary snippet for main listings card layout blocks..." required />
              </div>

              <div className="flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                <div className="editor-toolbar flex flex-wrap items-center gap-1 p-2 bg-neutral-900/90 border-b border-white/10">
                  <button type="button" onClick={() => handleToolbarFormat('h2')} className="btn px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--accent)] text-xs font-bold text-white transition-all">[H2]</button>
                  <button type="button" onClick={() => handleToolbarFormat('h3')} className="btn px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--accent)] text-xs font-bold text-white transition-all">[H3]</button>
                  <button type="button" onClick={() => handleToolbarFormat('p')} className="btn px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--accent)] text-xs font-bold text-white transition-all">[P]</button>
                  <div className="w-px h-5 bg-white/10 mx-1"></div>
                  <button type="button" onClick={() => { document.execCommand('bold'); }} className="btn px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--accent)] text-xs font-bold text-white transition-all"><i className="fas fa-bold"></i></button>
                  <button type="button" onClick={() => { document.execCommand('italic'); }} className="btn px-3 py-1.5 rounded bg-white/5 hover:bg-[var(--accent)] text-xs italic text-white transition-all"><i className="fas fa-italic"></i></button>
                </div>

                <div 
                  ref={editorRef}
                  contentEditable={true}
                  onInput={() => setFormData(prev => ({ ...prev, content: editorRef.current?.innerHTML || '' }))}
                  className="w-full min-h-[350px] max-h-[600px] overflow-y-auto p-4 bg-black/40 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-[var(--accent-soft)] blog-rich-surface font-sans leading-relaxed"
                  data-placeholder="Type natively. Highlight text streams to bind top styles matrix anchors smoothly..."
                  style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 font-medium cursor-pointer">
                    <input type="radio" name="status" value="draft" checked={formData.status === 'draft'} onChange={() => setFormData(p => ({ ...p, status: 'draft' }))} className="accent-[var(--accent)]" /> Keep Draft
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-300 font-medium cursor-pointer">
                    <input type="radio" name="status" value="published" checked={formData.status === 'published'} onChange={() => setFormData(p => ({ ...p, status: 'published' }))} className="accent-[var(--accent)]" /> Publish Live
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {editingPostId && (
                    <button type="button" onClick={() => {
                      setEditingPostId(null);
                      if (editorRef.current) editorRef.current.innerHTML = '';
                      setSelectedTags([]);
                      setFormData({
                        title: '', slug: '', excerpt: '', content: '', focusKeyword: '',
                        metaTitle: '', metaDescription: '', altText: '', authorName: 'EnMate Team',
                        categoryId: '', status: 'draft', featuredImage: '', imgWidth: 0, imgHeight: 0
                      });
                    }} className="btn btn-outline text-xs uppercase tracking-wider font-bold px-5 py-3">
                      Cancel Edit
                    </button>
                  )}
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary text-xs uppercase tracking-wider font-bold px-8 py-3 disabled:opacity-50">
                    {isSubmitting ? 'Syncing Tables...' : editingPostId ? 'Apply Update Record' : 'Execute Data Injection'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: CANVAS PREVIEW RENDERING */}
          <aside className="xl:col-span-5 bg-[#040208]/90 border border-white/5 rounded-3xl p-6 lg:p-8 lg:sticky lg:top-24 h-auto max-h-[85vh] overflow-y-auto shadow-2xl text-left hidden xl:block">
            <span className="text-[10px] font-bold text-[var(--accent-soft)] uppercase tracking-widest block mb-4 border-b border-white/5 pb-2">✨ Live Workspace Canvas Preview Rendering</span>
            
            {formData.title ? (
              <article className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold bg-white/5 px-3 py-1 rounded-full text-[var(--accent-soft)] border border-white/5 uppercase tracking-wider">
                    {categories.find(c => c.id === formData.categoryId)?.name || 'Unassigned Hub'}
                  </span>
                  <h1 className="text-2xl font-bold mt-4 leading-tight text-white">{formData.title}</h1>
                  
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedTags.map(id => (
                        <span key={id} className="text-[9px] font-mono text-[var(--text-muted)] bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                          #{availableTags.find(t => t.id === id)?.name}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-[11px] text-neutral-400 font-mono mt-3">
                    <span>By {formData.authorName}</span> • <span>{getReadingTime(formData.content)} min read optimization</span>
                  </div>
                </div>

                {formData.featuredImage && (
                  <div className="w-full aspect-[21/9] rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                    <img src={formData.featuredImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {formData.excerpt && (
                  <div className="p-4 bg-white/[0.02] border-l-2 border-[var(--accent-soft)] rounded-r-xl text-xs text-neutral-300 italic leading-relaxed">
                    {formData.excerpt}
                  </div>
                )}

                <div 
                  className="prose prose-invert max-w-none text-xs text-neutral-300 space-y-4 leading-relaxed font-light font-sans border-t border-white/5 pt-4 blog-rich-surface"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-neutral-500 font-mono italic">[Body stream visualization text layers will compile dynamically here...]</p>' }}
                />
              </article>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-neutral-500 font-mono text-xs">
                <i className="fas fa-file-signature text-2xl mb-2 text-neutral-600"></i>
                <span>Populate field items on the form configuration arrays to compile live preview data sets...</span>
              </div>
            )}
          </aside>
        </div>

        {/* ACTIVE PUBLICATIONS REGISTRY REGISTERS */}
        <section className="bg-[#07040f]/80 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl text-left backdrop-blur-xl">
          <div>
            <span className="section-tag font-mono text-[10px]">Database Content Records</span>
            <h2 className="text-xl md:text-2xl font-bold text-white">Active Publications Registry</h2>
          </div>

          <div className="overflow-x-auto w-full border border-white/5 rounded-2xl bg-black/20">
            <table className="w-full text-xs md:text-sm text-neutral-300">
              <thead className="text-[10px] uppercase tracking-wider bg-neutral-900/50 text-[var(--text-muted)] font-bold border-b border-white/5">
                <tr>
                  <th scope="col" className="px-6 py-4">Article Title Context</th>
                  <th scope="col" className="px-6 py-4">Assigned Category</th>
                  <th scope="col" className="px-6 py-4">URL Slug Path</th>
                  <th scope="col" className="px-6 py-4 text-center">Lifecycle Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-light">
                {adminPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 font-mono text-xs text-neutral-500 italic">
                      No articles detected inside database index rows.
                    </td>
                  </tr>
                ) : (
                  adminPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-sm truncate">{post.title}</td>
                      <td className="px-6 py-4 text-[var(--text-muted)]">
                        {categories.find(c => c.id === post.category_id)?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px] text-neutral-400">{post.slug}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            type="button" 
                            onClick={() => loadPostToWorkspace(post.id)}
                            className="btn px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-[var(--accent)] hover:border-[var(--accent-soft)] transition-all font-medium text-[11px]"
                          >
                            Edit Profile
                          </button>
                          <button 
                            type="button" 
                            onClick={() => executeDataPurgeWorkflow(post)}
                            className="btn px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-medium text-[11px]"
                          >
                            Purge Row
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
