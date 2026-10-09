# EnMate — Digital Marketing & Web Architecture Platform

EnMate is a high-performance web platform and digital marketing infrastructure built with Next.js, TypeScript, Tailwind CSS, and Supabase. The platform includes interactive business tools, a content management portal, and an integrated AI digital consultant powered by multi-provider intelligence.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Custom Design System
- **Database & Authentication:** Supabase (PostgreSQL)
- **AI Consultation Engine:** Groq (Llama / GPT-OSS), Google Gemini, OpenRouter
- **SEO Architecture:** Structured JSON-LD Schemas, OpenGraph, Dynamic Sitemap

---

## Core Capabilities

- **Digital Agency Showcase:** Presentation of web architecture, branding, cinematic video production, SEO, and social media services.
- **Interactive Tools:** Dynamic client utilities, including the Website Cost Calculator (`/tools/website-cost-calculator`).
- **EnMate AI Consultant:** Grounded multi-model AI assistant with persistent cross-page memory, live page awareness, and lead routing.
- **Admin Management Portal:** Secured back-office interface (`/admin`) for package catalog management, AI knowledge updates, portfolio operations, and lead inquiries.
- **Performance & SEO:** Pre-rendered static generation, Core Web Vitals optimization, and metadata architecture.

---

## Project Structure

```text
├── src/
│   ├── app/                 # Next.js App Router pages and API endpoints
│   │   ├── admin/           # Administrative portal & managers
│   │   ├── ai/              # Dedicated AI consultation studio
│   │   ├── api/             # Backend API routes (AI, leads, packages, cache)
│   │   ├── blog/            # Dynamic insights & publication routes
│   │   ├── services/        # Service offering pages
│   │   └── tools/           # Interactive client tools & calculators
│   ├── components/          # Reusable UI, layout, admin, and AI components
│   ├── lib/                 # Database clients, AI engine, storage utilities
│   ├── styles/              # Global styles, variables, and typography tokens
│   └── types/               # TypeScript interfaces & type definitions
├── public/                  # Static assets, branding logos, manifests, and icons
└── middleware.ts            # Route protection and request filtering
```

---

## Getting Started

### Prerequisites

- **Node.js:** `v18.17.0` or higher
- **Package Manager:** `npm` (v9+) or `yarn`

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/razeek79/EnMate.git
cd EnMate
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory and configure the required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Provider API Keys (Server-Side Only)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

> **Security Note:** AI provider keys are loaded server-side only and are never exposed to client-side bundles or public endpoints.

### 3. Development

Start the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 4. Production Build

To compile and validate the optimized production build:

```bash
npm run build
npm run start
```

### 5. Code Quality

Run type checking and lint validation:

```bash
npx tsc --noEmit
npm run lint
```

---

## Deployment

The application is optimized for deployment on Vercel, Node.js container environments, or standard cloud hosting platforms. Ensure all environment variables are securely configured in your hosting platform settings before deployment.

---

## Contact & Support

- **Agency:** EnMate Digital Marketing & Architecture
- **Location:** Kottakkal, Malappuram, Kerala, India (676503)
- **Website:** [enmate.in](https://enmate.in)
- **Inquiries:** contact@enmate.in
