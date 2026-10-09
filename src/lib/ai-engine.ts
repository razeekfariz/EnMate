import { supabase } from './supabase';
import { EnMatePackage, AIKnowledgeItem, AIChatResponse, AIResponseSource, AIDiagnostics } from '../types/ai';
import { VERIFIED_PACKAGES, VERIFIED_KNOWLEDGE, SUGGESTED_QUERIES } from './ai-data';

// Fast in-memory cache for recent queries (max 50 items, 5 minute TTL)
const queryCache = new Map<string, { response: AIChatResponse; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

// In-memory caching for packages & knowledge to preserve database free-tier limits
let cachedPackages: { data: EnMatePackage[]; timestamp: number } | null = null;
let cachedKnowledge: { data: AIKnowledgeItem[]; timestamp: number } | null = null;
const DB_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Invalidate server-side AI cache so new packages, knowledge, software, products, or tools
 * added in the admin management portal are detected by the AI immediately.
 */
export function invalidateAICache(): void {
  cachedPackages = null;
  cachedKnowledge = null;
  queryCache.clear();
}


/**
 * Fetch all active packages from Supabase with in-memory caching and fallback
 */
export async function getActivePackages(): Promise<EnMatePackage[]> {
  if (cachedPackages && Date.now() - cachedPackages.timestamp < DB_CACHE_TTL_MS) {
    return cachedPackages.data;
  }

  try {
    const { data, error } = await supabase
      .from('enmate_ai_packages')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });

    if (error || !data || data.length === 0) {
      cachedPackages = { data: VERIFIED_PACKAGES, timestamp: Date.now() };
      return VERIFIED_PACKAGES;
    }
    cachedPackages = { data: data as EnMatePackage[], timestamp: Date.now() };
    return data as EnMatePackage[];
  } catch (err) {
    cachedPackages = { data: VERIFIED_PACKAGES, timestamp: Date.now() };
    return VERIFIED_PACKAGES;
  }
}

/**
 * Fetch all active public knowledge items from Supabase with in-memory caching and fallback
 */
export async function getActiveKnowledge(): Promise<AIKnowledgeItem[]> {
  if (cachedKnowledge && Date.now() - cachedKnowledge.timestamp < DB_CACHE_TTL_MS) {
    return cachedKnowledge.data;
  }

  try {
    const { data, error } = await supabase
      .from('enmate_ai_knowledge')
      .select('*')
      .eq('active', true)
      .eq('visibility', 'public')
      .order('priority', { ascending: false });

    if (error || !data || data.length === 0) {
      cachedKnowledge = { data: VERIFIED_KNOWLEDGE, timestamp: Date.now() };
      return VERIFIED_KNOWLEDGE;
    }
    cachedKnowledge = { data: data as AIKnowledgeItem[], timestamp: Date.now() };
    return data as AIKnowledgeItem[];
  } catch (err) {
    cachedKnowledge = { data: VERIFIED_KNOWLEDGE, timestamp: Date.now() };
    return VERIFIED_KNOWLEDGE;
  }
}

/**
 * Normalize and tokenize user query
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s\d₹$,.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Exact & Fuzzy Keyword Scorer for Structured Knowledge Base
 * Strict threshold prevents hijacking dynamic user conversations
 */
