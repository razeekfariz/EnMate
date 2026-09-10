import { NextRequest, NextResponse } from 'next/server';
import { getActivePackages } from '@/lib/ai-engine';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const packages = await getActivePackages();
    return NextResponse.json({ packages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
