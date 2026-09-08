import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published');
    
  return posts?.map((post) => ({ slug: post.slug })) || [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const { data: post } = await supabase
    .from('blogs')
    .select('title, meta_title, meta_description, featured_image, alt_text')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) return {};

  return {
    title: `${post.meta_title} | EnMate Blog`,
    description: post.meta_description,
    alternates: { canonical: `https://enmate.in/blog/${slug}` },
    openGraph: {
      title: post.meta_title,
      description: post.meta_description,
      url: `https://enmate.in/blog/${slug}`,
      type: 'article',
      images: [{ url: post.featured_image, width: 1200, height: 630, alt: post.alt_text }]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title,
      description: post.meta_description,
      images: [post.featured_image]
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params;

  const { data: post } = await supabase
    .from('blogs')
    .select(`
      id, title, slug, content, excerpt, featured_image, featured_image_width, featured_image_height, alt_text, 
      author_name, reading_time, published_at, category_id,
      categories ( name, slug )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) notFound();

  const relatedPromise = supabase
    .from('blogs')
    .select('id, title, slug, featured_image, featured_image_width, featured_image_height, alt_text, published_at')
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .eq('status', 'published')
    .limit(3);

  const viewIncrementPromise = supabase.rpc('increment_blog_views', { post_slug: slug });

  const [relatedResult] = await Promise.all([relatedPromise, viewIncrementPromise]);
  const related = (relatedResult as any)?.data || [];

  const headingMatches = [...(post.content || '').matchAll(/<h[23][^>]*>(.*?)<\/h[23]>/g)];
  const tableOfContents = headingMatches.map((match) => {
    const text = match[1].replace(/<[^>]*>/g, '');
    const cleanId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { text, level: match[0].substring(2, 3), id: cleanId };
  });

  let processedContent = post.content || '';
  headingMatches.forEach((match) => {
    const rawText = match[1];
    const cleanId = rawText.replace(/<[^>]*>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const modifiedHeading = match[0].replace(/>/, ` id="${cleanId}">`);
    processedContent = processedContent.replace(match[0], modifiedHeading);
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.featured_image],
    "datePublished": post.published_at,
    "author": [{ "@type": "Person", "name": post.author_name }],
    "publisher": {
      "@type": "Organization",
      "name": "EnMate Digital Marketing Agency",
      "logo": { "@type": "ImageObject", "url": "https://enmate.in/logos/site-logo.png" }
    },
    "description": post.excerpt
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="min-h-screen bg-[#05030a] text-[var(--text-main)] pt-32 pb-24 font-sans selection:bg-[var(--accent)] selection:text-white">
        <div className="container max-w-[1100px]">
          
          <nav className="text-xs text-[var(--text-muted)] mb-6 flex items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
            <span className="text-white font-medium truncate max-w-[250px] md:max-w-none">{post.title}</span>
          </nav>

          <article>
            <header className="mb-10 text-left space-y-3">
              {post.categories && (
                <span className="text-xs font-bold text-[var(--accent-soft)] uppercase tracking-wider block font-mono">
                  {(post.categories as any).name}
                </span>
              )}
              <h1 className="text-2xl md:text-5xl font-bold leading-tight text-white tracking-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-2 border-b border-white/5 pb-4 font-mono">
                <span>By {post.author_name}</span>
                <span className="opacity-30">|</span>
                <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="opacity-30">|</span>
                <span>{post.reading_time} Min Read</span>
              </div>
            </header>

            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-12 border border-white/5 shadow-2xl bg-neutral-900">
              <Image
                src={post.featured_image}
                alt={post.alt_text || post.title}
                width={post.featured_image_width || 1200}
                height={post.featured_image_height || 630}
                className="object-cover w-full h-full"
                priority={true}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {tableOfContents.length > 0 && (
                <aside className="lg:col-span-4 lg:sticky lg:top-28 p-5 bg-[#07040f]/60 border border-white/5 rounded-2xl hidden lg:block text-left space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 font-mono">Table of Contents</h4>
                  <ul className="space-y-2.5 text-xs text-[var(--text-muted)] font-light">
                    {tableOfContents.map((item, idx) => (
                      <li key={idx} style={{ paddingLeft: item.level === '3' ? '12px' : '0px' }}>
                        <a href={`#${item.id}`} className="hover:text-[var(--accent-soft)] transition-colors block leading-relaxed">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}

              <section 
                className={`lg:col-span-${tableOfContents.length > 0 ? '8' : '12'} blog-rich-surface max-w-none text-sm md:text-base leading-relaxed text-[var(--secondary)] text-left`}
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </div>
          </article>

          {related.length > 0 && (
            <div className="mt-20 border-t border-white/5 pt-12 text-left space-y-8">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel: any, i: number) => (
                  <Link 
                    href={`/blog/${rel.slug}`} 
                    key={rel.id} 
                    className="block p-4 group rounded-xl bg-white/[0.01] border border-white/5 hover:border-[var(--accent-soft)]/20 transition-all duration-300 hover:-translate-y-1 shadow-lg relative overflow-hidden"
                    style={{
                      animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
                      animationDelay: `${0.1 * (i + 1)}s`
                    }}
                  >
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-neutral-900 border border-white/5">
                      <Image 
                        src={rel.featured_image} 
                        alt={rel.alt_text || rel.title} 
                        width={rel.featured_image_width || 1200} 
                        height={rel.featured_image_height || 630} 
                        className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-[1.02]" 
                      />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[var(--accent-soft)] transition-colors line-clamp-2 leading-snug tracking-tight">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
