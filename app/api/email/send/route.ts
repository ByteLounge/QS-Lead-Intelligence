// Queenstown Lead Intelligence - Email Dispatch Handler with Concurrency & Compliance Safeguards

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { evaluateSendingEligibility } from '@/lib/compliance/safeguards';
import { isEmailSuppressed } from '@/lib/contacts/manager';
import { sendEmailViaGmail } from '@/lib/email/gmail';
import { sendTelegramNotification } from '@/lib/notifications/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message_id, to, subject, body: emailBody } = body;

    if (!message_id || !to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'message_id, to, subject, and body are required.' },
        { status: 400 }
      );
    }

    // 1. Evaluate Global Sending Safeguards (Kill switch & Daily Limits)
    const eligibility = await evaluateSendingEligibility();
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason,
          safeguardTriggered: true,
          dailySentCount: eligibility.dailySentCount,
          dailyLimit: eligibility.dailyLimit,
        },
        { status: 403 }
      );
    }

    // 2. Evaluate Suppression List
    const suppressed = await isEmailSuppressed(to);
    if (suppressed) {
      // Mark message as suppressed
      if (isSupabaseConfigured()) {
        await supabaseAdmin
          .from('outreach_messages')
          .update({ status: 'suppressed', error_message: 'Recipient address is suppressed' })
          .eq('id', message_id);
      } else {
        const msg = memoryStore.outreachMessages.find((m) => m.id === message_id);
        if (msg) msg.status = 'suppressed';
      }

      return NextResponse.json(
        { error: 'Recipient is on the suppression list. Delivery halted.', suppressed: true },
        { status: 403 }
      );
    }

    // 3. Dispatch via Gmail Transport
    const dispatchResult = await sendEmailViaGmail({
      to,
      subject,
      body: emailBody,
    });

    if (!dispatchResult.success) {
      return NextResponse.json(
        { error: dispatchResult.error || 'Failed to dispatch email' },
        { status: 500 }
      );
    }

    // 4. Update Message Status in Database or Memory Store
    if (isSupabaseConfigured()) {
      const { data: updatedMsg } = await supabaseAdmin
        .from('outreach_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: dispatchResult.providerMessageId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message_id)
        .select()
        .single();

      await supabaseAdmin.from('activities').insert({
        lead_id: updatedMsg?.lead_id,
        activity_type: 'email_sent',
        title: `Outreach Dispatched to ${to}`,
        description: `Subject: ${subject}`,
        metadata: { provider_message_id: dispatchResult.providerMessageId },
        created_by: 'system',
      });
    } else {
      const msg = memoryStore.outreachMessages.find((m) => m.id === message_id);
      if (msg) {
        msg.status = 'sent';
        msg.sent_at = new Date().toISOString();
        msg.provider_message_id = dispatchResult.providerMessageId;
      }

      memoryStore.recordActivity({
        lead_id: msg?.lead_id,
        activity_type: 'email_sent',
        title: `Outreach Dispatched to ${to}`,
        description: `Subject: ${subject}`,
        metadata: { provider_message_id: dispatchResult.providerMessageId },
        created_by: 'system',
      });
    }

    // 5. Notify via Telegram
    await sendTelegramNotification({
      title: 'Outreach Email Sent',
      message: `To: ${to}\nSubject: ${subject}\nMessage ID: ${dispatchResult.providerMessageId}`,
      level: 'info',
    });

    return NextResponse.json({
      success: true,
      providerMessageId: dispatchResult.providerMessageId,
      threadId: dispatchResult.threadId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
