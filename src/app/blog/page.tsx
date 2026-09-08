import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '../../lib/supabase';
import BlogListingClient from './BlogListingClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'The EnMate Intelligence Feed | Digital Strategy & Engineering Intel',
  description: 'Data-driven execution methodologies, premium branding frameworks, and technical web architectures engineered out of Kottakkal, Kerala to scale business operations globally.',
  alternates: { canonical: 'https://enmate.in/blog' },
};

export default async function BlogListingPage() {
  let posts: any[] = [];
  let databaseError = false;

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        id, title, slug, excerpt, featured_image, featured_image_width, featured_image_height, alt_text, reading_time, published_at,
        categories ( name )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    posts = data || [];
  } catch (err) {
    console.error('Server Data Pipeline Disconnection:', err);
    databaseError = true;
  }

  if (databaseError) {
    return (
      <div className="min-h-screen bg-[#05030a] flex items-center justify-center text-[var(--text-muted)] font-mono text-xs">
        <p>System error: Failed to map backend content registry rows. Verify cloud connectivity constraints.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] text-[var(--text-main)] pt-32 pb-24 font-sans selection:bg-[var(--accent)] selection:text-white">
      <div className="container max-w-[1200px] space-y-16">
        
        <header className="text-left space-y-3 max-w-[750px]">
          <span className="section-tag badge inline-block font-mono">Knowledge Platform</span>
          <h1 className="text-3xl md:text-5xl font-bold gradient-text leading-none tracking-tight">
            The <span className="font-anokha">EnMate</span> Intelligence Feed
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed font-light">
            Data-driven execution methodologies, premium branding frameworks, and technical web architectures engineered to scale business operations globally.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-left font-mono text-xs text-[var(--text-muted)] italic">No articles published yet inside core database rows.</p>
        ) : (
          <BlogListingClient initialPosts={posts} />
        )}

      </div>
    </div>
  );
}