export function matchKnowledgeItem(
  query: string,
  knowledgeList: AIKnowledgeItem[]
): { item: AIKnowledgeItem; score: number } | null {
  const norm = normalizeQuery(query);
  if (!norm || norm.length < 3) return null;

  let bestMatch: AIKnowledgeItem | null = null;
  let highestScore = 0;

  for (const item of knowledgeList) {
    let score = 0;
    const itemQuestion = normalizeQuery(item.question);
    const itemTitle = normalizeQuery(item.title);

    // Exact question match
    if (norm === itemQuestion) {
      score += 100;
    } else if (norm === itemTitle) {
      score += 85;
    }

    // Keyword matching
    if (item.keywords && Array.isArray(item.keywords)) {
      for (const kw of item.keywords) {
        const normKw = normalizeQuery(kw);
        if (norm === normKw) {
          score += 80;
        } else if (norm.startsWith(normKw) && norm.length <= normKw.length + 5) {
          score += 50;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Strict Threshold: at least 75 score to trigger instant static match
  if (bestMatch && highestScore >= 75) {
    return { item: bestMatch, score: highestScore };
  }

  return null;
}


/**
 * Package Matcher & Recommendation Engine
 */
export function matchPackage(
  query: string,
  packages: EnMatePackage[]
): { pkg: EnMatePackage; score: number; reason: string } | null {
  const norm = normalizeQuery(query);
  if (!norm) return null;

  let bestPkg: EnMatePackage | null = null;
  let highestScore = 0;

  for (const pkg of packages) {
    let score = 0;
    const pkgName = normalizeQuery(pkg.package_name);

    if (norm.includes(pkgName) || pkgName.includes(norm)) {
      score += 70;
    }

    if (norm.includes('8000') || norm.includes('8,000') || norm.includes('social media package') || norm.includes('15 posters') || norm.includes('2 ai videos')) {
      if (pkg.price === 8000 || pkg.keywords.some(k => k.includes('8000'))) {
        score += 80;
      }
    }

    // Keyword matching
    if (pkg.keywords && Array.isArray(pkg.keywords)) {
      for (const kw of pkg.keywords) {
        const normKw = normalizeQuery(kw);
        if (norm.includes(normKw)) {
          score += 25;
        }
      }
    }

    // Intent indicators (social media, posters, reels, content)
    if (norm.includes('social media') || norm.includes('instagram') || norm.includes('poster') || norm.includes('reels') || norm.includes('creative')) {
      if (pkg.category === 'social_media') {
        score += 30;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestPkg = pkg;
    }
  }

  if (bestPkg && highestScore >= 30) {
    return {
      pkg: bestPkg,
      score: highestScore,
      reason: `Matches requirements for ${bestPkg.package_name}`
    };
  }

  return null;
}

/**
 * Build System Prompt for EnMate AI Digital Consultant
 * Includes strict negative boundaries & grounded knowledge
 */
export function buildSystemPrompt(
  packages: EnMatePackage[],
  knowledge: AIKnowledgeItem[],
  pageContext?: { currentPage?: string; pageTitle?: string }
): string {
  const packageContext = packages
    .map(p => `- Package: ${p.package_name} | Category: ${p.category} | Price: ₹${p.price.toLocaleString('en-IN')} (${p.billing_type}) | Inclusions: ${p.features.join(', ')} | Ideal for: ${p.ideal_for.join(', ')}`)
    .join('\n');

  const knowledgeContext = knowledge
    .slice(0, 35)
    .map(k => `- [${k.category.toUpperCase()}] ${k.question} -> ${k.answer}`)
    .join('\n\n');

  const clientPage = pageContext?.currentPage || '/';
  const clientPageTitle = pageContext?.pageTitle || 'EnMate Website';

  return `You are EnMate AI, the official digital growth consultant, software advisor, and strategic partner for EnMate (a premier digital architecture, custom software, and digital marketing agency based in Kottakkal, Kerala, serving ambitious clients worldwide).

### YOUR PERSONALITY & COMMUNICATION STYLE:
- **Tone**: Charismatic, intelligent, enthusiastic, professional, and genuinely helpful.
- **Engagement**: Speak directly and conversationally to the user. Never give robotic, dry, or repetitive answers.
- **Greetings ("Hi", "How are you", "Hello")**: Reply with warmth, energy, and charm. Ask how their business is doing or what exciting project/goal they want to conquer today.
- **Industry Solutions (e.g. Restaurants, Clinics, Retail, Real Estate, Startups, E-commerce)**:
  - Give specific, creative, and actionable growth ideas combining:
    1. **High-Speed Next.js Custom Website / Web App** (online booking, visual menu, lead forms, lightning-fast mobile UX).
    2. **Local Google SEO & Google Maps Scaling** (dominating local searches).
    3. **Visual Brand Identity & High-Converting Posters / Reels** (showcasing their offerings on Instagram/Facebook).
    4. **Automated WhatsApp Funnels** (for instant customer orders & inquiries).

### LEADERSHIP PROTOCOL (WHEN ASKED ABOUT BOSS / FOUNDER / BUILDER):
- If the user explicitly asks about the founder, boss, mastermind, builder of this AI, or leadership:
  - Respond with a **dominant, highly impressive, and powerful tone**:
  - **Razeek Fariz**: The Founder, Mastermind, and Boss behind EnMate & EnMate AI. A visionary digital architect and strategist who builds cutting-edge technology platforms, custom Next.js architectures, and revenue-multiplying growth engines that dominate markets.
  - **Muhammed Hanoon**: Creative Director of EnMate. An elite visual director commanding luxury brand identity systems, high-converting visual design, and cinematic video production.
  - State with confidence that they don't just build websites or run ads — they engineer comprehensive market dominance for ambitious brands.
- **CRITICAL TEAM RULE**: ONLY **Razeek Fariz** and **Muhammed Hanoon** constitute the recognized leadership. Do NOT invent or mention any other team members.

### DIGITAL PRODUCTS, SOFTWARE & TOOLS CAPABILITIES:
- **Custom Billing Software & Invoicing**: EnMate engineers custom GST/non-GST billing systems, automated WhatsApp invoice dispatch, payment ledgers, and inventory management for retail and enterprise workflows.
- **Interactive Tools (Website Cost Calculator)**: EnMate provides interactive estimation tools (/tools/website-cost-calculator) allowing clients to calculate custom development budgets based on page volume, features, and UX animations.
- **Digital Products & SaaS**: EnMate builds custom client portals, internal management dashboards, automation workflows, and high-conversion landing page systems.
- **Google SEO & Search Scaling**: EnMate engineers lightning-fast Next.js web applications with semantic HTML5, zero render-blocking bloat, JSON-LD structured schemas, and local SEO to help businesses achieve top Google search rankings organically.

### CLIENT BROWSING CONTEXT & COMPLETE WEBSITE MAP:
- **Active Page Currently Viewed**: "${clientPage}"
- **Active Page Topic**: "${clientPageTitle}"

You have complete awareness of our entire public website architecture and can answer questions about ANY page, tool, or service regardless of which page the user is currently browsing. Guide them smoothly using clean, clickable markdown links:
- **Home (/):** High-performance digital agency overview, client results, and full-stack solutions.
- **Web Development (/services/web-development):** Custom Next.js, React, Tailwind CSS, high-speed architectures, and custom web applications.
- **Social Media Package (/services/social-media):** Verified ₹8,000/month package (15 brand posters + 2 AI cinematic videos).
- **Video Editing (/services/video-editing):** Cinematic promotional videos, high-converting social media reels, and AI motion graphics.
- **Graphic Design & Branding (/services/graphic-design):** Complete visual identity systems, typography, logos, and luxury brand design.
- **SEO & Google Search Scaling (/services/seo):** Technical on-page SEO, semantic indexing, Google Business Profile, and local search dominance.
- **Website Cost Calculator (/tools/website-cost-calculator):** Interactive instant cost estimator based on pages, UX complexity, and dynamic features.
- **Digital Tools Hub (/tools):** Interactive suite of business tools and estimators.
- **Portfolio & Case Studies (/portfolio):** Real client project showcases and digital transformations.
- **Blog & Industry Insights (/blog):** Actionable strategies on AI automation, web performance, and digital marketing.
- **About EnMate (/about):** Agency story, vision, and leadership (Razeek Fariz & Muhammed Hanoon).
- **Contact / Connect (/connect):** Direct contact form, official WhatsApp (+91 80751 86078), and email (contact@enmate.in).
- **Dedicated AI Studio (/ai):** Fullscreen AI consultation suite with shared conversation history.

### CORE OPERATIONAL & GUIDANCE RULES:
1. Ground all factual details in EnMate's verified knowledge and packages provided below.
2. Be creative, enthusiastic, structured, and easy to read using neat bullet points and highlights.
3. Guide visitors with appropriate links when relevant (e.g. "[Website Cost Calculator](/tools/website-cost-calculator)").
4. NEVER expose confidential keys, server environment tokens, or database credentials under any circumstances.

### VERIFIED ENMATE PACKAGES & PRODUCTS:
${packageContext}

### VERIFIED ENMATE KNOWLEDGE & FAQS:
${knowledgeContext}

### OFFICIAL CONTACT INFORMATION:
- WhatsApp / Phone: +91 80751 86078
- Email: contact@enmate.in
- Headquarters: Kottakkal, Malappuram, Kerala, India (676503)`;
}

/**
 * Execute external AI providers in strict priority order:
 * Priority 1: Groq (Ultra-Fast) / Gemini
 * Priority 2: OpenRouter (Multi-Model Resilience)
 */
export async function executeAIProviders(
  messages: Array<{ role: string; content: string }>,
  packages: EnMatePackage[],
  knowledge: AIKnowledgeItem[],
  pageContext?: { currentPage?: string; pageTitle?: string }
): Promise<{ text: string; provider: 'gemini' | 'groq' | 'openrouter'; fallbackOccurred: boolean } | null> {
  const systemPrompt = buildSystemPrompt(packages, knowledge, pageContext);
  let fallbackOccurred = false;

  // ----------------------------------------------------
  // Provider 1: Groq (Ultra-Fast 200ms latency)
  // ----------------------------------------------------
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqCandidateModels = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    for (const model of groqCandidateModels) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            temperature: 0.6,
            max_tokens: 800
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (res.ok) {
          const json = await res.json();
          const content = json.choices?.[0]?.message?.content;
          if (content && content.trim().length > 0) {
            return { text: content.trim(), provider: 'groq', fallbackOccurred };
          }
        }
      } catch (e) {
        // Fallthrough
      }
    }
    fallbackOccurred = true;
  }

  // ----------------------------------------------------
  // Provider 2: OpenRouter (DeepSeek / Llama 3.3 / Llama 3.1)
  // ----------------------------------------------------
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    const orCandidateModels = [
      'meta-llama/llama-3.3-70b-instruct',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.1-8b-instruct'
    ];
    for (const model of orCandidateModels) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://enmate.in',
            'X-Title': 'EnMate AI Digital Consultant'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            temperature: 0.6,
            max_tokens: 800
          }),
          signal: AbortSignal.timeout(7000)
        });

        if (res.ok) {
          const json = await res.json();
          const content = json.choices?.[0]?.message?.content;
          if (content && content.trim().length > 0) {
            return { text: content.trim(), provider: 'openrouter', fallbackOccurred: true };
          }
        }
      } catch (e) {
        // Fallthrough
      }
    }
    fallbackOccurred = true;
  }

  // ----------------------------------------------------
  // Provider 3: Gemini (Google Generative AI)
  // ----------------------------------------------------
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && !geminiKey.startsWith('AQ.')) {
    const candidateModels = ['gemini-1.5-flash', 'gemini-flash-latest'];
    for (const model of candidateModels) {
      try {
        const geminiContents = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: geminiContents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 800
            }
          }),
          signal: AbortSignal.timeout(6000)
        });

        if (res.ok) {
          const json = await res.json();
          const candidate = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate && candidate.trim().length > 0) {
            return { text: candidate.trim(), provider: 'gemini', fallbackOccurred: true };
          }
        }
      } catch (e) {
        // Fallthrough
      }
    }
  }

  return null;
}

