// Queenstown Lead Intelligence - Leads API Handler

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const level = searchParams.get('level') || '';
    const minScore = searchParams.get('minScore') ? Number(searchParams.get('minScore')) : null;
    const status = searchParams.get('status') || '';

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from('leads')
        .select('*, company:companies(*), primary_contact:contacts(*)', { count: 'exact' });

      if (level) {
        query = query.eq('qualification_level', level);
      }
      if (minScore !== null) {
        query = query.gte('qualification_score', minScore);
      }
      if (status) {
        query = query.eq('status', status);
      }

      query = query.order('qualification_score', { ascending: false });
      const { data, count, error } = await query;

      if (error) throw error;
      return NextResponse.json({ leads: data || [], total: count || 0 });
    }

    let filtered = memoryStore.leads;

    if (search) {
      filtered = filtered.filter(
        (l) =>
          (l.company && l.company.name.toLowerCase().includes(search)) ||
          (l.identified_opportunity && l.identified_opportunity.toLowerCase().includes(search)) ||
          (l.recommended_solution && l.recommended_solution.toLowerCase().includes(search))
      );
    }
    if (level) {
      filtered = filtered.filter((l) => l.qualification_level === level);
    }
    if (minScore !== null) {
      filtered = filtered.filter((l) => l.qualification_score >= minScore);
    }
    if (status) {
      filtered = filtered.filter((l) => l.status === status);
    }

    return NextResponse.json({
      leads: filtered,
      total: filtered.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
