import { NextRequest, NextResponse } from 'next/server';
import { processAIConsultation } from '@/lib/ai-engine';
import { supabase } from '@/lib/supabase';
import { AIChatRequest } from '@/types/ai';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter per IP (max 30 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }

  if (record.count >= 35) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body: AIChatRequest = await req.json();

    if (!body || !body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Valid query message is required.' },
        { status: 400 }
      );
    }

    const trimmedMessage = body.message.trim().slice(0, 500); // Sanitize query length
    if (!trimmedMessage) {
      return NextResponse.json(
        { error: 'Query message cannot be empty.' },
        { status: 400 }
      );
    }

    const pageContext = {
      currentPage: typeof body.currentPage === 'string' ? body.currentPage : undefined,
      pageTitle: typeof body.pageTitle === 'string' ? body.pageTitle : undefined
    };

    const response = await processAIConsultation(trimmedMessage, body.history || [], pageContext);


    // Async log analytics to Supabase if table exists (non-blocking)
    try {
      supabase.from('enmate_ai_analytics').insert([
        {
          query: trimmedMessage,
          matched_type: response.source,
          matched_package_id: response.matchedPackage?.id || null,
          session_id: ip
        }
      ]).then();
    } catch (e) {
      // ignore non-critical analytics error
    }

    const isDev = process.env.NODE_ENV === 'development';
    const finalResponse = {
      answer: response.answer,
      source: response.source,
      matchedPackage: response.matchedPackage,
      suggestions: response.suggestions,
      confidence: response.confidence,
      ...(isDev ? { diagnostics: response.diagnostics } : {})
    };

    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error('AI Chat Route Exception:', error?.message || 'Unknown error');
    return NextResponse.json(
      {
        answer: "I am having trouble connecting right now. You can explore EnMate's verified services or connect directly with our team at +91 80751 86078.",
        source: 'fallback',
        suggestions: ['Explore Services', 'Contact EnMate Team', 'Social Media Package']
      },
      { status: 200 }
    );
  }
}

