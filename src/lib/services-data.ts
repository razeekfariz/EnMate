export interface ServiceStep {
  step: string;
  detail: string;
}

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceItem {
  title: string;
  metaTitle: string;
  metaDescription: string;
  tagline: string;
  overview: string;
  icon: string;
  benefits: string[];
  process: ServiceStep[];
  technologies: string[];
  faqs: ServiceFAQ[];
}

export const services: Record<string, ServiceItem> = {
  'web-development': {
    title: 'Website Development Services',
    metaTitle: 'Website Development Services in Kottakkal, Kerala | EnMate',
    metaDescription: 'Custom website development, landing pages, and web applications built for performance, credibility, and lead generation. Serving Kottakkal, Kerala & worldwide.',
    tagline: 'Custom Web Architecture Built for Conversion',
    overview: 'We engineer fast, scalable websites and web applications designed to turn visitors into customers — not just digital brochures, but performance-driven business assets.',
    icon: 'fas fa-laptop-code',
    benefits: [
      'Lightning-fast load speeds that improve SEO rankings',
      'Mobile-first responsive design across every device',
      'Custom-coded, no bloated page builders',
      'Built-in lead capture and conversion structures',
      'Scalable architecture that grows with your business',
    ],
    process: [
      { step: '01. Discovery', detail: 'We map your business goals, target audience, and technical requirements.' },
      { step: '02. Design', detail: 'Custom UI/UX design tailored to your brand identity and conversion goals.' },
      { step: '03. Development', detail: 'Clean, scalable code built with modern frameworks for speed and reliability.' },
      { step: '04. Launch & Support', detail: 'Deployment, testing, and ongoing technical support post-launch.' },
    ],
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'Node.js', 'Supabase'],
    faqs: [
      { q: 'How long does a website take to build?', a: 'Most business websites take 2-4 weeks depending on complexity and content readiness.' },
      { q: 'Do you provide hosting and domain setup?', a: 'Yes, we can handle full deployment, domain configuration, and hosting setup for you.' },
      { q: 'Will my website be mobile-friendly?', a: 'Every website we build is fully responsive and tested across mobile, tablet, and desktop.' },
    ],
  },

  'graphic-design': {
    title: 'Branding & Graphic Design Services',
    metaTitle: 'Branding & Graphic Design Services in Kerala | EnMate',
    metaDescription: 'Professional branding, visual identity systems, and creative design services that establish a premium brand presence. Based in Kottakkal, serving worldwide.',
    tagline: 'Visual Identity Systems That Command Attention',
    overview: 'We craft cohesive brand identities — logos, color systems, and marketing materials — that make your business instantly recognizable and credible.',
    icon: 'fas fa-palette',
    benefits: [
      'Memorable logo and visual identity design',
      'Consistent brand guidelines across all platforms',
      'Print & digital marketing material design',
      'Premium aesthetic that builds trust instantly',
      'Custom illustrations and graphic assets',
    ],
    process: [
      { step: '01. Brand Discovery', detail: 'Understanding your values, audience, and market positioning.' },
      { step: '02. Concept Development', detail: 'Multiple design directions explored before refinement.' },
      { step: '03. Identity System', detail: 'Logo, typography, color palette, and usage guidelines finalized.' },
      { step: '04. Asset Delivery', detail: 'Full brand kit delivered in all required formats.' },
    ],
    technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma', 'Canva'],
    faqs: [
      { q: 'What\'s included in a branding package?', a: 'Logo design, color palette, typography system, and a brand guideline document.' },
      { q: 'Can you redesign an existing brand?', a: 'Yes, we offer full rebranding services while preserving brand equity where valuable.' },
      { q: 'Do you design social media templates?', a: 'Yes, we create consistent templates for Instagram, Facebook, and LinkedIn.' },
    ],
  },

  'video-editing': {
    title: 'Video & Creative Production Services',
    metaTitle: 'Video Editing & Production Services in Kerala | EnMate',
    metaDescription: 'Cinematic promotional ads, social media reels, and high-impact motion graphics designed to engage modern audiences. Based in Kottakkal, Kerala.',
    tagline: 'Cinematic Content That Stops the Scroll',
    overview: 'From promotional ads to social reels, we produce video content engineered for engagement and built for the platforms your audience actually watches.',
    icon: 'fas fa-video',
    benefits: [
      'Scroll-stopping social media reels and shorts',
      'Cinematic promotional and brand videos',
      'Motion graphics and animated explainers',
      'Platform-optimized formats (Reels, Shorts, YouTube)',
      'Fast turnaround for time-sensitive campaigns',
    ],
    process: [
      { step: '01. Concept & Script', detail: 'Defining the narrative and key messaging for your video.' },
      { step: '02. Production/Sourcing', detail: 'Filming or sourcing footage and assets needed.' },
      { step: '03. Editing & Motion', detail: 'Professional editing, color grading, and motion graphics.' },
      { step: '04. Delivery', detail: 'Final exports optimized for each target platform.' },
    ],
    technologies: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
    faqs: [
      { q: 'Do you film on location?', a: 'Yes, we offer on-location filming in Kerala along with remote editing services worldwide.' },
      { q: 'What video lengths do you produce?', a: 'From 15-second reels to full-length promotional videos — formats are tailored per platform.' },
      { q: 'Can you edit raw footage we already have?', a: 'Yes, we offer editing-only services if you already have raw footage.' },
    ],
  },

  'social-media-marketing': {
    title: 'Digital Marketing & Growth Services',
    metaTitle: 'Social Media Marketing & Growth Services in Kerala | EnMate',
    metaDescription: 'Social media management, content strategy, and data-driven ad campaigns focused on customer acquisition and revenue growth. Kottakkal, Kerala based agency.',
    tagline: 'Growth Systems Built on Data, Not Guesswork',
    overview: 'We run social media management, content strategy, and paid ad campaigns engineered to acquire customers and compound revenue growth over time.',
    icon: 'fas fa-chart-line',
    benefits: [
      'Data-driven content strategy and posting calendars',
      'Paid ad campaigns optimized for conversions',
      'Audience growth and community engagement',
      'Performance tracking and monthly reporting',
      'Platform-specific strategy (Instagram, Facebook, Google Ads)',
    ],
    process: [
      { step: '01. Audit & Research', detail: 'Analyzing current presence, competitors, and audience behavior.' },
      { step: '02. Strategy Build', detail: 'Content pillars, posting cadence, and campaign structure defined.' },
      { step: '03. Execution', detail: 'Content creation, scheduling, and ad campaign deployment.' },
      { step: '04. Optimization', detail: 'Continuous testing and refinement based on performance data.' },
    ],
    technologies: ['Meta Ads Manager', 'Google Ads', 'Analytics Tools'],
    faqs: [
      { q: 'How soon will I see results?', a: 'Organic growth typically shows traction in 4-6 weeks; paid campaigns can drive immediate traffic.' },
      { q: 'Do you create the content too?', a: 'Yes, content creation is included as part of our social media management packages.' },
      { q: 'Can you manage ad budgets directly?', a: 'Yes, we manage ad spend allocation and optimization within your approved budget.' },
    ],
  },

  'seo': {
    title: 'SEO Optimization Services',
    metaTitle: 'SEO Services in Kerala | Search Engine Optimization | EnMate',
    metaDescription: 'Continuous SEO enhancements, Google Business Profile optimization, and technical SEO to improve search visibility. Based in Kottakkal, Kerala, serving worldwide.',
    tagline: 'Search Visibility Engineered for Long-Term Authority',
    overview: 'We implement technical SEO, content optimization, and local search strategies that compound your visibility on Google over time — not quick hacks, but durable authority.',
    icon: 'fas fa-globe',
    benefits: [
      'Technical SEO audits and fixes',
      'On-page content and keyword optimization',
      'Google Business Profile optimization',
      'Local SEO for regional search visibility',
      'Ongoing performance tracking and reporting',
    ],
    process: [
      { step: '01. SEO Audit', detail: 'Full technical and content audit of your existing site.' },
      { step: '02. Strategy', detail: 'Keyword research and content gap analysis.' },
      { step: '03. Implementation', detail: 'On-page, technical, and local SEO improvements deployed.' },
      { step: '04. Monitor & Refine', detail: 'Ongoing tracking and iterative optimization.' },
    ],
    technologies: ['Google Search Console', 'Google Analytics', 'Schema Markup'],
    faqs: [
      { q: 'How long does SEO take to show results?', a: 'SEO is a long-term strategy — most clients see meaningful movement within 3-6 months.' },
      { q: 'Do you optimize for local search?', a: 'Yes, local SEO and Google Business Profile optimization are core parts of our service.' },
      { q: 'Is SEO a one-time service?', a: 'SEO works best as an ongoing process since search algorithms and competitors constantly change.' },
    ],
  },
};

export function getServiceBySlug(slug: string): ServiceItem | null {
  return services[slug] || null;
}

export function getAllServiceSlugs(): string[] {
  return Object.keys(services);
}
