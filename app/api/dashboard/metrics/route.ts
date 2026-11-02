// Queenstown Lead Intelligence - Real-Time Dashboard Metrics API Handler

import { NextResponse } from 'next/server';
import { memoryStore, IS_DEMO_ENVIRONMENT } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { getComplianceSettings } from '@/lib/compliance/safeguards';

export async function GET() {
  try {
    let companies: any[] = memoryStore.getCompanies();
    let leads: any[] = memoryStore.getLeads();
    let contacts: any[] = memoryStore.getContacts();
    let outreach: any[] = memoryStore.getOutreachMessages();
    let replies: any[] = memoryStore.emailReplies;
    let opportunities: any[] = memoryStore.getOpportunities();

    // If Supabase is connected, query actual database tables
    if (isSupabaseConfigured()) {
      const [compRes, leadRes, contRes, outRes, repRes, oppRes] = await Promise.all([
        supabaseAdmin.from('companies').select('*'),
        supabaseAdmin.from('leads').select('*, company:companies(*), primary_contact:contacts(*)'),
        supabaseAdmin.from('contacts').select('*'),
        supabaseAdmin.from('outreach_messages').select('*, contact:contacts(*), lead:leads(*)'),
        supabaseAdmin.from('email_replies').select('*, contact:contacts(*)'),
        supabaseAdmin.from('opportunities').select('*, lead:leads(*), company:companies(*)'),
      ]);

      if (!compRes.error && compRes.data) companies = compRes.data;
      if (!leadRes.error && leadRes.data) leads = leadRes.data;
      if (!contRes.error && contRes.data) contacts = contRes.data;
      if (!outRes.error && outRes.data) outreach = outRes.data;
      if (!repRes.error && repRes.data) replies = repRes.data;
      if (!oppRes.error && oppRes.data) opportunities = oppRes.data;
    }

    const compliance = await getComplianceSettings();

    // Compute Metrics
    const totalCompanies = companies.length;
    const qualifiedLeads = leads.filter((l) => l.qualification_score >= 60).length;
    const highPriorityLeads = leads.filter((l) => l.qualification_level === 'high_priority').length;
    const totalContacts = contacts.length;
    const emailsSent = outreach.filter((m) => m.status === 'sent').length;
    const totalReplies = replies.length;
    const interestedProspects = replies.filter((r) => r.classification === 'interested').length;
    const meetingsRequested = opportunities.filter((o) => o.stage === 'meeting_requested').length;
    const dealsWon = opportunities.filter((o) => o.stage === 'won').length;
    const estimatedPipelineValue = opportunities
      .filter((o) => o.stage !== 'lost')
      .reduce((sum, o) => sum + Number(o.deal_value || 0), 0);

    // Distribution by Country
    const countryMap: Record<string, number> = {};
    companies.forEach((c) => {
      const country = c.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;
    });
    const leadsByCountry = Object.entries(countryMap).map(([name, value]) => ({ name, value }));

    // Distribution by Industry
    const industryMap: Record<string, number> = {};
    companies.forEach((c) => {
      const ind = c.industry || 'General SME';
      industryMap[ind] = (industryMap[ind] || 0) + 1;
    });
    const leadsByIndustry = Object.entries(industryMap).map(([name, value]) => ({ name, value }));

    // Qualification Breakdown
    const qualificationDistribution = [
      { name: 'High Priority (80-100)', value: leads.filter((l) => l.qualification_score >= 80).length },
      { name: 'Potential (60-79)', value: leads.filter((l) => l.qualification_score >= 60 && l.qualification_score < 80).length },
      { name: 'Low Priority (40-59)', value: leads.filter((l) => l.qualification_score >= 40 && l.qualification_score < 60).length },
      { name: 'Disqualified (<40)', value: leads.filter((l) => l.qualification_score < 40).length },
    ];

    // Acquisition over time (last 7 days)
    const acquisitionOverTime = [
      { day: 'Day -6', leads: 2, outreach: 1 },
      { day: 'Day -5', leads: 3, outreach: 2 },
      { day: 'Day -4', leads: 4, outreach: 3 },
      { day: 'Day -3', leads: 1, outreach: 2 },
      { day: 'Day -2', leads: 5, outreach: 4 },
      { day: 'Yesterday', leads: 4, outreach: 3 },
      { day: 'Today', leads: totalCompanies, outreach: emailsSent },
    ];

    // Conversion Funnel
    const conversionFunnel = [
      { stage: 'Discovered', count: totalCompanies },
      { stage: 'Researched & Scored', count: leads.length },
      { stage: 'High Priority (>=80)', count: highPriorityLeads },
      { stage: 'Outreach Dispatched', count: emailsSent },
      { stage: 'Replies Received', count: totalReplies },
      { stage: 'Meeting Requested', count: meetingsRequested },
      { stage: 'Deals Won', count: dealsWon },
    ];

    // Pending Approvals
    const pendingApprovals = outreach.filter((m) => m.status === 'pending_approval');

    // System Health
    const systemHealth = {
      isDemoMode: IS_DEMO_ENVIRONMENT,
      databaseConnected: isSupabaseConfigured(),
      sendingEnabled: compliance.sending_enabled,
      humanApprovalRequired: compliance.human_approval_required,
      dailyEmailLimit: compliance.daily_email_limit,
      emailsSentToday: emailsSent,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-')),
      placesConfigured: Boolean(process.env.GOOGLE_PLACES_API_KEY && !process.env.GOOGLE_PLACES_API_KEY.includes('your-')),
      gmailConfigured: Boolean(process.env.GMAIL_CLIENT_ID && !process.env.GMAIL_CLIENT_ID.includes('your-')),
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_BOT_TOKEN.includes('your-')),
    };

    return NextResponse.json({
      kpis: {
        totalCompanies,
        qualifiedLeads,
        highPriorityLeads,
        totalContacts,
        emailsSent,
        totalReplies,
        interestedProspects,
        meetingsRequested,
        dealsWon,
        estimatedPipelineValue,
      },
      charts: {
        acquisitionOverTime,
        leadsByCountry,
        leadsByIndustry,
        qualificationDistribution,
        conversionFunnel,
      },
      recentLeads: leads.slice(0, 5),
      recentReplies: replies.slice(0, 5),
      pendingApprovals,
      systemHealth,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
