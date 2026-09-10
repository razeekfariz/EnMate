import { NextRequest, NextResponse } from 'next/server';
import { runProviderDiagnostics, processAIConsultation } from '@/lib/ai-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();

    // 1. Run low-level connection & config diagnostics
    const diagnostics = await runProviderDiagnostics();

    // 2. Run end-to-end sample test cases
    const testCases = [
      {
        name: 'Zero-Cost Knowledge Test',
        query: 'What is EnMate?',
        expectedSourceType: 'knowledge'
      },
      {
        name: 'Zero-Cost Package Engine Test',
        query: 'How much is the 8000 social media package?',
        expectedSourceType: 'package_engine'
      },
      {
        name: 'Multi-Provider Grounded AI Consultation Test',
        query: 'Can you suggest a digital growth strategy for my retail business in Kerala?',
        expectedSourceType: 'external_ai_or_fallback'
      }
    ];

    const testResults = [];
    for (const tc of testCases) {
      const qStart = Date.now();
      const res = await processAIConsultation(tc.query);
      testResults.push({
        name: tc.name,
        query: tc.query,
        source: res.source,
        provider: res.provider || 'none',
        hasMatchedPackage: !!res.matchedPackage,
        hasAnswer: !!res.answer && res.answer.length > 20,
        latencyMs: Date.now() - qStart,
        diagnostics: res.diagnostics
      });
    }

    const totalDurationMs = Date.now() - startTime;

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      totalDurationMs,
      configuredProviders: diagnostics.configuredProviders,
      providerTests: diagnostics.providerTests,
      overallStatus: diagnostics.overallStatus,
      endToEndTests: testResults,
      notice: 'API keys and sensitive tokens are strictly secured and never exposed in responses or logs.'
    });
  } catch (error: any) {
    console.error('AI Diagnostics Route Error:', error?.message || 'Unknown error');
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to run AI provider diagnostics suite',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Allow triggering diagnostics via POST as well
  return GET(req);
}
