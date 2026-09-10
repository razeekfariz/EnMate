import { EnMatePackage, AIKnowledgeItem } from '../types/ai';

export const VERIFIED_PACKAGES: EnMatePackage[] = [
  {
    id: 'pkg-social-media-8000',
    package_name: 'Social Media Content Package',
    category: 'social_media',
    price: 8000,
    currency: 'INR',
    billing_type: 'monthly',
    description: 'A focused, high-impact monthly creative content production package designed to maintain an active, professional social media presence for growing businesses.',
    features: [
      '15 High-Quality Brand Posters',
      '2 AI-Generated Cinematic Videos',
      'Platform-Optimized Creatives for Instagram & Facebook',
      'Brand-Consistent Typography & Visual Theme'
    ],
    ideal_for: [
      'Small to medium businesses wanting consistent social content',
      'Brands looking for regular creative posters & engaging AI video reels',
      'Local businesses in Kerala or worldwide expanding their digital presence'
    ],
    not_ideal_for: [
      'Brands requiring full-time daily ad campaign management with multi-lakh budgets',
      'Custom website development (offered as a dedicated service)'
    ],
    keywords: [
      'social media',
      'social media package',
      '8000',
      '8000 package',
      '8,000',
      'posters',
      '15 posters',
      'ai videos',
      '2 ai videos',
      'instagram content',
      'creative package',
      'content creation',
      'monthly package',
      'pricing'
    ],
    badge: 'Most Popular',
    active: true,
    priority: 100,
  }
];

