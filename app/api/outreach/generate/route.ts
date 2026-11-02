// Queenstown Lead Intelligence - AI Outreach Generation API Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { generatePersonalizedOutreach } from '@/lib/ai/gemini';
import { OutreachMessage } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead_id, contact_id } = body;

    if (!lead_id || !contact_id) {
      return NextResponse.json(
        { error: 'lead_id and contact_id are required to generate personalized outreach.' },
        { status: 400 }
      );
    }

    let lead = null;
    let contact = null;

    if (isSupabaseConfigured()) {
      const [lRes, cRes] = await Promise.all([
        supabaseAdmin.from('leads').select('*, company:companies(*)').eq('id', lead_id).single(),
        supabaseAdmin.from('contacts').select('*').eq('id', contact_id).single(),
      ]);
      lead = lRes.data;
      contact = cRes.data;
    } else {
      lead = memoryStore.getLeadById(lead_id);
      contact = memoryStore.contacts.find((c) => c.id === contact_id);
    }

    if (!lead || !contact) {
      return NextResponse.json({ error: 'Lead or Contact not found.' }, { status: 404 });
    }

    const companyName = lead.company?.name || 'Prospect Company';
    const industry = lead.company?.industry || 'Logistics and Warehousing';
    const opportunity = lead.identified_opportunity || 'Manual inventory and distributor dispatch coordination';
    const solution = lead.recommended_solution || 'Bespoke Warehouse Management and Automation Suite';

    // Call Gemini Outreach Writer
    const generated = await generatePersonalizedOutreach({
      recipientName: contact.full_name,
      recipientTitle: contact.job_title || undefined,
      companyName,
      industry,
      opportunity,
      recommendedSolution: solution,
    });

    const newMessage: OutreachMessage = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lead_id,
      contact_id,
      sequence_number: 0,
      subject: generated.subject,
      body: generated.body,
      personalisation_notes: generated.personalisation_rationale,
      quality_score: generated.quality_score,
      status: 'pending_approval',
      scheduled_at: new Date(Date.now() + 3600000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      contact,
      lead,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('outreach_messages')
        .upsert(
          {
            lead_id: newMessage.lead_id,
            contact_id: newMessage.contact_id,
            sequence_number: newMessage.sequence_number,
            subject: newMessage.subject,
            body: newMessage.body,
            personalisation_notes: newMessage.personalisation_notes,
            quality_score: newMessage.quality_score,
            status: 'pending_approval',
            scheduled_at: newMessage.scheduled_at,
          },
          { onConflict: 'contact_id,sequence_number' }
        )
        .select('*, contact:contacts(*), lead:leads(*)')
        .single();

      if (error) throw error;
      return NextResponse.json({ message: data, generated });
    }

    // In-memory store
    memoryStore.outreachMessages.unshift(newMessage);
    memoryStore.recordActivity({
      lead_id,
      company_id: lead.company_id,
      activity_type: 'outreach_drafted',
      title: `Outreach Drafted: ${generated.subject}`,
      description: `Pending human approval for ${contact.full_name} (${contact.email})`,
      metadata: { quality_score: generated.quality_score },
      created_by: 'gemini_ai',
    });

    return NextResponse.json({ message: newMessage, generated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
