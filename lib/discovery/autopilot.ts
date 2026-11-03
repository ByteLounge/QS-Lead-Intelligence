// Queenstown Lead Intelligence - Vercel Autopilot: Autonomous Discovery & Lead Generation
// Discovers companies needing custom apps, modern websites, or client portals,
// evaluates them with Gemini AI, crafts tailored outreach, and alerts Discord.

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesDiscoveryProvider } from './google-places';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';
import { analyzeCompanyIntelligence, generatePersonalizedOutreach } from '../ai/gemini';
import { sendDiscordNotification } from '../notifications/discord';
import { fetchAndExtractWebContent } from '../ai/web-extractor';
import { getComplianceSettings } from '../compliance/safeguards';
import { dispatchOutreachEmail } from '../email/dispatcher';

export const TARGET_MARKETS = [
  {
    keyword: 'luxury resort boutique hotel',
    country: 'India',
    city: 'Goa',
    industry: 'Hospitality & Luxury Travel',
    focus: 'Guest Mobile Concierge App & Direct Booking Website',
  },
  {
    keyword: 'express freight logistics 3PL',
    country: 'India',
    city: 'Bengaluru',
    industry: 'Logistics and Warehousing',
    focus: 'Consignment Tracking Mobile App & Airway Bill Client Portal',
  },
  {
    keyword: 'FMCG distributor food wholesale',
    country: 'United Arab Emirates',
    city: 'Dubai',
    industry: 'FMCG Wholesale & Distribution',
    focus: 'B2B Distributor Ordering Mobile App & Wholesale Web Portal',
  },
  {
    keyword: 'specialty medical clinic diagnostics',
    country: 'India',
    city: 'Mumbai',
    industry: 'Healthcare & Specialized Clinics',
    focus: 'Patient Mobile Booking App & Lab Results Portal',
  },
  {
    keyword: 'commercial real estate property agency',
    country: 'United Kingdom',
    city: 'London',
    industry: 'Real Estate & Property Development',
    focus: 'Interactive Property Showcase Web Platform & Client Portal',
  },
  {
    keyword: 'specialty consumer retail chain',
    country: 'Australia',
    city: 'Sydney',
    industry: 'Retail & Consumer Brands',
    focus: 'Customer Mobile App & High-Converting Modern Website',
  },
  {
    keyword: 'engineering consultancy corporate services',
    country: 'Singapore',
    city: 'Singapore',
    industry: 'Professional Services',
    focus: 'Website Modernization & Digital Client Collaboration App',
  },
];

