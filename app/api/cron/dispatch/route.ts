// Queenstown Lead Intelligence - Vercel Autopilot: Email Dispatch & Follow-up Cron
// Runs on schedule: Every 15 minutes or hourly

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { evaluateSendingEligibility, getComplianceSettings } from '@/lib/compliance/safeguards';
import { dispatchOutreachEmail } from '@/lib/email/dispatcher';
import { sendDiscordNotification } from '@/lib/notifications/discord';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutopilotDispatch(req);
}

export async function POST(req: NextRequest) {
  return handleAutopilotDispatch(req);
}

async function handleAutopilotDispatch(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    // 1. Check Safeguards & Kill Switch
    const eligibility = await evaluateSendingEligibility();
    if (!eligibility.eligible) {
      return NextResponse.json({
        success: true,
        dispatchedCount: 0,
        status: 'sending_paused',
        reason: eligibility.reason,
        dailySentCount: eligibility.dailySentCount,
        dailyLimit: eligibility.dailyLimit,
      });
    }

    // 2. Claim up to 5 approved messages using concurrency-safe stored function
    const { data: claimed, error: claimErr } = await supabaseAdmin.rpc('claim_eligible_outbound_messages', {
      batch_size: 5,
    });

    if (claimErr) {
      console.error('[Dispatch Cron] Error claiming messages:', claimErr);
      return NextResponse.json({ error: claimErr.message }, { status: 500 });
    }

    const messages = claimed || [];
    let dispatchedCount = 0;

    for (const msg of messages) {
      // Fetch recipient contact details
      const { data: contact } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('id', msg.contact_id)
        .single();

      if (!contact || !contact.email) continue;

      const compliance = await getComplianceSettings();
      const result = await dispatchOutreachEmail({
        to: contact.email,
        subject: msg.subject,
        body: msg.body,
        fromName: compliance.sender_name || 'Queenstown Labs',
        fromEmail: compliance.sender_email,
      });

      if (result.success) {
        dispatchedCount++;
        await supabaseAdmin
          .from('outreach_messages')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            provider_message_id: result.providerMessageId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', msg.id);

        // Record activity
        await supabaseAdmin.from('activities').insert({
          lead_id: msg.lead_id,
          activity_type: 'email_sent',
          title: `Autonomous Outreach Dispatched to ${contact.email}`,
          description: `Subject: ${msg.subject}`,
          metadata: { provider_message_id: result.providerMessageId },
          created_by: 'system',
        });
      } else {
        await supabaseAdmin
          .from('outreach_messages')
          .update({
            status: 'failed',
            error_message: result.error || 'Failed to dispatch email',
            updated_at: new Date().toISOString(),
          })
          .eq('id', msg.id);
      }
    }

    // 3. Notify Discord if any emails were dispatched
    if (dispatchedCount > 0) {
      await sendDiscordNotification({
        title: '🚀 Vercel Autopilot: Outreach Batch Dispatched',
        message: `Successfully dispatched **${dispatchedCount}** cold outreach email(s) via Gmail API.`,
        level: 'success',
        fields: [
          { name: 'Dispatched Today', value: `${(eligibility.dailySentCount || 0) + dispatchedCount} / ${eligibility.dailyLimit}`, inline: true },
          { name: 'Queue Status', value: 'Batch Completed', inline: true },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      claimedCount: messages.length,
      dispatchedCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Autopilot Dispatch Cron Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
