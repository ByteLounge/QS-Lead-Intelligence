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
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        status: 'database_not_configured',
        message: 'Supabase is not configured.',
      }, { status: 200 });
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
      }, { status: 200 });
    }

    const availableSlots = Math.max(0, eligibility.dailyLimit - eligibility.dailySentCount);
    if (availableSlots <= 0) {
      return NextResponse.json({
        success: true,
        dispatchedCount: 0,
        status: 'daily_limit_reached',
        reason: `Daily sending limit of ${eligibility.dailyLimit} reached.`,
        dailySentCount: eligibility.dailySentCount,
        dailyLimit: eligibility.dailyLimit,
      }, { status: 200 });
    }

    const batchLimit = Math.min(5, availableSlots);
    let messages: any[] = [];

    // 2. Claim up to batchLimit messages (Try RPC first with correct 'p_limit' parameter)
    try {
      const { data: rpcClaimed, error: rpcErr } = await supabaseAdmin.rpc('claim_eligible_outbound_messages', {
        p_limit: batchLimit,
      });

      if (!rpcErr && Array.isArray(rpcClaimed) && rpcClaimed.length > 0) {
        messages = rpcClaimed;
      }
    } catch (rpcEx) {
      console.warn('[Dispatch Cron] RPC claim failed or not found, falling back to direct table query:', rpcEx);
    }

    // Direct fallback if RPC was not found or returned empty
    if (messages.length === 0) {
      const { data: directClaimed, error: directErr } = await supabaseAdmin
        .from('outreach_messages')
        .select('id, lead_id, contact_id, subject, body, sequence_number, status, scheduled_at')
        .eq('status', 'approved')
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(batchLimit);

      if (!directErr && directClaimed && directClaimed.length > 0) {
        messages = directClaimed;
      }
    }

    // If no approved messages ready for sending
    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        status: 'idle',
        claimedCount: 0,
        dispatchedCount: 0,
        message: 'No approved outreach messages in queue awaiting dispatch. Queue is clear.',
      }, { status: 200 });
    }

    let dispatchedCount = 0;
    const compliance = await getComplianceSettings();

    for (const msg of messages) {
      // Fetch recipient contact details
      const { data: contact } = await supabaseAdmin
        .from('contacts')
        .select('*')
        .eq('id', msg.contact_id)
        .single();

      if (!contact || !contact.email) continue;

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
        message: `Successfully dispatched **${dispatchedCount}** cold outreach email(s) via automated transport.`,
        level: 'success',
        fields: [
          {
            name: 'Dispatched Today',
            value: `${(eligibility.dailySentCount || 0) + dispatchedCount} / ${eligibility.dailyLimit}`,
            inline: true,
          },
          { name: 'Queue Status', value: 'Batch Completed', inline: true },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      claimedCount: messages.length,
      dispatchedCount,
      message: `Dispatched ${dispatchedCount} outreach message(s).`,
    }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Autopilot Dispatch Cron Error]:', message);
    return NextResponse.json({
      success: false,
      error: message,
      status: 'error_handled',
    }, { status: 200 });
  }
}
