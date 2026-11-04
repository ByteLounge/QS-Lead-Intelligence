// Queenstown Lead Intelligence - Vercel Autopilot: Daily Performance Digest Cron
// Runs on schedule: Daily at 18:00 UTC (0 18 * * *)

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { sendDiscordNotification } from '@/lib/notifications/discord';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutopilotDigest(req);
}

export async function POST(req: NextRequest) {
  return handleAutopilotDigest(req);
}

async function handleAutopilotDigest(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    // 1. Fetch Metrics across tables
    const [compRes, leadRes, outRes, repRes, oppRes] = await Promise.all([
      supabaseAdmin.from('companies').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('leads').select('id, qualification_level'),
      supabaseAdmin.from('outreach_messages').select('id, status'),
      supabaseAdmin.from('email_replies').select('id, classification'),
      supabaseAdmin.from('opportunities').select('deal_value, stage'),
    ]);

    const totalCompanies = compRes.count || 0;
    const leads = leadRes.data || [];
    const highPriorityLeads = leads.filter((l) => l.qualification_level === 'high_priority').length;

    const messages = outRes.data || [];
    const pendingApprovals = messages.filter((m) => m.status === 'pending_approval').length;
    const emailsSent = messages.filter((m) => m.status === 'sent').length;

    const replies = repRes.data || [];
    const meetingRequests = replies.filter((r) => r.classification === 'meeting_request').length;

    const opportunities = oppRes.data || [];
    const totalPipelineValue = opportunities.reduce((acc, o) => acc + (Number(o.deal_value) || 0), 0);
    const dealsWon = opportunities.filter((o) => o.stage === 'closed_won').length;

    // 2. Dispatch Daily Digest Embed to Discord
    await sendDiscordNotification({
      title: '📊 Queenstown Labs: Daily Executive Pipeline Briefing',
      message: 'Autonomous daily summary of client acquisition, outreach pipeline, and sales momentum.',
      level: 'success',
      fields: [
        { name: 'Discovered Businesses', value: `${totalCompanies} accounts`, inline: true },
        { name: 'High-Priority Leads', value: `${highPriorityLeads} leads (score ≥80)`, inline: true },
        { name: 'Pending Review', value: `${pendingApprovals} drafts awaiting approval`, inline: true },
        { name: 'Emails Sent', value: `${emailsSent} sent`, inline: true },
        { name: 'Inbound Replies', value: `${replies.length} received`, inline: true },
        { name: 'Meeting Requests', value: `🎉 ${meetingRequests} meetings requested`, inline: true },
        { name: 'Active Opportunities', value: `${opportunities.length} deals in CRM`, inline: true },
        { name: 'Pipeline Value', value: `$${totalPipelineValue.toLocaleString()} USD`, inline: true },
        { name: 'Deals Won', value: `${dealsWon} deals`, inline: true },
        {
          name: 'Access Dashboard',
          value: '[queenstownlabslead.vercel.app](https://queenstownlabslead.vercel.app)',
          inline: false,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalCompanies,
        highPriorityLeads,
        pendingApprovals,
        emailsSent,
        repliesReceived: replies.length,
        meetingRequests,
        totalPipelineValue,
        dealsWon,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Autopilot Digest Cron Error]:', message);
    return NextResponse.json({
      success: false,
      error: message,
      status: 'error_handled',
    }, { status: 200 });
  }
}
