-- ==============================================================================
-- ENMATE AI PLATFORM - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Create EnMate Packages Table
CREATE TABLE IF NOT EXISTS public.enmate_ai_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'social_media',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_type VARCHAR(50) NOT NULL DEFAULT 'monthly', -- 'one_time', 'monthly', 'quarterly', 'annual', 'custom'
    description TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    ideal_for TEXT[] NOT NULL DEFAULT '{}',
    not_ideal_for TEXT[] DEFAULT '{}',
    keywords TEXT[] NOT NULL DEFAULT '{}',
    badge VARCHAR(100) DEFAULT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create EnMate AI Knowledge / FAQ Table
CREATE TABLE IF NOT EXISTS public.enmate_ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    title VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    priority INTEGER NOT NULL DEFAULT 0,
    visibility VARCHAR(50) NOT NULL DEFAULT 'public', -- 'public', 'internal', 'client'
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create EnMate AI Leads & Consultation Inquiries Table
CREATE TABLE IF NOT EXISTS public.enmate_ai_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    service_interest VARCHAR(255),
    package_interest VARCHAR(255),
    budget VARCHAR(100),
    requirements TEXT,
    message TEXT,
    source VARCHAR(100) DEFAULT 'ai_assistant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create EnMate AI Analytics Table
CREATE TABLE IF NOT EXISTS public.enmate_ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    matched_type VARCHAR(50) NOT NULL DEFAULT 'database', -- 'database', 'ai', 'package', 'fallback'
    matched_package_id UUID REFERENCES public.enmate_ai_packages(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_enmate_ai_packages_updated_at'
    ) THEN
        CREATE TRIGGER update_enmate_ai_packages_updated_at
        BEFORE UPDATE ON public.enmate_ai_packages
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_enmate_ai_knowledge_updated_at'
    ) THEN
        CREATE TRIGGER update_enmate_ai_knowledge_updated_at
        BEFORE UPDATE ON public.enmate_ai_knowledge
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all AI tables
ALTER TABLE public.enmate_ai_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enmate_ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enmate_ai_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enmate_ai_analytics ENABLE ROW LEVEL SECURITY;

-- 1. enmate_ai_packages policies
CREATE POLICY "Allow public read access to active packages"
ON public.enmate_ai_packages
FOR SELECT
TO public
USING (active = true);

CREATE POLICY "Allow authenticated admin full access on packages"
ON public.enmate_ai_packages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. enmate_ai_knowledge policies
CREATE POLICY "Allow public read access to active public knowledge"
ON public.enmate_ai_knowledge
FOR SELECT
TO public
USING (active = true AND visibility = 'public');

CREATE POLICY "Allow authenticated admin full access on knowledge"
ON public.enmate_ai_knowledge
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. enmate_ai_leads policies
CREATE POLICY "Allow public to insert inquiries/leads"
ON public.enmate_ai_leads
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated admin to view/manage leads"
ON public.enmate_ai_leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. enmate_ai_analytics policies
CREATE POLICY "Allow public to insert anonymous analytics"
ON public.enmate_ai_analytics
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated admin to view analytics"
ON public.enmate_ai_analytics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Current Verified EnMate Package
INSERT INTO public.enmate_ai_packages (
    package_name,
    category,
    price,
    currency,
    billing_type,
    description,
    features,
    ideal_for,
    not_ideal_for,
    keywords,
    badge,
    active,
    priority
) VALUES (
    'Social Media Content Package',
    'social_media',
    8000,
    'INR',
    'monthly',
    'A focused, high-impact monthly creative content production package designed to maintain an active, professional social media presence for growing brands.',
    ARRAY[
        '15 High-Quality Brand Posters',
        '2 AI-Generated Cinematic Videos',
        'Platform-Optimized Creatives for Instagram & Facebook',
        'Brand-Consistent Typography & Visual Theme'
    ],
    ARRAY[
        'Small to Medium Businesses wanting consistent social content',
        'Brands looking for regular creative posters & engaging AI video reels',
        'Local businesses in Kerala or worldwide expanding their digital presence'
    ],
    ARRAY[
        'Brands requiring daily full-time ad management and multi-crore media buying',
        'Custom web development projects (separate service)'
    ],
    ARRAY[
        'social media package',
        '8000 package',
        '8000',
        '15 posters',
        '2 ai videos',
        'posters',
        'ai video',
        'content creation',
        'instagram content',
        'monthly creative package'
    ],
    'Most Popular',
    true,
    100
) ON CONFLICT DO NOTHING;

