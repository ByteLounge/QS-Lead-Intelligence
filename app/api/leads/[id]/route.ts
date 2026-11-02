// Queenstown Lead Intelligence - Single Lead & Manual Scoring API Handler

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (isSupabaseConfigured()) {
      const { data: lead, error } = await supabaseAdmin
        .from('leads')
        .select('*, company:companies(*), primary_contact:contacts(*)')
        .eq('id', id)
        .single();

      if (error || !lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }

      const { data: evidence } = await supabaseAdmin
        .from('lead_evidence')
        .select('*')
        .eq('lead_id', id);

      return NextResponse.json({
        lead: { ...lead, evidence: evidence || [] },
      });
    }

    const lead = memoryStore.getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { score_override, score_override_reason, status } = body;

    let updatedLevel = undefined;
    if (score_override !== undefined && score_override !== null) {
      const num = Number(score_override);
      if (num >= 80) updatedLevel = 'high_priority';
      else if (num >= 60) updatedLevel = 'potential_prospect';
      else if (num >= 40) updatedLevel = 'low_priority';
      else updatedLevel = 'disqualified';
    }

    if (isSupabaseConfigured()) {
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (score_override !== undefined) updatePayload.score_override = score_override;
      if (score_override_reason !== undefined)
        updatePayload.score_override_reason = score_override_reason;
      if (updatedLevel) updatePayload.qualification_level = updatedLevel;
      if (status) updatePayload.status = status;

      const { data: lead, error } = await supabaseAdmin
        .from('leads')
        .update(updatePayload)
        .eq('id', id)
        .select('*, company:companies(*)')
        .single();

      if (error) throw error;

      // Log manual adjustment to activities
      if (score_override !== undefined) {
        await supabaseAdmin.from('activities').insert({
          lead_id: id,
          company_id: lead.company_id,
          activity_type: 'scored',
          title: `Manual Score Override: ${score_override}/100`,
          description: `Reason: ${score_override_reason || 'Manual review by operator'}`,
          metadata: { override_score: score_override, previous_score: lead.qualification_score },
          created_by: 'operator',
        });
      }

      return NextResponse.json({ lead });
    }

    const idx = memoryStore.leads.findIndex((l) => l.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const currentLead = memoryStore.leads[idx];
    const prevScore = currentLead.qualification_score;

    if (score_override !== undefined && score_override !== null) {
      currentLead.score_override = Number(score_override);
      currentLead.score_override_reason = score_override_reason || 'Manual override';
      if (updatedLevel) currentLead.qualification_level = updatedLevel as any;

      memoryStore.recordActivity({
        lead_id: id,
        company_id: currentLead.company_id,
        activity_type: 'scored',
        title: `Manual Score Override: ${score_override}/100`,
        description: `Reason: ${score_override_reason || 'Manual review'}`,
        metadata: { override_score: score_override, previous_score: prevScore },
        created_by: 'operator',
      });
    }

    if (status) {
      currentLead.status = status;
      memoryStore.recordActivity({
        lead_id: id,
        company_id: currentLead.company_id,
        activity_type: 'stage_updated',
        title: `Lead Status Updated to ${status}`,
        description: `Pipeline stage transition.`,
        metadata: { status },
        created_by: 'operator',
      });
    }

    currentLead.updated_at = new Date().toISOString();
    return NextResponse.json({ lead: currentLead });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