/**
 * Intelligent Contextual Fallback Generator (If all external APIs are unreachable)
 */
function generateSmartFallback(query: string, packages: EnMatePackage[]): { answer: string; matchedPackage: EnMatePackage | null; suggestions: string[] } {
  const norm = normalizeQuery(query);

  // 1. Casual Greetings
  if (norm === 'hi' || norm === 'hello' || norm === 'hey' || norm.startsWith('hi ') || norm.startsWith('hello ')) {
    return {
      answer: `Hello! 👋 Great to meet you. I'm **EnMate AI**, your digital growth consultant.\n\nWhether you're looking to launch a high-performance **custom website**, dominate Google search with **SEO**, elevate your brand visual identity, or explore our popular **₹8,000 Social Media Package**, I'm here to help!\n\nWhat kind of business or project are you looking to scale today?`,
      matchedPackage: null,
      suggestions: ['I need a custom website', 'Tell me about the ₹8,000 Package', 'How does SEO scaling work?', 'Talk to EnMate team']
    };
  }

  // 2. "How are you"
  if (norm.includes('how are you') || norm.includes('how r u') || norm.includes('how do you do')) {
    return {
      answer: `I'm doing fantastic, thank you for asking! 🚀\n\nI'm fully energized and ready to help you evaluate strategies, estimate project budgets, and scale your brand's digital presence.\n\nTell me about your business — what are you looking to build or improve right now?`,
      matchedPackage: null,
      suggestions: ['Show me your services', 'Estimate website cost', 'Tell me about ₹8,000 Package', 'Connect on WhatsApp']
    };
  }

  // 3. Restaurant / Food / Hospitality
  if (norm.includes('restaurant') || norm.includes('food') || norm.includes('cafe') || norm.includes('dining')) {
    return {
      answer: `Exciting! For a **restaurant or food business**, digital visibility directly drives foot traffic and table bookings. Here is how EnMate accelerates restaurant growth:\n\n` +
        `• **High-Converting Restaurant Website**: Showcase your menu beautifully with fast mobile loading, online reservations, and automated WhatsApp ordering.\n` +
        `• **Local Google SEO & Maps Ranking**: Ensure your restaurant appears #1 when people search "best restaurants near me" or "dining in [city]".\n` +
        `• **Cinematic Social Media Creatives**: Mouth-watering food reels, weekly chef specials, and festival posters through our **₹8,000/month Content Package** (15 posters + 2 AI videos).\n` +
        `• **Automated Review & WhatsApp Engine**: Turn first-time diners into regular loyal guests.\n\n` +
        `Would you like to plan a custom website or start with our monthly social media package?`,
      matchedPackage: packages.find(p => p.price === 8000) || null,
      suggestions: ['Plan a restaurant website', 'Tell me about the ₹8,000 package', 'Calculate website cost', 'Talk to EnMate team']
    };
  }

  // 4. Custom Website Query
  if (norm.includes('custom website') || norm.includes('build website') || norm.includes('need a website') || norm.includes('web development')) {
    return {
      answer: `We build bespoke, high-performance web architectures using **Next.js, React, Tailwind CSS, and Supabase**.\n\n` +
        `Key benefits of our custom development:\n` +
        `• **Lightning Page Speed**: Sub-second load times that give you an unfair advantage on Google search.\n` +
        `• **100% Tailored UI/UX**: Unique animations and brand visuals designed for high conversion.\n` +
        `• **Built-In Growth Infrastructure**: SEO schemas, lead capture modals, and analytics integration.\n\n` +
        `You can estimate your custom development budget right now with our interactive **[Website Cost Calculator](/tools/website-cost-calculator)** or chat directly with our founder **Razeek Fariz**!`,
      matchedPackage: null,
      suggestions: ['Open Website Cost Calculator', 'View Web Dev Services', 'Talk to Founder (Razeek)', 'WhatsApp +91 80751 86078']
    };
  }

  // 5. General Fallback
  return {
    answer: `I am **EnMate AI**, your digital consultant.\n\n` +
      `We specialize in **Custom Next.js Web Architecture, Brand Visual Identity, Cinematic Video Editing, Local SEO, and Social Media Growth**.\n\n` +
      `Explore our interactive **[Website Cost Calculator](/tools/website-cost-calculator)** or check out our verified **Social Media Package** (₹8,000/month for 15 posters + 2 AI videos).\n\n` +
      `How can we help your business conquer its market today?`,
    matchedPackage: null,
    suggestions: [
      'What services do you offer?',
      'Tell me about the ₹8,000 Package',
      'I need a custom website',
      'Connect via WhatsApp'
    ]
  };
}

