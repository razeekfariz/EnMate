'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import AIPackageManager from '@/components/admin/AIPackageManager';
import { processPastedContent } from '@/lib/blog-cleaner';

// Types
type TabType = 'overview' | 'blog' | 'portfolio' | 'taxonomy' | 'ai_packages';

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
  created_at?: string;
  categories?: any;
}

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
  created_at?: string;
  portfolio_categories?: any;
}

function ManagementPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State
  const initialTab = (searchParams.get('tab') as TabType) || 'overview';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Scoped Management App (PWA) State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Data Collections
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [portfolioCategories, setPortfolioCategories] = useState<PortfolioCategory[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  // Search & Filter States
  const [blogSearchQuery, setBlogSearchQuery] = useState<string>('');
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState<string>('');
  const [blogStatusFilter, setBlogStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // --- BLOG FORM STATE ---
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [blogSubmitting, setBlogSubmitting] = useState<boolean>(false);
  const [blogUploadStatus, setBlogUploadStatus] = useState<string>('');
  const [seoScore, setSeoScore] = useState<number>(0);
  const [seoWarnings, setSeoWarnings] = useState<string[]>([]);
  const [newBlogCatName, setNewBlogCatName] = useState<string>('');
  const [newBlogTagName, setNewBlogTagName] = useState<string>('');
  const [isCreatingBlogMeta, setIsCreatingBlogMeta] = useState<boolean>(false);
  const blogEditorRef = useRef<HTMLDivElement | null>(null);

  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
    altText: '',
    authorName: 'EnMate Team',
    categoryId: '',
    status: 'draft',
    featuredImage: '',
    imgWidth: 1200,
    imgHeight: 630,
  });

  // --- PORTFOLIO FORM STATE ---
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioSubmitting, setPortfolioSubmitting] = useState<boolean>(false);
  const [portfolioUploadStatus, setPortfolioUploadStatus] = useState<string>('');
  const [newPortCatName, setNewPortCatName] = useState<string>('');
  const [isCreatingPortMeta, setIsCreatingPortMeta] = useState<boolean>(false);

  const [portfolioForm, setPortfolioForm] = useState<{
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
    title: '',
    slug: '',
    description: '',
    clientName: '',
    categoryId: '',
    projectUrl: '',
    images: [],
    altText: '',
    isFeatured: false,
    imgWidth: 1200,
    imgHeight: 630,
  });

  // 1. Authentication Check & Session Validation
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
        } else {
          setIsAuthenticated(true);
          setUserEmail(session.user?.email || 'team@enmate.in');
          await loadAllData();
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setAuthChecking(false);
      }
    };
    verifySession();

    // Check standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(Boolean(isStandaloneMode));

    // Register admin-scoped service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/admin-sw.js', { scope: '/admin' })
        .catch((err) => console.log('Admin SW note:', err));
    }

    // Capture native PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [router]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Sync tab change with URL parameter
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  // 2. Comprehensive Data Loader
  const loadAllData = async () => {
    try {
      const [catRes, tagRes, blogRes, portCatRes, portRes] = await Promise.all([
        supabase.from('categories').select('id, name, slug').order('name', { ascending: true }),
        supabase.from('tags').select('id, name, slug').order('name', { ascending: true }),
        supabase.from('blogs').select('id, title, slug, status, featured_image, category_id, created_at, categories(name)').order('created_at', { ascending: false }),
        supabase.from('portfolio_categories').select('id, name, slug').order('name', { ascending: true }),
        supabase.from('portfolio').select('*, portfolio_categories(name)').order('created_at', { ascending: false }),
      ]);

      if (catRes.data) setCategories(catRes.data as Category[]);
      if (tagRes.data) setTags(tagRes.data as Tag[]);
      if (blogRes.data) setPosts(blogRes.data as unknown as AdminPost[]);
      if (portCatRes.data) setPortfolioCategories(portCatRes.data as PortfolioCategory[]);
      if (portRes.data) setPortfolioItems(portRes.data as unknown as PortfolioItem[]);
    } catch (err) {
      console.error('Error fetching management portal data:', err);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    if (!confirm('Sign out from EnMate Team Management Portal?')) return;
    await supabase.auth.signOut();
    router.replace('/login');
  };

  // ==========================================
  // --- BLOG ENGINE HANDLERS ---
  // ==========================================

  // SEO Score Calculation
  useEffect(() => {
    if (!isAuthenticated) return;
    let score = 0;
    const warnings: string[] = [];

    if (!blogForm.title) {
      setSeoScore(0);
      setSeoWarnings(['Enter an article headline to begin SEO auditing.']);
      return;
    }

    if (blogForm.metaTitle.length >= 50 && blogForm.metaTitle.length <= 60) {
      score += 20;
    } else {
      warnings.push('Meta Title length is out of optimal search boundary (50-60 chars).');
    }

    if (blogForm.metaDescription.length >= 130 && blogForm.metaDescription.length <= 160) {
      score += 20;
    } else {
      warnings.push('Meta Description length should be 130-160 characters for best CTR.');
    }

    if (blogForm.focusKeyword) {
      score += 15;
      const cleanContent = blogForm.content.toLowerCase();
      const keywordCount = (cleanContent.match(new RegExp(blogForm.focusKeyword.toLowerCase(), 'g')) || []).length;
      if (keywordCount >= 3) {
        score += 15;
      } else {
        warnings.push(`Focus keyword frequency is low (${keywordCount} instances). Aim for 3+ occurrences.`);
      }
    } else {
      warnings.push('Primary focus keyword is missing.');
    }

    if (blogForm.altText && blogForm.altText.length > 8) {
      score += 15;
    } else {
      warnings.push('Featured image alt text is required for accessibility and image search.');
    }

    if (blogForm.content.includes('<h2') || blogForm.content.includes('<h3')) {
      score += 15;
    } else {
      warnings.push('Structure content with subheadings (H2 / H3).');
    }

    setSeoScore(score);
    setSeoWarnings(warnings);
  }, [blogForm.title, blogForm.metaTitle, blogForm.metaDescription, blogForm.focusKeyword, blogForm.altText, blogForm.content, isAuthenticated]);

  const handleBlogTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setBlogForm(prev => ({
      ...prev,
      title: val,
      slug: cleanSlug,
      metaTitle: val.substring(0, 60),
    }));
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev => (prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]));
  };

  const getReadingTime = (htmlText: string) => {
    if (!htmlText) return 1;
    const cleanText = htmlText.replace(/<[^>]*>/g, '');
    const words = cleanText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 220));
  };

  // Enhanced Rich Text Editor Format & Paste Handlers
  const handleFormatCommand = (command: string, value: string | undefined = undefined) => {
    if (!blogEditorRef.current) return;
    blogEditorRef.current.focus();
    document.execCommand(command, false, value);
    setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
  };

  const handleHeadingFormat = (headingTag: 'h2' | 'h3' | 'h4' | 'p' | 'blockquote') => {
    if (!blogEditorRef.current) return;
    blogEditorRef.current.focus();
    document.execCommand('formatBlock', false, `<${headingTag}>`);
    setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
  };

  const handleHighlightFormat = () => {
    if (!blogEditorRef.current) return;
    blogEditorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) {
      alert('Select the text you wish to highlight first.');
      return;
    }

    const parent = selection.anchorNode?.parentElement;
    if (parent && (parent.tagName === 'MARK' || parent.classList.contains('blog-highlight'))) {
      const textNode = document.createTextNode(parent.textContent || '');
      parent.replaceWith(textNode);
    } else {
      const mark = document.createElement('mark');
      mark.className = 'blog-highlight';
      mark.textContent = selectedText;
      range.deleteContents();
      range.insertNode(mark);
    }
    setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
  };

  const handleInsertCallout = () => {
    if (!blogEditorRef.current) return;
    blogEditorRef.current.focus();
    const selection = window.getSelection();
    const selectedText = selection?.toString() || 'Enter strategic key takeaway or valuable insight here.';
    const calloutHTML = `<div class="blog-callout"><strong>💡 Key Strategic Insight:</strong> ${selectedText}</div><p><br></p>`;
    document.execCommand('insertHTML', false, calloutHTML);
    setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
  };

  const handleInsertLink = () => {
    if (!blogEditorRef.current) return;
    const url = prompt('Enter target URL or link (e.g. https://enmate.in/services):');
    if (!url) return;
    blogEditorRef.current.focus();
    document.execCommand('createLink', false, url);
    setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
  };

  const handleInsertDivider = () => {
    if (!blogEditorRef.current) return;
    blogEditorRef.current.focus();
    document.execCommand('insertHorizontalRule', false);
    setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
  };

  const handlePasteBlogContent = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cleanHTML = processPastedContent(e.clipboardData);
    if (!cleanHTML) return;

    if (document.queryCommandSupported && document.queryCommandSupported('insertHTML')) {
      document.execCommand('insertHTML', false, cleanHTML);
    } else {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanHTML;
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);
      }
    }

    if (blogEditorRef.current) {
      setBlogForm(prev => ({ ...prev, content: blogEditorRef.current?.innerHTML || '' }));
    }
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBlogUploadStatus('Verifying image dimensions...');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      const imageInstance = new (window as any).Image();
      imageInstance.src = event.target?.result as string;
      imageInstance.onload = async function () {
        const width = (this as any).width;
        const height = (this as any).height;

        if (width < 1200 || height < 630) {
          alert(`Image Quality Alert: Featured images should be at least 1200×630px. Uploaded: ${width}×${height}px.`);
        }

        try {
          setBlogUploadStatus('Uploading asset to storage...');
          const fileExt = file.name.split('.').pop();
          const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `featured/${uniqueName}`;

          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(filePath);

          setBlogForm(prev => ({
            ...prev,
            featuredImage: publicUrl,
            imgWidth: width,
            imgHeight: height,
          }));
          setBlogUploadStatus('Featured image verified and ready.');
        } catch (err: any) {
          setBlogUploadStatus('Image upload failed.');
          alert(`Storage upload error: ${err.message}`);
        }
      };
    };
  };

  const handleLoadPostToEdit = async (postId: string) => {
    try {
      const { data: currentPost, error } = await supabase
        .from('blogs')
        .select('*, blog_tags(tag_id)')
        .eq('id', postId)
        .single();

      if (error) throw error;

      setEditingPostId(currentPost.id);
      setBlogForm({
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
        imgHeight: currentPost.featured_image_height || 630,
      });

      if (blogEditorRef.current) {
        blogEditorRef.current.innerHTML = currentPost.content || '';
      }

      const activeAssociatedTags = (currentPost.blog_tags || []).map((t: any) => t.tag_id);
      setSelectedTags(activeAssociatedTags);

      switchTab('blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(`Error loading post: ${err.message}`);
    }
  };

  const handleResetBlogForm = () => {
    setEditingPostId(null);
    if (blogEditorRef.current) blogEditorRef.current.innerHTML = '';
    setSelectedTags([]);
    setBlogForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      focusKeyword: '',
      metaTitle: '',
      metaDescription: '',
      altText: '',
      authorName: 'EnMate Team',
      categoryId: '',
      status: 'draft',
      featuredImage: '',
      imgWidth: 1200,
      imgHeight: 630,
    });
    setBlogUploadStatus('');
  };

  const handleDeletePost = async (post: AdminPost) => {
    const confirmation = confirm(`Are you sure you want to delete "${post.title}"?\n\nThis will remove relational tags and media.`);
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

      alert('Article deleted successfully.');
      if (editingPostId === post.id) handleResetBlogForm();
      loadAllData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.featuredImage) {
      alert('Please upload a featured header image for the article.');
      return;
    }

    setBlogSubmitting(true);
    let targetSlug = blogForm.slug || blogForm.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

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
        title: blogForm.title,
        slug: targetSlug,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        featured_image: blogForm.featuredImage,
        featured_image_width: blogForm.imgWidth,
        featured_image_height: blogForm.imgHeight,
        alt_text: blogForm.altText,
        meta_title: blogForm.metaTitle,
        meta_description: blogForm.metaDescription,
        focus_keyword: blogForm.focusKeyword,
        author_name: blogForm.authorName || 'EnMate Team',
        reading_time: getReadingTime(blogForm.content),
        status: blogForm.status,
        category_id: blogForm.categoryId || null,
        published_at: blogForm.status === 'published' ? new Date().toISOString() : null,
      };

      let activeBlogId = editingPostId;

      if (editingPostId) {
        const { error: updateError } = await supabase.from('blogs').update(postRowObject).eq('id', editingPostId);
        if (updateError) throw updateError;
        await supabase.from('blog_tags').delete().eq('blog_id', editingPostId);
      } else {
        const { data: newPost, error: postError } = await supabase.from('blogs').insert([postRowObject]).select().single();
        if (postError) throw postError;
        if (newPost) activeBlogId = newPost.id;
      }

      if (selectedTags.length > 0 && activeBlogId) {
        const tagJunctionRows = selectedTags.map(tagId => ({
          blog_id: activeBlogId,
          tag_id: tagId,
        }));
        await supabase.from('blog_tags').insert(tagJunctionRows);
      }

      alert(editingPostId ? 'Article successfully updated!' : `Success! Article published: /blog/${targetSlug}`);
      handleResetBlogForm();
      loadAllData();
    } catch (err: any) {
      alert(`Failed to save article: ${err.message}`);
    } finally {
      setBlogSubmitting(false);
    }
  };

  // Inline Category Creator (Blog)
  const handleCreateBlogCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogCatName.trim()) return;
    setIsCreatingBlogMeta(true);
    const catSlug = newBlogCatName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    try {
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert([{ name: newBlogCatName.trim(), slug: catSlug }])
        .select()
        .single();
      if (error) throw error;
      setCategories(prev => [...prev, newCat as Category]);
      setBlogForm(prev => ({ ...prev, categoryId: newCat.id }));
      setNewBlogCatName('');
    } catch (err: any) {
      alert(`Category creation failed: ${err.message}`);
    } finally {
      setIsCreatingBlogMeta(false);
    }
  };

  // Inline Tag Creator (Blog)
  const handleCreateBlogTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTagName.trim()) return;
    setIsCreatingBlogMeta(true);
    const tagSlug = newBlogTagName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    try {
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert([{ name: newBlogTagName.trim(), slug: tagSlug }])
        .select()
        .single();
      if (error) throw error;
      setTags(prev => [...prev, newTag as Tag]);
      setSelectedTags(prev => [...prev, newTag.id]);
      setNewBlogTagName('');
    } catch (err: any) {
      alert(`Tag creation failed: ${err.message}`);
    } finally {
      setIsCreatingBlogMeta(false);
    }
  };

  // ==========================================
  // --- PORTFOLIO ENGINE HANDLERS ---
  // ==========================================

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPortfolioUploadStatus(`Uploading ${files.length} project asset(s)...`);

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

      setPortfolioForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      setPortfolioUploadStatus('Project visual assets uploaded successfully.');
    } catch (err: any) {
      setPortfolioUploadStatus('Upload failed.');
      alert(`Portfolio upload error: ${err.message}`);
    }
  };

  const handleRemovePortfolioImage = (indexToRemove: number) => {
    setPortfolioForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleResetPortfolioForm = () => {
    setEditingPortfolioId(null);
    setPortfolioForm({
      title: '',
      slug: '',
      description: '',
      clientName: '',
      categoryId: '',
      projectUrl: '',
      images: [],
      altText: '',
      isFeatured: false,
      imgWidth: 1200,
      imgHeight: 630,
    });
    setPortfolioUploadStatus('');
  };

  const handleLoadPortfolioToEdit = (item: PortfolioItem) => {
    setEditingPortfolioId(item.id);
    setPortfolioForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      clientName: item.client_name || '',
      categoryId: item.category_id || '',
      projectUrl: item.project_url || '',
      images: item.images || [],
      altText: item.alt_text || '',
      isFeatured: !!item.is_featured,
      imgWidth: item.img_width || 1200,
      imgHeight: item.img_height || 630,
    });
    switchTab('portfolio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePortfolio = async (item: PortfolioItem) => {
    if (!confirm(`Are you sure you want to delete portfolio project "${item.title}"?`)) return;

    try {
      if (item.images && item.images.length > 0) {
        for (const url of item.images) {
          const path = url.split('/storage/v1/object/public/portfolio-images/')[1];
          if (path) await supabase.storage.from('portfolio-images').remove([path]);
        }
      }

      const { error } = await supabase.from('portfolio').delete().eq('id', item.id);
      if (error) throw error;

      alert('Portfolio project deleted.');
      if (editingPortfolioId === item.id) handleResetPortfolioForm();
      loadAllData();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portfolioForm.images.length === 0) {
      alert('Please upload at least one showcase visual image.');
      return;
    }

    setPortfolioSubmitting(true);
    let finalSlug = portfolioForm.slug || portfolioForm.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    try {
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

        if (!match || match.id === editingPortfolioId) {
          isUnique = true;
          finalSlug = currentCheckSlug;
        } else {
          counter++;
        }
      }

      const payload = {
        title: portfolioForm.title,
        slug: finalSlug,
        description: portfolioForm.description,
        client_name: portfolioForm.clientName || 'EnMate Showcase Client',
        category_id: portfolioForm.categoryId || null,
        project_url: portfolioForm.projectUrl,
        images: portfolioForm.images,
        alt_text: portfolioForm.altText || `${portfolioForm.title} by EnMate`,
        is_featured: portfolioForm.isFeatured,
        img_width: portfolioForm.imgWidth,
        img_height: portfolioForm.imgHeight,
      };

      const { error } = editingPortfolioId
        ? await supabase.from('portfolio').update(payload).eq('id', editingPortfolioId)
        : await supabase.from('portfolio').insert([payload]);

      if (error) throw error;

      alert(editingPortfolioId ? 'Portfolio case study updated!' : 'New portfolio project published live!');
      handleResetPortfolioForm();
      loadAllData();
    } catch (err: any) {
      alert(`Failed to save portfolio project: ${err.message}`);
    } finally {
      setPortfolioSubmitting(false);
    }
  };

  // Inline Category Creator (Portfolio)
  const handleCreatePortCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortCatName.trim()) return;
    setIsCreatingPortMeta(true);
    const cleanSlug = newPortCatName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

    try {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .insert([{ name: newPortCatName.trim(), slug: cleanSlug }])
        .select()
        .single();

      if (error) throw error;
      setPortfolioCategories(p => [...p, data as PortfolioCategory]);
      setPortfolioForm(p => ({ ...p, categoryId: data.id }));
      setNewPortCatName('');
    } catch (err: any) {
      alert(`Category creation failed: ${err.message}`);
    } finally {
      setIsCreatingPortMeta(false);
    }
  };

  // Delete Category / Tag helpers for Taxonomy tab
  const handleDeleteBlogCategory = async (id: string, name: string) => {
    if (!confirm(`Delete blog category "${name}"?`)) return;
    await supabase.from('categories').delete().eq('id', id);
    loadAllData();
  };

  const handleDeleteBlogTag = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    await supabase.from('tags').delete().eq('id', id);
    loadAllData();
  };

  const handleDeletePortCategory = async (id: string, name: string) => {
    if (!confirm(`Delete portfolio category "${name}"?`)) return;
    await supabase.from('portfolio_categories').delete().eq('id', id);
    loadAllData();
  };

  // Loading Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#040208] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase">
            Securing EnMate Team Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Filtered lists for tables
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) || post.slug.toLowerCase().includes(blogSearchQuery.toLowerCase());
    const matchesStatus = blogStatusFilter === 'all' || post.status === blogStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPortfolio = portfolioItems.filter(item => {
    return item.title.toLowerCase().includes(portfolioSearchQuery.toLowerCase()) || (item.client_name && item.client_name.toLowerCase().includes(portfolioSearchQuery.toLowerCase()));
  });

  const publishedBlogCount = posts.filter(p => p.status === 'published').length;
  const draftBlogCount = posts.filter(p => p.status === 'draft').length;
  const featuredPortCount = portfolioItems.filter(p => p.is_featured).length;

  return (
    <div className="min-h-screen bg-[#040208] text-white pt-24 pb-16 px-4 md:px-8 selection:bg-[var(--accent)] selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* ─── 1. TOP MASTER HEADER & TEAM NAVIGATION ─── */}
        <header className="bg-[#090515]/90 border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-soft)]">
                Unified Team Control Hub
              </span>
              <span className="text-[10px] font-mono text-neutral-500">• {userEmail}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="font-anokha gradient-text">EnMate</span> Management Portal
            </h1>
          </div>

          {/* Quick Links, App Install & Sign Out */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* PWA App Installation / Mode Badge */}
            {isStandalone ? (
              <div
                title="Running in Standalone Management App Mode"
                className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono inline-flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <i className="fas fa-desktop text-[11px]" />
                <span>App Mode</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                title="Install Management Portal as Standalone Desktop / Mobile App"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)]/30 to-[#8338ec]/30 hover:from-[var(--accent)] hover:to-[#8338ec] border border-[var(--accent)]/50 text-white text-xs font-mono transition-all inline-flex items-center gap-2 shadow-[0_0_15px_rgba(207,4,102,0.25)] group"
              >
                <i className="fas fa-download text-[10px] group-hover:translate-y-0.5 transition-transform" />
                <span>Install Portal App</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-external-link-alt text-[10px]" />
              <span>Live Site</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-mono text-rose-300 hover:text-rose-200 transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-arrow-right-from-bracket text-[10px]" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* ─── 2. MASTER MODULE SELECTOR TABS ─── */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
          <button
            onClick={() => switchTab('overview')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white shadow-[0_0_20px_rgba(207,4,102,0.4)]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <i className="fas fa-chart-pie text-xs" />
            <span>Overview Hub</span>
          </button>

          <button
            onClick={() => switchTab('blog')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'blog'
                ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white shadow-[0_0_20px_rgba(207,4,102,0.4)]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <i className="fas fa-pen-nib text-xs" />
            <span>Blog Publishing & SEO</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-md bg-black/40 text-white font-mono">
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('portfolio')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white shadow-[0_0_20px_rgba(207,4,102,0.4)]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <i className="fas fa-briefcase text-xs" />
            <span>Portfolio Showcase</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-md bg-black/40 text-white font-mono">
              {portfolioItems.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('taxonomy')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'taxonomy'
                ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white shadow-[0_0_20px_rgba(207,4,102,0.4)]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <i className="fas fa-tags text-xs" />
            <span>Taxonomy & Tags</span>
          </button>

          <button
            onClick={() => switchTab('ai_packages')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ai_packages'
                ? 'bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white shadow-[0_0_20px_rgba(207,4,102,0.4)]'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            <i className="fas fa-sparkles text-xs text-[var(--accent-soft)]" />
            <span>EnMate AI & Packages</span>
          </button>
        </nav>

        {/* ─── 3. TAB CONTENT ─── */}

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW DASHBOARD                                 */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Published Articles</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                    <i className="fas fa-globe" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-white">{publishedBlogCount}</div>
                  <span className="text-[10px] font-mono text-neutral-500">{draftBlogCount} drafts pending</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Portfolio Projects</span>
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent-soft)] flex items-center justify-center text-sm">
                    <i className="fas fa-folder-open" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-white">{portfolioItems.length}</div>
                  <span className="text-[10px] font-mono text-neutral-500">{featuredPortCount} featured spotlights</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Taxonomy Categories</span>
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-sm">
                    <i className="fas fa-layer-group" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-black text-white">{categories.length + portfolioCategories.length}</div>
                  <span className="text-[10px] font-mono text-neutral-500">{tags.length} relational tags</span>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Team Workspace</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">
                    <i className="fas fa-shield-halved" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-bold text-white truncate">{userEmail}</div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Cloud Core Synchronized
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Launchers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  handleResetBlogForm();
                  switchTab('blog');
                }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#090515] to-[#120826] border border-white/10 hover:border-[var(--accent)] text-left group transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent-soft)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-plus" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-soft)] transition-colors">
                  Compose New Blog Article
                </h3>
                <p className="text-xs text-neutral-400 font-light mt-1">
                  Draft an SEO-optimized authority article and publish it to the live feed.
                </p>
              </button>

              <button
                onClick={() => {
                  handleResetPortfolioForm();
                  switchTab('portfolio');
                }}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#090515] to-[#120826] border border-white/10 hover:border-[var(--accent)] text-left group transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent-soft)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-folder-plus" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-soft)] transition-colors">
                  Add Portfolio Case Study
                </h3>
                <p className="text-xs text-neutral-400 font-light mt-1">
                  Upload visual assets, add client credits, and showcase real-world client work.
                </p>
              </button>

              <button
                onClick={() => switchTab('taxonomy')}
                className="p-6 rounded-3xl bg-gradient-to-br from-[#090515] to-[#120826] border border-white/10 hover:border-[var(--accent)] text-left group transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent-soft)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fas fa-tags" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[var(--accent-soft)] transition-colors">
                  Organize Metadata & Tags
                </h3>
                <p className="text-xs text-neutral-400 font-light mt-1">
                  Structure content taxonomies across blog posts and client portfolio galleries.
                </p>
              </button>
            </div>

            {/* Side-by-Side Recent Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Articles */}
              <div className="p-5 md:p-6 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <i className="fas fa-newspaper text-[var(--accent-soft)]" />
                    <span>Recent Blog Articles</span>
                  </h3>
                  <button onClick={() => switchTab('blog')} className="text-xs font-mono text-[var(--accent-soft)] hover:underline">
                    View All ({posts.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {posts.slice(0, 5).map(post => (
                    <div key={post.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {post.status}
                          </span>
                          <span className="text-xs font-bold text-white truncate block">{post.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block truncate">/blog/{post.slug}</span>
                      </div>
                      <button
                        onClick={() => handleLoadPostToEdit(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all shrink-0"
                      >
                        <i className="fas fa-pen text-[10px] mr-1" /> Edit
                      </button>
                    </div>
                  ))}
                  {posts.length === 0 && (
                    <p className="text-xs font-mono text-neutral-500 text-center py-6">No blog articles published yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Portfolio */}
              <div className="p-5 md:p-6 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <i className="fas fa-briefcase text-[var(--accent-soft)]" />
                    <span>Recent Portfolio Case Studies</span>
                  </h3>
                  <button onClick={() => switchTab('portfolio')} className="text-xs font-mono text-[var(--accent-soft)] hover:underline">
                    View All ({portfolioItems.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {portfolioItems.slice(0, 5).map(item => (
                    <div key={item.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {item.is_featured && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400">
                              ★ Featured
                            </span>
                          )}
                          <span className="text-xs font-bold text-white truncate block">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block truncate">
                          Client: {item.client_name || 'EnMate Case'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleLoadPortfolioToEdit(item)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all shrink-0"
                      >
                        <i className="fas fa-pen text-[10px] mr-1" /> Edit
                      </button>
                    </div>
                  ))}
                  {portfolioItems.length === 0 && (
                    <p className="text-xs font-mono text-neutral-500 text-center py-6">No portfolio projects published yet.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BLOG PUBLISHING & SEO STUDIO                       */}
        {/* ========================================================= */}
        {activeTab === 'blog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 8 Cols: Blog Editor Form */}
            <div className="lg:col-span-8 p-5 sm:p-7 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {editingPostId ? 'Edit Article Document' : 'Compose New Authority Blog'}
                  </h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    SEO-scored article composer with real-time semantic analysis.
                  </p>
                </div>
                {editingPostId && (
                  <button
                    onClick={handleResetBlogForm}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300"
                  >
                    + New Post Mode
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveBlog} className="space-y-5">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={handleBlogTitleChange}
                    placeholder="e.g. Scaling Brand Velocity: High-Impact Funnels for 2026"
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none"
                    required
                  />
                </div>

                {/* Slug & Author Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={blogForm.slug}
                      onChange={(e) => setBlogForm(p => ({ ...p, slug: e.target.value }))}
                      placeholder="auto-generated-slug"
                      className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-xs text-neutral-300 font-mono outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Author Byline
                    </label>
                    <input
                      type="text"
                      value={blogForm.authorName}
                      onChange={(e) => setBlogForm(p => ({ ...p, authorName: e.target.value }))}
                      placeholder="EnMate Team"
                      className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-xs text-neutral-300 outline-none"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Article Summary / Excerpt
                  </label>
                  <textarea
                    rows={2}
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm(p => ({ ...p, excerpt: e.target.value }))}
                    placeholder="A brief 1-2 sentence lead summary displayed in article cards..."
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 outline-none resize-none"
                  />
                </div>

                {/* Rich Content Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Article Body Content *
                    </label>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Est. {getReadingTime(blogForm.content)} min read
                    </span>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="p-2.5 bg-black/70 border border-white/10 rounded-t-2xl flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Headings */}
                      <button
                        type="button"
                        onClick={() => handleHeadingFormat('h2')}
                        title="Main Heading (H2 Section)"
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-mono font-bold text-white transition-all border border-white/5 flex items-center gap-1"
                      >
                        <span>H2</span>
                        <span className="hidden sm:inline text-[10px] font-normal text-neutral-400">Main</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHeadingFormat('h3')}
                        title="Subheading (H3 Subsection)"
                        className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-mono font-bold text-white transition-all border border-white/5 flex items-center gap-1"
                      >
                        <span>H3</span>
                        <span className="hidden sm:inline text-[10px] font-normal text-neutral-400">Sub</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHeadingFormat('h4')}
                        title="Minor Heading (H4)"
                        className="px-2 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-mono font-bold text-neutral-300 transition-all border border-white/5"
                      >
                        H4
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHeadingFormat('p')}
                        title="Standard Paragraph (P)"
                        className="px-2 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-mono text-neutral-300 transition-all border border-white/5"
                      >
                        P
                      </button>

                      <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

                      {/* Formatting */}
                      <button
                        type="button"
                        onClick={() => handleFormatCommand('bold')}
                        title="Bold Text"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs font-bold text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-bold" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFormatCommand('italic')}
                        title="Italic Text"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs italic text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-italic" />
                      </button>

                      {/* Highlight Tool */}
                      <button
                        type="button"
                        onClick={handleHighlightFormat}
                        title="Highlight Text (Glowing Callout Accent)"
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--accent)]/20 hover:bg-[var(--accent)]/35 text-[var(--accent-soft)] hover:text-white text-xs font-mono font-semibold transition-all border border-[var(--accent)]/40 flex items-center gap-1.5"
                      >
                        <i className="fas fa-highlighter text-[11px]" />
                        <span>Highlight</span>
                      </button>

                      <div className="w-[1px] h-5 bg-white/10 mx-0.5" />

                      {/* Lists */}
                      <button
                        type="button"
                        onClick={() => handleFormatCommand('insertUnorderedList')}
                        title="Bullet List"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-list-ul" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFormatCommand('insertOrderedList')}
                        title="Numbered List"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-list-ol" />
                      </button>

                      {/* Quotes & Callouts */}
                      <button
                        type="button"
                        onClick={() => handleHeadingFormat('blockquote')}
                        title="Blockquote"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-quote-left text-[11px]" />
                      </button>

                      <button
                        type="button"
                        onClick={handleInsertCallout}
                        title="Insert Key Strategic Callout Box"
                        className="px-2 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 hover:text-white text-xs font-mono transition-all border border-purple-500/30 flex items-center gap-1"
                      >
                        <i className="fas fa-lightbulb text-[10px]" />
                        <span className="hidden md:inline">Callout</span>
                      </button>

                      {/* Link & Divider */}
                      <button
                        type="button"
                        onClick={handleInsertLink}
                        title="Insert Link"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs text-neutral-300 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-link text-[11px]" />
                      </button>

                      <button
                        type="button"
                        onClick={handleInsertDivider}
                        title="Insert Horizontal Divider"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs text-neutral-300 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-minus text-[11px]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleFormatCommand('removeFormat')}
                        title="Clear Formatting"
                        className="w-7 h-7 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] text-xs text-neutral-400 hover:text-white transition-all border border-white/5 flex items-center justify-center"
                      >
                        <i className="fas fa-eraser text-[11px]" />
                      </button>
                    </div>

                    {/* Auto-Paste Clean Badge */}
                    <span className="text-[10px] font-mono text-neutral-400 hidden xl:flex items-center gap-1 opacity-80">
                      <i className="fas fa-wand-magic-sparkles text-[var(--accent-soft)]" />
                      <span>ChatGPT & Markdown Paste Ready</span>
                    </span>
                  </div>

                  {/* Editable Canvas with Universal Paste Normalizer */}
                  <div
                    ref={blogEditorRef}
                    contentEditable
                    onInput={(e) => setBlogForm(p => ({ ...p, content: (e.target as HTMLElement).innerHTML }))}
                    onPaste={handlePasteBlogContent}
                    className="blog-rich-surface min-h-[300px] max-h-[600px] overflow-y-auto bg-[#070312]/80 border border-white/10 border-t-0 rounded-b-2xl p-5 text-sm text-neutral-200 leading-relaxed focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Featured Image Upload */}
                <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Featured Header Image (Min 1200×630px) *
                    </label>
                    {blogUploadStatus && (
                      <span className="text-[10px] font-mono text-[var(--accent-soft)]">{blogUploadStatus}</span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBlogImageUpload}
                    className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[var(--accent)] file:text-white hover:file:opacity-90"
                  />

                  {blogForm.featuredImage && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 max-w-sm">
                      <img src={blogForm.featuredImage} alt="Featured Header" className="w-full h-36 object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                        {blogForm.imgWidth}×{blogForm.imgHeight}px
                      </span>
                    </div>
                  )}

                  <input
                    type="text"
                    value={blogForm.altText}
                    onChange={(e) => setBlogForm(p => ({ ...p, altText: e.target.value }))}
                    placeholder="SEO Image Alt Text (e.g. EnMate Performance Marketing Chart)"
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-600 outline-none mt-2"
                  />
                </div>

                {/* Categories & Tags Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  
                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Category
                    </label>
                    <select
                      value={blogForm.categoryId}
                      onChange={(e) => setBlogForm(p => ({ ...p, categoryId: e.target.value }))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    {/* Inline Create Category */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newBlogCatName}
                        onChange={(e) => setNewBlogCatName(e.target.value)}
                        placeholder="+ Add category"
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreateBlogCategory}
                        disabled={isCreatingBlogMeta || !newBlogCatName.trim()}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Tags Multi-Selector */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Relational Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/10">
                      {tags.map(t => {
                        const isSelected = selectedTags.includes(t.id);
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => toggleTagSelection(t.id)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors ${
                              isSelected
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-white/5 text-neutral-400 hover:text-white'
                            }`}
                          >
                            #{t.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Inline Create Tag */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newBlogTagName}
                        onChange={(e) => setNewBlogTagName(e.target.value)}
                        placeholder="+ Add tag"
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreateBlogTag}
                        disabled={isCreatingBlogMeta || !newBlogTagName.trim()}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                </div>

                {/* SEO Configuration Sub-Section */}
                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent-soft)] block">
                    Search Engine Optimization (SEO)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={blogForm.focusKeyword}
                      onChange={(e) => setBlogForm(p => ({ ...p, focusKeyword: e.target.value }))}
                      placeholder="Focus Search Keyword (e.g. Digital Marketing Kottakkal)"
                      className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none"
                    />

                    <input
                      type="text"
                      value={blogForm.metaTitle}
                      onChange={(e) => setBlogForm(p => ({ ...p, metaTitle: e.target.value }))}
                      placeholder="Meta Title Tag (50-60 characters)"
                      className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={blogForm.metaDescription}
                    onChange={(e) => setBlogForm(p => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="Search Meta Description (130-160 characters)"
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none resize-none"
                  />
                </div>

                {/* Status & Submit Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-xs font-mono text-neutral-400">Status:</label>
                    <select
                      value={blogForm.status}
                      onChange={(e) => setBlogForm(p => ({ ...p, status: e.target.value }))}
                      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                    >
                      <option value="draft">Draft Mode</option>
                      <option value="published">Published (Live)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleResetBlogForm}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={blogSubmitting}
                      className="btn btn-primary px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      <div className="btn-glow-layer" />
                      <span className="btn-content-nodes">
                        {blogSubmitting ? 'Saving Document...' : editingPostId ? 'Update Article' : 'Publish Article'}
                      </span>
                    </button>
                  </div>
                </div>

              </form>

            </div>

            {/* Right 4 Cols: SEO Audit & Published Articles Manager */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Real-Time SEO Grade Card */}
              <div className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Live SEO Grade
                  </span>
                  <span className={`text-lg font-mono font-black ${seoScore >= 80 ? 'text-emerald-400' : seoScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {seoScore} / 100
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${seoScore >= 80 ? 'bg-emerald-400' : seoScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{ width: `${seoScore}%` }}
                  />
                </div>

                <div className="space-y-1 pt-1 max-h-36 overflow-y-auto">
                  {seoWarnings.map((w, idx) => (
                    <div key={idx} className="text-[10px] font-mono text-neutral-400 flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                  {seoWarnings.length === 0 && (
                    <p className="text-[10px] font-mono text-emerald-400">All primary SEO parameters in optimal compliance.</p>
                  )}
                </div>
              </div>

              {/* Articles Archive Table */}
              <div className="p-5 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Articles ({filteredPosts.length})
                  </h3>
                  <select
                    value={blogStatusFilter}
                    onChange={(e: any) => setBlogStatusFilter(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-neutral-300 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={blogSearchQuery}
                  onChange={(e) => setBlogSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none"
                />

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 space-y-2 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-white line-clamp-2">{post.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {post.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-white/5">
                        <Link href={`/blog/${post.slug}`} target="_blank" className="hover:text-[var(--accent-soft)]">
                          View Live ↗
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoadPostToEdit(post.id)}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post)}
                            className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredPosts.length === 0 && (
                    <p className="text-xs font-mono text-neutral-500 text-center py-6">No matching articles found.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PORTFOLIO SHOWCASE MANAGER                         */}
        {/* ========================================================= */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Cols: Portfolio Form */}
            <div className="lg:col-span-7 p-5 sm:p-7 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {editingPortfolioId ? 'Modify Portfolio Case Study' : 'Deploy New Portfolio Case Study'}
                  </h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Showcase client projects with multi-asset galleries and credentials.
                  </p>
                </div>
                {editingPortfolioId && (
                  <button
                    onClick={handleResetPortfolioForm}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300"
                  >
                    + New Project
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePortfolio} className="space-y-5">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Kottakkal Ayurveda Global Branding & Digital Portal"
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none"
                    required
                  />
                </div>

                {/* Client Name & Project URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Client / Organization
                    </label>
                    <input
                      type="text"
                      value={portfolioForm.clientName}
                      onChange={(e) => setPortfolioForm(p => ({ ...p, clientName: e.target.value }))}
                      placeholder="e.g. Kottakkal Wellness Group"
                      className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Live Project URL
                    </label>
                    <input
                      type="url"
                      value={portfolioForm.projectUrl}
                      onChange={(e) => setPortfolioForm(p => ({ ...p, projectUrl: e.target.value }))}
                      placeholder="https://clientbrand.com"
                      className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Category & Featured Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Showroom Category
                    </label>
                    <select
                      value={portfolioForm.categoryId}
                      onChange={(e) => setPortfolioForm(p => ({ ...p, categoryId: e.target.value }))}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                    >
                      <option value="">Select Category...</option>
                      {portfolioCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    {/* Inline Create Portfolio Category */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newPortCatName}
                        onChange={(e) => setNewPortCatName(e.target.value)}
                        placeholder="+ Add category"
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCreatePortCategory}
                        disabled={isCreatingPortMeta || !newPortCatName.trim()}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Featured Spotlight Toggle */}
                  <div className="flex flex-col justify-center space-y-2">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Featured Spotlight
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl bg-black/40 border border-white/10">
                      <input
                        type="checkbox"
                        checked={portfolioForm.isFeatured}
                        onChange={(e) => setPortfolioForm(p => ({ ...p, isFeatured: e.target.checked }))}
                        className="w-4 h-4 rounded accent-[var(--accent)] cursor-pointer"
                      />
                      <span className="text-xs font-mono text-white font-bold">
                        Feature in Homepage Spotlight
                      </span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Project Case Study Overview *
                  </label>
                  <textarea
                    rows={4}
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Detail the strategy, scope of development, branding results, or client scaling outcomes..."
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl p-4 text-xs text-white placeholder-neutral-600 outline-none resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* Multi-Image Upload */}
                <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                      Project Media Assets * ({portfolioForm.images.length} added)
                    </label>
                    {portfolioUploadStatus && (
                      <span className="text-[10px] font-mono text-[var(--accent-soft)]">{portfolioUploadStatus}</span>
                    )}
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePortfolioImageUpload}
                    className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-[var(--accent)] file:text-white hover:file:opacity-90"
                  />

                  {/* Thumbnail gallery */}
                  {portfolioForm.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                      {portfolioForm.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 group aspect-video">
                          <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolioImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    type="text"
                    value={portfolioForm.altText}
                    onChange={(e) => setPortfolioForm(p => ({ ...p, altText: e.target.value }))}
                    placeholder="Showcase Image Alt Text (e.g. EnMate Client Architecture Layout)"
                    className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-600 outline-none mt-2"
                  />
                </div>

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleResetPortfolioForm}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={portfolioSubmitting}
                    className="btn btn-primary px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    <div className="btn-glow-layer" />
                    <span className="btn-content-nodes">
                      {portfolioSubmitting ? 'Saving Showcase...' : editingPortfolioId ? 'Update Case Study' : 'Publish to Portfolio'}
                    </span>
                  </button>
                </div>

              </form>

            </div>

            {/* Right 5 Cols: Live Portfolio Showcase Grid */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Portfolio Items ({filteredPortfolio.length})
                </h3>
              </div>

              <input
                type="text"
                value={portfolioSearchQuery}
                onChange={(e) => setPortfolioSearchQuery(e.target.value)}
                placeholder="Search projects or clients..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none"
              />

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredPortfolio.map(item => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 space-y-2.5 transition-all">
                    
                    {item.images && item.images.length > 0 && (
                      <div className="w-full h-32 rounded-xl overflow-hidden border border-white/5">
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.is_featured && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400">
                              ★ Featured
                            </span>
                          )}
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                          {item.portfolio_categories?.name || 'Uncategorized'} • {item.client_name || 'EnMate Case'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 font-light line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-2 border-t border-white/5">
                      <Link href="/portfolio" target="_blank" className="hover:text-[var(--accent-soft)]">
                        View Live ↗
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLoadPortfolioToEdit(item)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePortfolio(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
                {filteredPortfolio.length === 0 && (
                  <p className="text-xs font-mono text-neutral-500 text-center py-8">No portfolio items found.</p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: METADATA & TAXONOMY HUB                            */}
        {/* ========================================================= */}
        {activeTab === 'taxonomy' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Panel 1: Blog Categories */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-folder text-[var(--accent-soft)]" />
                  <span>Blog Categories ({categories.length})</span>
                </h3>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateBlogCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newBlogCatName}
                  onChange={(e) => setNewBlogCatName(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={isCreatingBlogMeta || !newBlogCatName.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-mono font-bold uppercase disabled:opacity-40"
                >
                  Add
                </button>
              </form>

              {/* List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {categories.map(cat => (
                  <div key={cat.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{cat.name}</span>
                      <span className="text-[9px] font-mono text-neutral-500">slug: {cat.slug || cat.name.toLowerCase()}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteBlogCategory(cat.id, cat.name)}
                      className="text-neutral-500 hover:text-rose-400 p-1 text-xs"
                      title="Delete category"
                    >
                      <i className="fas fa-trash-alt text-[10px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Blog Tags */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-hashtag text-[var(--accent-soft)]" />
                  <span>Blog Relational Tags ({tags.length})</span>
                </h3>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreateBlogTag} className="flex gap-2">
                <input
                  type="text"
                  value={newBlogTagName}
                  onChange={(e) => setNewBlogTagName(e.target.value)}
                  placeholder="New tag name..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={isCreatingBlogMeta || !newBlogTagName.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-mono font-bold uppercase disabled:opacity-40"
                >
                  Add
                </button>
              </form>

              {/* List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {tags.map(tag => (
                  <div key={tag.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">#{tag.name}</span>
                      <span className="text-[9px] font-mono text-neutral-500">slug: {tag.slug || tag.name.toLowerCase()}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteBlogTag(tag.id, tag.name)}
                      className="text-neutral-500 hover:text-rose-400 p-1 text-xs"
                      title="Delete tag"
                    >
                      <i className="fas fa-trash-alt text-[10px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 3: Portfolio Categories */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#090515]/90 border border-white/10 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-layer-group text-[var(--accent-soft)]" />
                  <span>Portfolio Categories ({portfolioCategories.length})</span>
                </h3>
              </div>

              {/* Add form */}
              <form onSubmit={handleCreatePortCategory} className="flex gap-2">
                <input
                  type="text"
                  value={newPortCatName}
                  onChange={(e) => setNewPortCatName(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={isCreatingPortMeta || !newPortCatName.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-mono font-bold uppercase disabled:opacity-40"
                >
                  Add
                </button>
              </form>

              {/* List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {portfolioCategories.map(pCat => (
                  <div key={pCat.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{pCat.name}</span>
                      <span className="text-[9px] font-mono text-neutral-500">slug: {pCat.slug || pCat.name.toLowerCase()}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePortCategory(pCat.id, pCat.name)}
                      className="text-neutral-500 hover:text-rose-400 p-1 text-xs"
                      title="Delete category"
                    >
                      <i className="fas fa-trash-alt text-[10px]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ENMATE AI & STRUCTURED PACKAGES                     */}
        {/* ========================================================= */}
        {activeTab === 'ai_packages' && (
          <AIPackageManager />
        )}

        {/* ─── PWA INSTALLATION GUIDANCE MODAL ─── */}
        {showInstallModal && (
          <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0c061a] border border-[var(--accent)]/40 rounded-3xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(207,4,102,0.3)] space-y-5 animate-scaleUp text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#090515] border border-[var(--accent)]/50 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(207,4,102,0.4)]">
                    <img src="/logos/site-logo.png" alt="EnMate Admin App" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">Install Management Portal</h3>
                    <p className="text-[11px] text-neutral-400">Standalone App for EnMate Team</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="w-7 h-7 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center text-xs transition-all"
                >
                  <i className="fas fa-xmark" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-neutral-300 font-sans">
                <p className="leading-relaxed">
                  Install the <strong className="text-white font-mono">EnMate Management Portal</strong> on your device for instant 1-click desktop & mobile access without browser chrome.
                </p>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <i className="fas fa-laptop text-[var(--accent-soft)] mt-0.5" />
                    <div>
                      <strong className="text-white block text-[11px]">Chrome / Edge (Desktop):</strong>
                      <span className="text-[11px] text-neutral-400">
                        Click the <strong>Install icon</strong> (computer with arrow) in your browser address bar at the top right.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <i className="fab fa-apple text-neutral-200 mt-0.5" />
                    <div>
                      <strong className="text-white block text-[11px]">iPhone / iPad (Safari):</strong>
                      <span className="text-[11px] text-neutral-400">
                        Tap the <strong>Share</strong> button <i className="fas fa-arrow-up-from-bracket text-[10px] mx-1" /> and select <strong>&quot;Add to Home Screen&quot;</strong>.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <i className="fab fa-android text-emerald-400 mt-0.5" />
                    <div>
                      <strong className="text-white block text-[11px]">Android (Chrome):</strong>
                      <span className="text-[11px] text-neutral-400">
                        Tap the 3 dots menu <i className="fas fa-ellipsis-vertical text-[10px] mx-1" /> and select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] text-white text-xs font-semibold font-mono shadow-md hover:opacity-90 transition-all"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UnifiedManagementPortal() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040208] flex items-center justify-center text-white font-mono text-xs">
          Loading EnMate Management Portal...
        </div>
      }
    >
      <ManagementPortalContent />
    </Suspense>
  );
}
