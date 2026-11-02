// Queenstown Lead Intelligence - Opportunities / CRM Pipeline API Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { Opportunity, PipelineStage } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') as PipelineStage | null;

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from('opportunities')
        .select('*, lead:leads(*), company:companies(*)', { count: 'exact' });

      if (stage) {
        query = query.eq('stage', stage);
      }

      query = query.order('created_at', { ascending: false });
      const { data, count, error } = await query;
      if (error) throw error;
      return NextResponse.json({ opportunities: data || [], total: count || 0 });
    }

    let list = memoryStore.opportunities;
    if (stage) {
      list = list.filter((o) => o.stage === stage);
    }

    return NextResponse.json({ opportunities: list, total: list.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stage, deal_value, probability, expected_close_date, next_action, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Opportunity ID is required.' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (stage) updateData.stage = stage;
      if (deal_value !== undefined) updateData.deal_value = deal_value;
      if (probability !== undefined) updateData.probability = probability;
      if (expected_close_date !== undefined) updateData.expected_close_date = expected_close_date;
      if (next_action !== undefined) updateData.next_action = next_action;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabaseAdmin
        .from('opportunities')
        .update(updateData)
        .eq('id', id)
        .select('*, lead:leads(*), company:companies(*)')
        .single();

      if (error) throw error;

      if (stage) {
        await supabaseAdmin.from('activities').insert({
          lead_id: data.lead_id,
          company_id: data.company_id,
          activity_type: 'stage_updated',
          title: `Opportunity Stage Updated: ${stage.toUpperCase()}`,
          description: `Deal Value: $${data.deal_value} | Next: ${data.next_action || 'None'}`,
          metadata: { stage, deal_value: data.deal_value },
          created_by: 'user',
        });
      }

      return NextResponse.json({ opportunity: data });
    }

    const idx = memoryStore.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 });
    }

    const current = memoryStore.opportunities[idx];
    if (stage) current.stage = stage;
    if (deal_value !== undefined) current.deal_value = Number(deal_value);
    if (probability !== undefined) current.probability = Number(probability);
    if (expected_close_date !== undefined) current.expected_close_date = expected_close_date;
    if (next_action !== undefined) current.next_action = next_action;
    if (notes !== undefined) current.notes = notes;
    current.updated_at = new Date().toISOString();

    if (stage) {
      memoryStore.recordActivity({
        lead_id: current.lead_id,
        company_id: current.company_id,
        activity_type: 'stage_updated',
        title: `Opportunity Stage Updated: ${stage.toUpperCase()}`,
        description: `Deal Value: $${current.deal_value} | Next: ${current.next_action || 'None'}`,
        metadata: { stage, deal_value: current.deal_value },
        created_by: 'user',
      });
    }

    return NextResponse.json({ opportunity: current });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
