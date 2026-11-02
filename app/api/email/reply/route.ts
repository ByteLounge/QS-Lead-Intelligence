// Queenstown Lead Intelligence - Inbound Reply & Intent Classifier API Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { classifyEmailReply } from '@/lib/ai/gemini';
import { suppressContact } from '@/lib/contacts/manager';
import { sendTelegramNotification } from '@/lib/notifications/telegram';
import { EmailReply, Opportunity } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from_email, subject, body: replyBody, provider_message_id, thread_id } = body;

    if (!from_email || !replyBody) {
      return NextResponse.json(
        { error: 'from_email and body are mandatory fields for reply processing.' },
        { status: 400 }
      );
    }

    const normEmail = from_email.toLowerCase().trim();

    // 1. Classify reply intent via Gemini + Deterministic Guards
    const classification = await classifyEmailReply({
      fromEmail: normEmail,
      subject: subject || 'Re: Software Discussion',
      bodyText: replyBody,
    });

    const isOptOut = classification.opt_out_detected || classification.classification === 'unsubscribe';
    const isBounce = classification.classification === 'bounce';

    let contact: any = null;
    let lead: any = null;

    if (isSupabaseConfigured()) {
      const { data: cData } = await supabaseAdmin
        .from('contacts')
        .select('*, company:companies(*)')
        .eq('normalized_email', normEmail)
        .single();

      if (cData) {
        contact = cData;
        const { data: lData } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('company_id', cData.company_id)
          .single();
        lead = lData;
      }
    } else {
      contact = memoryStore.contacts.find((c) => c.normalized_email === normEmail);
      if (contact) {
        lead = memoryStore.leads.find((l) => l.company_id === contact.company_id);
      }
    }

    // 2. Opt-Out / Unsubscribe Safeguard: Immediately suppress contact
    if (isOptOut || isBounce) {
      await suppressContact(normEmail, isOptOut ? 'unsubscribe' : 'bounce', 'reply_processing');

      // Cancel all remaining sequence follow-ups
      if (isSupabaseConfigured() && contact) {
        await supabaseAdmin.rpc('cancel_sequence_on_reply', {
          p_contact_id: contact.id,
          p_reason: isOptOut ? 'unsubscribe_detected' : 'bounce_detected',
        });
      } else if (contact) {
        memoryStore.outreachMessages.forEach((m) => {
          if (m.contact_id === contact.id && m.status !== 'sent') {
            m.status = 'cancelled';
            m.error_message = 'Cancelled due to unsubscribe request.';
          }
        });
      }

      await sendTelegramNotification({
        title: isOptOut ? 'Contact Unsubscribed' : 'Email Bounced',
        message: `Email: ${normEmail}\nReason: ${classification.summary}\nAction: Contact suppressed and follow-ups cancelled.`,
        level: 'warning',
      });
    }

    // 3. Meeting Request / Interested: Promote lead in pipeline
    if (classification.classification === 'meeting_request' || classification.classification === 'interested') {
      const nextStage = classification.classification === 'meeting_request' ? 'meeting_requested' : 'interested';

      if (isSupabaseConfigured() && lead) {
        await supabaseAdmin
          .from('leads')
          .update({ status: nextStage, updated_at: new Date().toISOString() })
          .eq('id', lead.id);

        await supabaseAdmin.rpc('cancel_sequence_on_reply', {
          p_contact_id: contact.id,
          p_reason: 'positive_reply_received',
        });

        // Upsert opportunity
        await supabaseAdmin.from('opportunities').upsert(
          {
            lead_id: lead.id,
            company_id: lead.company_id,
            title: `Custom Software Solution - ${contact?.company?.name || 'Prospect'}`,
            stage: nextStage,
            deal_value: 12000,
            probability: nextStage === 'meeting_requested' ? 70 : 40,
            next_action: 'Schedule discovery call',
          },
          { onConflict: 'lead_id' }
        );
      } else if (lead) {
        lead.status = nextStage;
        if (contact) {
          memoryStore.outreachMessages.forEach((m) => {
            if (m.contact_id === contact.id && m.status !== 'sent') {
              m.status = 'cancelled';
              m.error_message = 'Cancelled due to positive reply received.';
            }
          });
        }

        const opp = memoryStore.opportunities.find((o) => o.lead_id === lead.id);
        if (opp) {
          opp.stage = nextStage;
          opp.probability = nextStage === 'meeting_requested' ? 75 : 50;
        } else {
          const newOpp: Opportunity = {
            id: `opp_${Date.now()}`,
            lead_id: lead.id,
            company_id: lead.company_id,
            title: `Custom Software Solution - ${contact?.full_name || 'Prospect'}`,
            stage: nextStage,
            deal_value: 12000,
            currency: 'USD',
            probability: nextStage === 'meeting_requested' ? 75 : 50,
            expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
            next_action: 'Discovery call scheduling',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            lead,
          };
          memoryStore.opportunities.unshift(newOpp);
        }
      }

      await sendTelegramNotification({
        title: classification.classification === 'meeting_request' ? 'HOT LEAD: Meeting Requested!' : 'Positive Prospect Interest!',
        message: `From: ${normEmail}\nSummary: ${classification.summary}\nNext Step: ${classification.recommended_action}`,
        level: 'success',
      });
    }

    // 4. Store Email Reply Record
    const replyRecord: EmailReply = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      contact_id: contact?.id || null,
      from_email: normEmail,
      subject: subject || 'Re: Outreach',
      body: replyBody,
      provider_message_id: provider_message_id || `msg_in_${Date.now()}`,
      thread_id: thread_id || null,
      classification: classification.classification,
      confidence_score: classification.confidence_score,
      summary: classification.summary,
      action_taken: classification.recommended_action,
      received_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      contact: contact || undefined,
    };

    if (isSupabaseConfigured()) {
      await supabaseAdmin.from('email_replies').insert({
        contact_id: replyRecord.contact_id,
        from_email: replyRecord.from_email,
        subject: replyRecord.subject,
        body: replyRecord.body,
        provider_message_id: replyRecord.provider_message_id,
        thread_id: replyRecord.thread_id,
        classification: replyRecord.classification,
        confidence_score: replyRecord.confidence_score,
        summary: replyRecord.summary,
        action_taken: replyRecord.action_taken,
      });

      await supabaseAdmin.from('activities').insert({
        lead_id: lead?.id,
        activity_type: 'reply_received',
        title: `Reply Received from ${normEmail}`,
        description: `Intent: ${classification.classification.toUpperCase()} | Summary: ${classification.summary}`,
        metadata: { classification: classification.classification },
        created_by: 'system',
      });
    } else {
      memoryStore.emailReplies.unshift(replyRecord);
      memoryStore.recordActivity({
        lead_id: lead?.id,
        activity_type: 'reply_received',
        title: `Reply Received from ${normEmail}`,
        description: `Intent: ${classification.classification.toUpperCase()} | Summary: ${classification.summary}`,
        metadata: { classification: classification.classification },
        created_by: 'system',
      });
    }

    return NextResponse.json({
      success: true,
      classification,
      reply: replyRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