export const VERIFIED_KNOWLEDGE: AIKnowledgeItem[] = [
  {
    id: 'kb-company-overview',
    category: 'company',
    title: 'EnMate Overview',
    question: 'What is EnMate and what do you do?',
    answer: 'EnMate is a premium digital marketing agency based in Kottakkal, Kerala, India, serving clients locally and worldwide. We specialize in custom web architecture, visual branding identity layouts, creative video production, SEO optimization, and data-driven customer acquisition funnels.',
    keywords: ['what is enmate', 'about enmate', 'who are you', 'what do you do', 'company overview', 'kottakkal agency', 'about us'],
    priority: 100,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-pkg-social-media',
    category: 'packages',
    title: 'Social Media Content Package (₹8,000)',
    question: 'How much is your social media package and what does it include?',
    answer: 'Our official **Social Media Content Package** is priced at **₹8,000 / month**.\n\nIt includes:\n• **15 High-Quality Brand Posters**\n• **2 AI-Generated Cinematic Videos**\n\nIt is specifically designed for businesses wanting consistent, premium social media creatives to build brand authority and engage customers on Instagram, Facebook, and LinkedIn.',
    keywords: ['8000 package', 'package cost', 'social media package', 'pricing', 'how much', 'social media cost', 'package inclusions', '15 posters', '2 ai videos', 'what is included in 8000'],
    priority: 100,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-service-web-dev',
    category: 'web_development',
    title: 'Website Development Services',
    question: 'Do you build websites and web applications?',
    answer: 'Yes! EnMate engineers custom, high-performance websites and web applications using modern technologies like **Next.js, React, Tailwind CSS, and Supabase**.\n\nKey highlights:\n• Lightning-fast load speeds that enhance Google SEO rankings\n• Custom-coded architecture (no bloated page builders or slow templates)\n• 100% mobile-first responsive layout\n• Conversion-focused UX with built-in lead generation funnels\n• Typical turnaround is **2 to 4 weeks**.',
    keywords: ['website', 'web development', 'web design', 'build website', 'nextjs', 'custom software', 'landing page', 'ecommerce', 'web app'],
    priority: 95,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-service-seo',
    category: 'seo',
    title: 'SEO Optimization Services',
    question: 'Do you provide SEO services?',
    answer: 'Yes, we provide technical SEO, on-page keyword optimization, Google Business Profile optimization, and local SEO for businesses looking to compound organic Google rankings. We focus on durable search authority rather than quick, risky hacks.',
    keywords: ['seo', 'search engine optimization', 'google ranking', 'google business profile', 'local seo', 'organic traffic', 'google search'],
    priority: 90,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-service-branding',
    category: 'branding',
    title: 'Branding & Visual Identity Design',
    question: 'What branding and graphic design services do you offer?',
    answer: 'We craft cohesive brand identity systems including logo design, color typography systems, marketing collateral, brand guidelines, and custom illustrations that establish immediate trust and recognition for your brand.',
    keywords: ['branding', 'graphic design', 'logo design', 'brand identity', 'brochure', 'visual system', 'creatives'],
    priority: 90,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-service-video',
    category: 'video',
    title: 'Video & Creative Production Services',
    question: 'What video production and editing services do you provide?',
    answer: 'We produce cinematic promotional ads, scroll-stopping social media reels, and AI motion graphics. We offer on-location filming across Kerala as well as remote editing services for clients worldwide.',
    keywords: ['video editing', 'reels', 'promotional video', 'ai video', 'shorts', 'motion graphics', 'youtube video'],
    priority: 90,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-service-marketing',
    category: 'digital_marketing',
    title: 'Digital Marketing & Growth Funnels',
    question: 'How do you help businesses grow with digital marketing?',
    answer: 'We design data-driven customer acquisition funnels, combining content marketing, social media management, and paid ad campaigns (Meta Ads, Google Ads) focused on measurable ROI and compound business growth.',
    keywords: ['digital marketing', 'marketing', 'growth', 'meta ads', 'google ads', 'customer acquisition', 'paid ads', 'lead generation'],
    priority: 90,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-leadership-team',
    category: 'company',
    title: 'EnMate Leadership & Masterminds',
    question: 'Who is the boss or founder of EnMate and who built this AI?',
    answer: 'EnMate and this entire intelligent AI ecosystem are architected and driven by **Razeek Fariz** — the Founder, Mastermind, and Boss behind EnMate. He is a relentless digital architect and strategist who builds cutting-edge web technologies, custom software architectures, and compound growth engines for brands.\n\nOur creative powerhouse is led by **Muhammed Hanoon**, Creative Director of EnMate — an elite visual director who commands luxury brand identity systems, high-converting design, and cinematic video production.\n\nTogether, they engineer market-dominating digital solutions for ambitious brands worldwide.',
    keywords: ['who is the boss', 'founder', 'razeek', 'razeek fariz', 'who built this ai', 'who made this ai', 'builder', 'creator', 'owner', 'muhammed hanoon', 'hanoon', 'creative director', 'boss', 'leadership', 'who runs enmate', 'mastermind', 'ceo'],
    priority: 100,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-contact-details',
    category: 'company',
    title: 'How to Contact EnMate',
    question: 'How can I contact EnMate or talk to the team?',
    answer: 'You can reach the EnMate team directly via:\n• **WhatsApp / Phone**: +91 80751 86078\n• **Email**: contact@enmate.in\n• **Headquarters**: Kottakkal, Malappuram, Kerala, India (676503)\n\nWe would love to discuss your project and tailor the right digital growth strategy for your business.',
    keywords: ['contact', 'location', 'where are you', 'address', 'phone number', 'whatsapp', 'email', 'talk to enmate', 'hire', 'phone'],
    priority: 95,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-billing-software',
    category: 'billing_software',
    title: 'Custom Billing Software & Business Systems Development',
    question: 'Do you build custom billing software or invoicing tools?',
    answer: 'Yes! While EnMate builds bespoke custom software rather than generic off-the-shelf templates, we specialize in engineering custom **Billing & Invoicing Software, Client Portals, and Business Management Tools** tailored to your specific workflow.\n\nCapabilities include:\n• Custom GST/non-GST invoice generation & PDF exports\n• Automated WhatsApp & Email invoice dispatch to clients\n• Real-time payment tracking, receipt logging, and customer ledgers\n• Cloud-synchronized inventory & multi-branch staff permissions\n\nWhenever we launch new pre-packaged products or add features to our portal, I (EnMate AI) am updated immediately. Contact our team for a tailored demo and custom quote!',
    keywords: ['billing software', 'invoicing software', 'invoice generator', 'billing', 'pos software', 'gst billing', 'invoice tool', 'accounting tool', 'billing system', 'custom billing'],
    priority: 95,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-tool-website-calculator',
    category: 'tools',
    title: 'EnMate Website Cost Calculator Tool',
    question: 'How does the website cost calculator tool work?',
    answer: 'EnMate provides an interactive **Website Cost Calculator Tool** (`/tools/website-cost-calculator`) that empowers business owners to estimate their custom website investment instantly.\n\nIt calculates estimates based on:\n• Page volume & architectural complexity\n• Custom UI/UX design requirements & animations\n• Dynamic features (e.g. CMS, user authentication, e-commerce, payment gateways)\n• SEO optimization & search ranking infrastructure\n\nTry it directly on our website or ask me any question to help plan your project!',
    keywords: ['website calculator', 'cost calculator', 'website cost calculator', 'calculator tool', 'calculate cost', 'price calculator', 'estimate website', 'how much website'],
    priority: 95,
    active: true,
    visibility: 'public'
  },
  {
    id: 'kb-products-saas',
    category: 'products',
    title: 'Custom Digital Products & Bespoke Software Engineering',
    question: 'What digital products and custom software does EnMate build?',
    answer: 'EnMate engineers high-performance **Custom Web Applications, Digital Products & SaaS Systems** tailored to client business needs — from automated customer funnels and internal management dashboards to bespoke client portals.\n\nEvery product is engineered with modern full-stack architectures (Next.js, TypeScript, Supabase, Tailwind CSS) for zero-latency user experiences and enterprise reliability. When new products or tools are added to our website or management portal, I detect and present them instantly.',
    keywords: ['products', 'digital products', 'saas', 'software products', 'enmate products', 'web products', 'apps', 'web apps'],
    priority: 95,
    active: true,
    visibility: 'public'
  }
];

export const SUGGESTED_QUERIES = [
  'What services do you offer?',
  'Tell me about the ₹8,000 Social Media Package',
  'How much does a custom website cost?',
  'How can EnMate help scale my business?',
  'I need social media content & videos',
  'Talk directly with EnMate team'
];

export const ROTATING_GREETINGS = [
  "Hi, I'm EnMate AI 👋",
  "How can I help grow your business today?",
  "Looking for the ₹8,000 Social Media Package? 🚀",
  "Need a fast, custom Next.js website? ⚡",
  "Have a project in mind? Let's plan it 💡",
  "Ask me anything about our services or pricing 📈"
];