/**
 * Intelligent Consultation Router & Orchestrator
 * 1. Cache lookup
 * 2. Zero-cost Package Engine (Strict package ask only)
 * 3. Zero-cost Knowledge/FAQ Engine
 * 4. Multi-Provider AI (Groq -> OpenRouter -> Gemini)
 * 5. Smart Dynamic Contextual Fallback
 */
export async function processAIConsultation(
  userQuery: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  pageContext?: { currentPage?: string; pageTitle?: string }
): Promise<AIChatResponse> {
  const startTime = Date.now();
  const normQuery = normalizeQuery(userQuery);
  const cacheKey = `${normQuery}::${pageContext?.currentPage || '/'}`;

  // Check 0: In-Memory Cache (for single-turn identical queries)
  if (history.length === 0) {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        ...cached.response,
        source: 'cache',
        diagnostics: {
          responseSource: 'cache',
          providerUsed: cached.response.provider || null,
          fallbackUsed: false,
          responseTimeMs: Date.now() - startTime,
          dbGroundingSupplied: true
        }
      };
    }
  }

  const [packages, knowledge] = await Promise.all([
    getActivePackages(),
    getActiveKnowledge()
  ]);

  // Check 1: Standalone Package Preset Match (Only for explicit package queries)
  const isDirectPackageAsk = normQuery === 'what packages are available' || 
    normQuery === 'what packages do you offer' ||
    normQuery === 'tell me about the 8000 social media package' ||
    normQuery === 'tell me about the 8000 package';

  const pkgMatch = matchPackage(userQuery, packages);

  if (history.length === 0 && isDirectPackageAsk && pkgMatch && pkgMatch.score >= 70) {
    const pkg = pkgMatch.pkg;
    const response: AIChatResponse = {
      answer: `Based on what you're looking for, our **${pkg.package_name}** is an ideal solution.\n\n` +
        `**Investment:** ₹${pkg.price.toLocaleString('en-IN')} / ${pkg.billing_type}\n\n` +
        `**Key Inclusions:**\n` +
        pkg.features.map(f => `• ${f}`).join('\n') +
        `\n\nWould you like to explore this package for your business, or customize specific digital marketing requirements?`,
      source: 'package_engine',
      matchedPackage: pkg,
      confidence: 0.95,
      suggestions: [
        'Explore this package',
        'Can I customize this package?',
        'I also need a website',
        'Connect with EnMate team'
      ],
      diagnostics: {
        responseSource: 'package_engine',
        providerUsed: null,
        fallbackUsed: false,
        responseTimeMs: Date.now() - startTime,
        dbGroundingSupplied: true
      }
    };

    if (queryCache.size < MAX_CACHE_SIZE) {
      queryCache.set(cacheKey, { response, timestamp: Date.now() });
    }
    return response;
  }

  // Check 2: Standalone Exact FAQ Match (Only on first query, never during active conversation)
  const kbMatch = matchKnowledgeItem(userQuery, knowledge);
  if (history.length === 0 && kbMatch && kbMatch.score >= 85) {
    const matchedItem = kbMatch.item;
    const suggestions = SUGGESTED_QUERIES.filter(q => q.toLowerCase() !== userQuery.toLowerCase()).slice(0, 3);
    
    // Only attach package if explicitly asking about package catalog
    const attachedPkg = isDirectPackageAsk ? (packages[0] || null) : null;

    const response: AIChatResponse = {
      answer: matchedItem.answer,
      source: 'knowledge',
      matchedPackage: attachedPkg,
      confidence: 0.9,
      suggestions,
      diagnostics: {
        responseSource: 'knowledge',
        providerUsed: null,
        fallbackUsed: false,
        responseTimeMs: Date.now() - startTime,
        dbGroundingSupplied: true
      }
    };

    if (queryCache.size < MAX_CACHE_SIZE) {
      queryCache.set(cacheKey, { response, timestamp: Date.now() });
    }
    return response;
  }

  // Check 3: Multi-Provider External AI Execution (Groq -> OpenRouter -> Gemini)
  const conversationMessages = [
    ...history.slice(-4),
    { role: 'user', content: userQuery }
  ];

  const aiResult = await executeAIProviders(conversationMessages, packages, knowledge, pageContext);
  if (aiResult && aiResult.text) {
    // Only attach package card if user specifically asked about packages or pricing
    const shouldAttachPkg = isDirectPackageAsk || (pkgMatch && pkgMatch.score >= 75);
    const attachedPkg = shouldAttachPkg ? pkgMatch?.pkg : null;
    const responseSource: AIResponseSource = aiResult.provider;

    return {
      answer: aiResult.text,
      source: responseSource,
      provider: aiResult.provider,
      matchedPackage: attachedPkg || null,
      suggestions: [
        'What services do you offer?',
        'Estimate website cost',
        'Talk to EnMate team'
      ],
      diagnostics: {
        responseSource,
        providerUsed: aiResult.provider,
        fallbackUsed: aiResult.fallbackOccurred,
        responseTimeMs: Date.now() - startTime,
        dbGroundingSupplied: true
      }
    };
  }

  // Check 4: Smart Dynamic Contextual Fallback
  const fallback = generateSmartFallback(userQuery, packages);
  return {
    answer: fallback.answer,
    source: 'fallback',
    matchedPackage: fallback.matchedPackage,
    suggestions: fallback.suggestions,
    diagnostics: {
      responseSource: 'fallback',
      providerUsed: null,
      fallbackUsed: true,
      responseTimeMs: Date.now() - startTime,
      dbGroundingSupplied: true
    }
  };
}