export async function handleAutopilotDiscovery(req?: NextRequest) {
  try {
    if (req) {
      const authHeader = req.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized cron request.' }, { status: 401 });
      }
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const compliance = await getComplianceSettings();

    // 1. Select target market based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const target = TARGET_MARKETS[dayOfYear % TARGET_MARKETS.length];

    // 2. Run Discovery for companies needing apps or websites
    const provider = new GooglePlacesDiscoveryProvider();
    const discovered = await provider.search({
      keyword: target.keyword,
      country: target.country,
      city: target.city,
      industry: target.industry,
      maxResults: 2,
    });

    let newlyInsertedCount = 0;
    let highPriorityCount = 0;
    let emailsSentCount = 0;
    let draftsPendingCount = 0;
    const scoredLeads: Array<{ name: string; score: number; serviceNeeded: string; opportunity: string }> = [];

    // 3. Ingest, Research, Score & Pitch
    for (const item of discovered) {
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

      // Scrape public site text
      let siteText = comp.description || '';
      if (comp.website) {
        try {
          const scraped = await fetchAndExtractWebContent(comp.website, 2000);
          if (scraped.content) {
            siteText = `${scraped.title}\n${scraped.metaDescription}\n${scraped.content}`;
          }
        } catch {
          // Fallback
        }
      }

      // Analyze with Gemini AI for App and Website opportunities
      const analysis = await analyzeCompanyIntelligence({
        companyName: comp.name,
        industry: comp.industry,
        country: comp.country,
        city: comp.city || undefined,
        scrapedContent: siteText || `Commercial enterprise operating in ${target.city}, ${target.country}. Potential gap in mobile apps and modern website presence.`,
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

      const serviceNeeded = analysis.recommended_solution?.solution_title || target.focus;
      const opportunityText = analysis.software_opportunities?.[0] || 'Need for custom mobile app & web presence';

      // Insert Lead
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .insert({
          company_id: comp.id,
          qualification_score: totalScore,
          qualification_level: level,
          score_breakdown: analysis.score_components,
          research_summary: analysis.business_summary,
          identified_opportunity: opportunityText,
          recommended_solution: serviceNeeded,
          confidence_level: analysis.confidence_level,
          status: 'qualified',
        })
        .select()
        .single();

      scoredLeads.push({
        name: comp.name,
        score: totalScore,
        serviceNeeded,
        opportunity: opportunityText,
      });

      // If Qualified (Score >= 60), create contact, deal opportunity, and outreach
      if (lead && totalScore >= 60) {
        const contactEmail = `contact@${comp.domain || 'operations.local'}`;
        const { data: contact } = await supabaseAdmin
          .from('contacts')
          .upsert(
            {
              company_id: comp.id,
              full_name: 'Managing Director & Operations',
              email: contactEmail,
              normalized_email: contactEmail.toLowerCase(),
              job_title: 'Head of Operations & Digital Initiatives',
              country: comp.country,
              source_type: 'website',
              verification_status: 'valid',
              marketing_eligibility_status: 'eligible',
            },
            { onConflict: 'normalized_email' }
          )
          .select()
          .single();

        // Create Sales Opportunity in Deal Pipeline
        const estimatedDealValue = totalScore >= 85 ? 28500 : 16500;
        await supabaseAdmin.from('opportunities').insert({
          lead_id: lead.id,
          company_id: comp.id,
          title: `${comp.name} - ${serviceNeeded}`,
          stage: 'qualified',
          deal_value: estimatedDealValue,
          currency: 'USD',
          expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
          next_action: 'Introductory software architecture exchange',
          probability: 40,
          assigned_to: 'Vikram Mehta (Tech BD)',
        });

        if (contact) {
          // Generate 80-120 word email pitch tailored to Queenstown Labs services
          const emailDraft = await generatePersonalizedOutreach({
            recipientName: contact.full_name,
            recipientTitle: contact.job_title,
            companyName: comp.name,
            industry: comp.industry,
            opportunity: opportunityText,
            recommendedSolution: serviceNeeded,
          });

          // Check if auto-sending is active (human_approval_required == false and sending_enabled == true)
          const autoSend = compliance.sending_enabled && !compliance.human_approval_required;

          if (autoSend) {
            // Dispatch email directly
            const sendResult = await dispatchOutreachEmail({
              to: contact.email,
              subject: emailDraft.subject,
              body: emailDraft.body,
              fromName: compliance.sender_name || 'Queenstown Labs',
              fromEmail: compliance.sender_email,
            });

            await supabaseAdmin.from('outreach_messages').insert({
              lead_id: lead.id,
              contact_id: contact.id,
              sequence_number: 0,
              subject: emailDraft.subject,
              body: emailDraft.body,
              personalisation_notes: emailDraft.personalisation_rationale,
              quality_score: emailDraft.quality_score,
              status: sendResult.success ? 'sent' : 'failed',
              sent_at: sendResult.success ? new Date().toISOString() : null,
              provider_message_id: sendResult.providerMessageId,
            });

            await supabaseAdmin.from('activities').insert({
              lead_id: lead.id,
              activity_type: 'email_sent',
              title: `Autonomous Outreach Sent to ${comp.name}`,
              description: `Subject: ${emailDraft.subject} (${sendResult.provider})`,
              created_by: 'system',
            });

            emailsSentCount++;
          } else {
            // Enqueue for 1-click review on /email-approvals
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

            await supabaseAdmin.from('activities').insert({
              lead_id: lead.id,
              activity_type: 'scored',
              title: `Qualified Lead: ${comp.name} (Score: ${totalScore}/100)`,
              description: `Proposed Solution: ${serviceNeeded}`,
              created_by: 'system',
            });

            draftsPendingCount++;
          }
        }
      }
    }

    // 4. Dispatch Discord Notification
    const topLead = scoredLeads[0];
    await sendDiscordNotification({
      title: '🛰️ Queenstown Lead Bot: Daily Discovery & Client Acquisition',
      message: `Completed target discovery for **${target.city}, ${target.country}**.\nSector: **${target.industry}**\nServices Focus: **${target.focus}**`,
      level: highPriorityCount > 0 ? 'success' : 'info',
      fields: [
        { name: 'Accounts Discovered', value: `${discovered.length} companies`, inline: true },
        { name: 'High-Priority (≥80)', value: `${highPriorityCount} leads`, inline: true },
        {
          name: 'Outreach Pipeline',
          value: emailsSentCount > 0 ? `🚀 ${emailsSentCount} email(s) dispatched` : `📋 ${draftsPendingCount} draft(s) awaiting review`,
          inline: true,
        },
        {
          name: 'Top Software Opportunity',
          value: topLead
            ? `**${topLead.name}** (Score: ${topLead.score}/100)\n🎯 **Service:** ${topLead.serviceNeeded}\n💡 **Gap:** ${topLead.opportunity}`
            : 'No new accounts today',
          inline: false,
        },
        {
          name: 'Live Dashboard',
          value: '[queenstownlabslead.vercel.app](https://queenstownlabslead.vercel.app)',
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
      emailsSentCount,
      draftsPendingCount,
      scoredLeads,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Autopilot Discovery Cron Error]:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
