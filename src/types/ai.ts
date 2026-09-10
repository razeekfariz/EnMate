export type AIKnowledgeCategory =
  | 'company'
  | 'services'
  | 'products'
  | 'software'
  | 'billing_software'
  | 'tools'
  | 'web_development'
  | 'web_portals'
  | 'branding'
  | 'design'
  | 'digital_marketing'
  | 'seo'
  | 'social_media'
  | 'content'
  | 'video'
  | 'packages'
  | 'pricing'
  | 'portfolio'
  | 'process'
  | 'faq'
  | 'support'
  | 'general';


export type AIVisibility = 'public' | 'internal' | 'client';

export interface EnMatePackage {
  id: string;
  package_name: string;
  category: string;
  price: number;
  currency: string;
  billing_type: 'one_time' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  description: string;
  features: string[];
  ideal_for: string[];
  not_ideal_for?: string[];
  keywords: string[];
  active: boolean;
  priority: number;
  badge?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AIKnowledgeItem {
  id: string;
  category: AIKnowledgeCategory;
  title: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  active: boolean;
  visibility: 'public' | 'internal' | 'client';
  created_at?: string;
  updated_at?: string;
}

export interface AILead {
  id?: string;
  name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  service_interest?: string;
  package_interest?: string;
  budget?: string;
  requirements?: string;
  message?: string;
  source?: string;
  created_at?: string;
}

export type AIResponseSource =
  | 'knowledge'
  | 'package_engine'
  | 'cache'
  | 'gemini'
  | 'groq'
  | 'openrouter'
  | 'fallback'
  | 'database'
  | 'ai';

export interface AIDiagnostics {
  responseSource: AIResponseSource;
  providerUsed: string | null;
  fallbackUsed: boolean;
  responseTimeMs: number;
  dbGroundingSupplied: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  source?: AIResponseSource | 'lead_form';
  matchedPackage?: EnMatePackage | null;
  suggestions?: string[];
  isStreaming?: boolean;
  diagnostics?: AIDiagnostics;
}

export interface AIChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  source?: 'floating_widget' | 'full_ai_page';
  currentPage?: string;
  pageTitle?: string;
}


export interface AIChatResponse {
  answer: string;
  source: AIResponseSource;
  provider?: string;
  matchedPackage?: EnMatePackage | null;
  suggestions?: string[];
  confidence?: number;
  diagnostics?: AIDiagnostics;
  error?: string;
}

