// Queenstown Lead Intelligence - Outreach Approval API Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message_id, action, subject, body: editedBody } = body;

    if (!message_id || !action) {
      return NextResponse.json(
        { error: 'message_id and action (approve | reject | edit_and_approve) are required.' },
        { status: 400 }
      );
    }

    const nextStatus = action === 'reject' ? 'cancelled' : 'approved';

    if (isSupabaseConfigured()) {
      const updatePayload: Record<string, unknown> = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };
      if (subject) updatePayload.subject = subject;
      if (editedBody) updatePayload.body = editedBody;

      const { data, error } = await supabaseAdmin
        .from('outreach_messages')
        .update(updatePayload)
        .eq('id', message_id)
        .select('*, contact:contacts(*), lead:leads(*)')
        .single();

      if (error) throw error;

      await supabaseAdmin.from('activities').insert({
        lead_id: data.lead_id,
        activity_type: 'email_approved',
        title: `Outreach Message ${nextStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Subject: ${data.subject}`,
        metadata: { action, status: nextStatus },
        created_by: 'operator',
      });

      return NextResponse.json({ success: true, message: data });
    }

    const idx = memoryStore.outreachMessages.findIndex((m) => m.id === message_id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Outreach message not found.' }, { status: 404 });
    }

    const current = memoryStore.outreachMessages[idx];
    current.status = nextStatus;
    if (subject) current.subject = subject;
    if (editedBody) current.body = editedBody;
    current.updated_at = new Date().toISOString();

    memoryStore.recordActivity({
      lead_id: current.lead_id,
      activity_type: 'email_approved',
      title: `Outreach Message ${nextStatus === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `Subject: ${current.subject}`,
      metadata: { action, status: nextStatus },
      created_by: 'operator',
    });

    return NextResponse.json({ success: true, message: current });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