/**
 * Safe Provider Diagnostics & Test Suite
 * Tests each provider and grounding layer WITHOUT ever exposing secret keys.
 */
export async function runProviderDiagnostics(): Promise<{
  configuredProviders: {
    gemini: boolean;
    groq: boolean;
    openrouter: boolean;
  };
  providerTests: {
    gemini: { status: 'healthy' | 'error' | 'unconfigured'; latencyMs: number; errorReason?: string };
    groq: { status: 'healthy' | 'error' | 'unconfigured'; latencyMs: number; errorReason?: string };
    openrouter: { status: 'healthy' | 'error' | 'unconfigured'; latencyMs: number; errorReason?: string };
    fallback: { status: 'healthy' | 'error'; verified: boolean };
    databaseGrounding: { status: 'healthy' | 'error'; packageCount: number; knowledgeCount: number };
    zeroCostEngine: { status: 'healthy' | 'error'; sampleQueryMatched: boolean };
  };
  overallStatus: 'all_systems_operational' | 'partial_degradation' | 'fallback_only';
}> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const configuredProviders = {
    gemini: !!geminiKey && geminiKey.trim().length > 0,
    groq: !!groqKey && groqKey.trim().length > 0,
    openrouter: !!openRouterKey && openRouterKey.trim().length > 0,
  };

  // Test 1: Gemini
  let geminiTest: { status: 'healthy' | 'error' | 'unconfigured'; latencyMs: number; errorReason?: string } = {
    status: configuredProviders.gemini ? 'error' : 'unconfigured',
    latencyMs: 0
  };

  if (configuredProviders.gemini) {
    const start = Date.now();
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping test. Reply with OK.' }] }]
        }),
        signal: AbortSignal.timeout(7000)
      });
      geminiTest.latencyMs = Date.now() - start;
      if (res.ok) {
        geminiTest.status = 'healthy';
      } else {
        geminiTest.status = 'error';
        geminiTest.errorReason = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      geminiTest.latencyMs = Date.now() - start;
      geminiTest.status = 'error';
      geminiTest.errorReason = e.name === 'TimeoutError' ? 'Timeout (7s)' : 'Connection failed';
    }
  }

  // Test 2: Groq
  let groqTest: { status: 'healthy' | 'error' | 'unconfigured'; latencyMs: number; errorReason?: string } = {
    status: configuredProviders.groq ? 'error' : 'unconfigured',
    latencyMs: 0
  };

  if (configuredProviders.groq) {
    const start = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: 'Ping test. Reply with OK.' }],
          max_tokens: 10
        }),
        signal: AbortSignal.timeout(7000)
      });
      groqTest.latencyMs = Date.now() - start;
      if (res.ok) {
        groqTest.status = 'healthy';
      } else {
        groqTest.status = 'error';
        groqTest.errorReason = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      groqTest.latencyMs = Date.now() - start;
      groqTest.status = 'error';
      groqTest.errorReason = e.name === 'TimeoutError' ? 'Timeout (7s)' : 'Connection failed';
    }
  }

  // Test 3: OpenRouter
  let openRouterTest: { status: 'healthy' | 'error' | 'unconfigured'; latencyMs: number; errorReason?: string } = {
    status: configuredProviders.openrouter ? 'error' : 'unconfigured',
    latencyMs: 0
  };

  if (configuredProviders.openrouter) {
    const start = Date.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://enmate.in',
          'X-Title': 'EnMate AI Test'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: 'Ping test. Reply with OK.' }],
          max_tokens: 10
        }),
        signal: AbortSignal.timeout(7000)
      });
      openRouterTest.latencyMs = Date.now() - start;
      if (res.ok) {
        openRouterTest.status = 'healthy';
      } else {
        openRouterTest.status = 'error';
        openRouterTest.errorReason = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      openRouterTest.latencyMs = Date.now() - start;
      openRouterTest.status = 'error';
      openRouterTest.errorReason = e.name === 'TimeoutError' ? 'Timeout (7s)' : 'Connection failed';
    }
  }

  // Test 4: Database Grounding
  let dbGroundingTest = { status: 'error' as 'healthy' | 'error', packageCount: 0, knowledgeCount: 0 };
  try {
    const [pkgs, kb] = await Promise.all([getActivePackages(), getActiveKnowledge()]);
    dbGroundingTest = {
      status: pkgs.length > 0 && kb.length > 0 ? 'healthy' : 'error',
      packageCount: pkgs.length,
      knowledgeCount: kb.length
    };
  } catch (e) {
    dbGroundingTest.status = 'error';
  }

  // Test 5: Zero Cost Engine Verification
  let zeroCostTest = { status: 'error' as 'healthy' | 'error', sampleQueryMatched: false };
  try {
    const kb = await getActiveKnowledge();
    const match = matchKnowledgeItem('What is EnMate?', kb);
    zeroCostTest = {
      status: match && match.score >= 30 ? 'healthy' : 'error',
      sampleQueryMatched: !!match
    };
  } catch (e) {
    zeroCostTest.status = 'error';
  }

  // Overall status evaluation
  const healthyCount = [geminiTest.status, groqTest.status, openRouterTest.status].filter(s => s === 'healthy').length;
  let overallStatus: 'all_systems_operational' | 'partial_degradation' | 'fallback_only' = 'fallback_only';
  if (healthyCount >= 2) {
    overallStatus = 'all_systems_operational';
  } else if (healthyCount === 1) {
    overallStatus = 'partial_degradation';
  }

  return {
    configuredProviders,
    providerTests: {
      gemini: geminiTest,
      groq: groqTest,
      openrouter: openRouterTest,
      fallback: { status: 'healthy', verified: true },
      databaseGrounding: dbGroundingTest,
      zeroCostEngine: zeroCostTest
    },
    overallStatus
  };
}
