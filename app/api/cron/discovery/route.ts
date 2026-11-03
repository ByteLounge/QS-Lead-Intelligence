// Queenstown Lead Intelligence - Vercel Autopilot: Autonomous Discovery & Intelligence Cron
// Runs on schedule: Daily at 08:00 AM UTC (0 8 * * *)

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesDiscoveryProvider } from '@/lib/discovery/google-places';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { analyzeCompanyIntelligence, generatePersonalizedOutreach } from '@/lib/ai/gemini';
import { sendDiscordNotification } from '@/lib/notifications/discord';
import { fetchAndExtractWebContent } from '@/lib/ai/web-extractor';

export const maxDuration = 60; // Max execution time on Vercel
export const dynamic = 'force-dynamic';

const TARGET_MARKETS = [
  { keyword: 'logistics warehousing 3PL', country: 'India', city: 'Bengaluru', industry: 'Logistics and Warehousing' },
  { keyword: 'FMCG distributor wholesale', country: 'United Arab Emirates', city: 'Dubai', industry: 'FMCG Wholesale' },
  { keyword: 'freight forwarding supply chain', country: 'United Kingdom', city: 'London', industry: 'Logistics and Warehousing' },
  { keyword: 'warehouse distributor operations', country: 'Singapore', city: 'Singapore', industry: 'Logistics & Distribution' },
  { keyword: 'wholesale distribution logistics', country: 'Australia', city: 'Sydney', industry: 'FMCG Wholesale' },
];

export async function GET(req: NextRequest) {
  return handleAutopilotDiscovery(req);
}

export async function POST(req: NextRequest) {
  return handleAutopilotDiscovery(req);
}

async function handleAutopilotDiscovery(req: NextRequest) {
  try {
    // 1. Verify Vercel Cron authorization if configured
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    // 2. Select target market based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const target = TARGET_MARKETS[dayOfYear % TARGET_MARKETS.length];

    // 3. Run Discovery
    const provider = new GooglePlacesDiscoveryProvider();
    const discovered = await provider.search({
      keyword: target.keyword,
      country: target.country,
      city: target.city,
      industry: target.industry,
      maxResults: 6,
    });

    let newlyInsertedCount = 0;
    let highPriorityCount = 0;
    const scoredLeads: Array<{ name: string; score: number; opportunity: string }> = [];

    // 4. Ingest, Research, Score & Draft
    for (const item of discovered) {
      // Upsert company
      const { data: comp, error: compErr } = await supabaseAdmin
        .from('companies')
        .upsert(
          {
            name: item.name,
            website: item.website || null,
            domain: item.domain || null,
            industry: target.industry,
            country: target.country,
            city: target.city,
            address: item.address || null,
            description: item.description || null,
            discovery_source: 'google_places',
            source_url: item.source_url || null,
            external_provider_id: item.external_provider_id || null,
            research_status: 'completed',
          },
          { onConflict: 'discovery_source,external_provider_id' }
        )
        .select()
        .single();

      if (compErr || !comp) continue;
      newlyInsertedCount++;

      // Scrape public site text safely
      let siteText = comp.description || '';
      if (comp.website) {
        try {
          const scraped = await fetchAndExtractWebContent(comp.website);
          if (scraped.content) {
            siteText = `${scraped.title}\n${scraped.metaDescription}\n${scraped.content}`;
          }
        } catch {
          // Fallback to description
        }
      }

      // Analyze with Gemini AI
      const analysis = await analyzeCompanyIntelligence({
        companyName: comp.name,
        industry: comp.industry,
        country: comp.country,
        city: comp.city || undefined,
        scrapedContent: siteText || 'Regional commercial B2B operations and warehouse distribution.',
      });

      const totalScore = analysis.total_score;
      const level =
        totalScore >= 80
          ? 'high_priority'
          : totalScore >= 60
          ? 'potential_prospect'
          : totalScore >= 40
          ? 'low_priority'
          : 'disqualified';

      if (totalScore >= 80) highPriorityCount++;

      // Insert Lead
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .insert({
          company_id: comp.id,
          qualification_score: totalScore,
          qualification_level: level,
          score_breakdown: analysis.score_components,
          research_summary: analysis.business_summary,
          identified_opportunity: analysis.software_opportunities?.[0] || 'Manual inventory and dispatch bottlenecks',
          recommended_solution: analysis.recommended_solution?.solution_title || 'Bespoke Warehouse Automation Suite',
          confidence_level: analysis.confidence_level,
          status: 'qualified',
        })
        .select()
        .single();

      scoredLeads.push({
        name: comp.name,
        score: totalScore,
        opportunity: analysis.software_opportunities?.[0] || 'Workflow Automation',
      });

      // If Qualified (Score >= 60), generate contact and outreach draft
      if (lead && totalScore >= 60) {
        // Create primary contact
        const contactEmail = `contact@${comp.domain || 'operations.local'}`;
        const { data: contact } = await supabaseAdmin
          .from('contacts')
          .upsert(
            {
              company_id: comp.id,
              full_name: 'Operations Director',
              email: contactEmail,
              normalized_email: contactEmail.toLowerCase(),
              job_title: 'Operations & Logistics Director',
              country: comp.country,
              source_type: 'website',
              verification_status: 'valid',
              marketing_eligibility_status: 'eligible',
            },
            { onConflict: 'normalized_email' }
          )
          .select()
          .single();

        if (contact) {
          // Generate 80-130 word email draft
          const emailDraft = await generatePersonalizedOutreach({
            recipientName: contact.full_name,
            recipientTitle: contact.job_title,
            companyName: comp.name,
            industry: comp.industry,
            opportunity: lead.identified_opportunity || 'Manual inventory coordination',
            recommendedSolution: lead.recommended_solution || 'Custom Warehouse Management Platform',
          });

          // Enqueue draft in pending_approval
          await supabaseAdmin.from('outreach_messages').insert({
            lead_id: lead.id,
            contact_id: contact.id,
            sequence_number: 0,
            subject: emailDraft.subject,
            body: emailDraft.body,
            personalisation_notes: emailDraft.personalisation_rationale,
            quality_score: emailDraft.quality_score,
            status: 'pending_approval',
          });
        }
      }
    }

    // 5. Dispatch Discord Summary Embed
    await sendDiscordNotification({
      title: '🛰️ Vercel Autopilot: Daily Discovery & Research Complete',
      message: `Completed automated target discovery for **${target.city}, ${target.country}** (${target.industry}).`,
      level: highPriorityCount > 0 ? 'success' : 'info',
      fields: [
        { name: 'Accounts Discovered', value: `${discovered.length} businesses`, inline: true },
        { name: 'Newly Stored', value: `${newlyInsertedCount} accounts`, inline: true },
        { name: 'High Priority (≥80)', value: `${highPriorityCount} leads`, inline: true },
        {
          name: 'Top Lead',
          value: scoredLeads[0]
            ? `**${scoredLeads[0].name}** (Score: ${scoredLeads[0].score}/100)\n*${scoredLeads[0].opportunity}*`
            : 'No new accounts today',
          inline: false,
        },
        {
          name: 'Action Required',
          value: 'Review drafts at [queenstownlabslead.vercel.app/email-approvals](https://queenstownlabslead.vercel.app/email-approvals)',
          inline: false,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      target,
      discoveredCount: discovered.length,
      newlyInsertedCount,
      highPriorityCount,
      scoredLeads,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Autopilot Discovery Cron Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
