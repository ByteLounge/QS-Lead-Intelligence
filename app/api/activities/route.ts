// Queenstown Lead Intelligence - Activities & Audit Log API Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin.from('activities').select('*', { count: 'exact' });

      if (leadId) query = query.eq('lead_id', leadId);
      if (companyId) query = query.eq('company_id', companyId);
      if (type) query = query.eq('activity_type', type);

      query = query.order('created_at', { ascending: false }).limit(50);
      const { data, count, error } = await query;
      if (error) throw error;
      return NextResponse.json({ activities: data || [], total: count || 0 });
    }

    let list = memoryStore.activities;
    if (leadId) list = list.filter((a) => a.lead_id === leadId);
    if (companyId) list = list.filter((a) => a.company_id === companyId);
    if (type) list = list.filter((a) => a.activity_type === type);

    return NextResponse.json({ activities: list, total: list.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
