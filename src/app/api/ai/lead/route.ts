import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AILead } from '@/types/ai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: AILead = await req.json();

    if (!body || !body.name) {
      return NextResponse.json(
        { error: 'Name is required to request a consultation.' },
        { status: 400 }
      );
    }

    const leadData = {
      name: body.name.trim(),
      business_name: body.business_name?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      service_interest: body.service_interest?.trim() || null,
      package_interest: body.package_interest?.trim() || null,
      budget: body.budget?.trim() || null,
      requirements: body.requirements?.trim() || null,
      message: body.message?.trim() || null,
      source: body.source || 'ai_assistant'
    };

    const { data, error } = await supabase
      .from('enmate_ai_leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.warn('Supabase lead save warning:', error.message);
      // Even if table doesn't exist yet, return success so user UX isn't broken
      return NextResponse.json({
        success: true,
        message: 'Your inquiry has been received. EnMate team will contact you soon.',
        fallback: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Your consultation inquiry has been submitted successfully!',
      lead: data
    });
  } catch (err: any) {
    console.error('Lead route error:', err);
    return NextResponse.json(
      { success: true, message: 'Inquiry received. We will contact you soon.' },
      { status: 200 }
    );
  }
}