-- Seed Verified Baseline EnMate Knowledge
INSERT INTO public.enmate_ai_knowledge (
    category,
    title,
    question,
    answer,
    keywords,
    priority,
    visibility,
    active
) VALUES
(
    'company',
    'What is EnMate?',
    'What does EnMate do?',
    'EnMate is a premium digital marketing agency based in Kottakkal, Kerala, serving clients locally and worldwide. We specialize in custom web architecture, visual branding identity layouts, creative video production, SEO optimization, and data-driven customer acquisition funnels.',
    ARRAY['what is enmate', 'about enmate', 'who are you', 'what do you do', 'company overview', 'kottakkal agency'],
    100,
    'public',
    true
),
(
    'packages',
    'Social Media Content Package Pricing & Inclusions',
    'How much is the social media package and what is included?',
    'Our official Social Media Content Package is priced at ₹8,000 / month. It includes 15 custom brand posters and 2 AI-generated videos, tailored for platforms like Instagram and Facebook to give your business a consistent, premium digital presence.',
    ARRAY['8000 package', 'pricing', 'how much', 'social media cost', 'package inclusions', '15 posters', '2 ai videos'],
    100,
    'public',
    true
),
(
    'services',
    'Website Development Services',
    'Do you build websites and web applications?',
    'Yes! EnMate engineers custom, high-performance websites and web applications using modern frameworks like Next.js, React, and Supabase. Every website is custom-coded (no bloated templates), lightning-fast for SEO, fully responsive across all devices, and built with conversion funnels to turn visitors into paying clients.',
    ARRAY['website', 'web development', 'web design', 'nextjs', 'custom software', 'landing page', 'ecommerce'],
    90,
    'public',
    true
),
(
    'services',
    'SEO & Search Engine Optimization',
    'Do you provide SEO services?',
    'Yes. We provide continuous SEO enhancements, technical SEO audits, keyword optimization, and Google Business Profile optimization to help your business rank at the top of Google search results and compound organic visibility over time.',
    ARRAY['seo', 'search engine optimization', 'google ranking', 'google business profile', 'local seo', 'organic traffic'],
    85,
    'public',
    true
),
(
    'services',
    'Branding & Graphic Design',
    'What branding and design services do you offer?',
    'We create comprehensive visual identity systems including logo design, color schemes, typography guides, and brand kits, as well as digital marketing creatives that make your brand stand out with authority and trust.',
    ARRAY['branding', 'graphic design', 'logo design', 'brand identity', 'brochure', 'visual system'],
    85,
    'public',
    true
),
(
    'services',
    'Video Editing & Production',
    'What video production services do you provide?',
    'We produce scroll-stopping social media reels, promotional ads, AI-driven motion videos, and animated explainers. We offer on-location filming in Kerala as well as remote editing services for clients worldwide.',
    ARRAY['video editing', 'reels', 'promotional video', 'ai video', 'shorts', 'motion graphics'],
    85,
    'public',
    true
),
(
    'company',
    'Location and Contact',
    'Where is EnMate located and how can I contact you?',
    'EnMate is headquartered in Kottakkal, Malappuram, Kerala, India (676503), serving clients across India and globally. You can reach our team via WhatsApp/Phone at +91 80751 86078 or by email at contact@enmate.in.',
    ARRAY['contact', 'location', 'where are you', 'address', 'phone number', 'whatsapp', 'email', 'kottakkal'],
    95,
    'public',
    true
)
ON CONFLICT DO NOTHING;
