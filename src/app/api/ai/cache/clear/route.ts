import { NextRequest, NextResponse } from 'next/server';
import { invalidateAICache } from '@/lib/ai-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    invalidateAICache();
    return NextResponse.json({
      success: true,
      message: 'EnMate AI cache invalidated. New knowledge, products, packages, and software details are now live.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
