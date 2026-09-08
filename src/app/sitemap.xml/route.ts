import { supabase } from '../../lib/supabase';

export async function GET() {
  const baseUrl = 'https://www.enmate.in';

  // Core Static Framework Pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/tools/website-cost-calculator', priority: '0.9', changefreq: 'monthly' },
  ];

  // Core Service Matrix Offerings
  const servicePages = [
    'web-development',
    'graphic-design',
    'video-editing',
    'social-media-marketing',
    'seo',
  ].map((slug) => ({
    url: `/services/${slug}`,
    priority: '0.9',
    changefreq: 'monthly',
  }));

  // Fetch all live database articles dynamically from Supabase
  let dynamicBlogPages: { url: string; priority: string; changefreq: string }[] = [];
  try {
    const { data: posts } = await supabase
      .from('blogs')
      .select('slug')
      .eq('status', 'published');

    if (posts) {
      dynamicBlogPages = posts.map((post: { slug: string }) => ({
        url: `/blog/${post.slug}`,
        priority: '0.7',
        changefreq: 'weekly',
      }));
    }
  } catch (err) {
    console.error('Sitemap live stream database fetch failed:', err);
  }

  const allPages = [...staticPages, ...servicePages, ...dynamicBlogPages];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
