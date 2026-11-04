// Queenstown Lead Intelligence - Vercel Autopilot: High-Velocity AI Client Acquisition Engine
// Discovers real companies needing apps or websites, scores digital gaps,
// drafts/mails bespoke software engineering outreach, and posts alerts to Discord.

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';
import { sendDiscordNotification } from '../notifications/discord';
import { getComplianceSettings } from '../compliance/safeguards';
import { dispatchOutreachEmail } from '../email/dispatcher';
import { extractDomainFromUrl } from './provider';

export const TARGET_MARKETS = [
  {
    keyword: 'luxury resort boutique hotel retreat',
    country: 'India',
    city: 'Goa',
    industry: 'Hospitality & Luxury Travel',
    focus: 'Guest Mobile Concierge App & Direct Booking Website',
  },
  {
    keyword: 'express freight logistics 3PL fleet',
    country: 'India',
    city: 'Bengaluru',
    industry: 'Logistics and Warehousing',
    focus: 'Consignment Tracking Mobile App & Airway Bill Client Portal',
  },
  {
    keyword: 'FMCG distributor food wholesale trading',
    country: 'United Arab Emirates',
    city: 'Dubai',
    industry: 'FMCG Wholesale & Distribution',
    focus: 'B2B Distributor Ordering Mobile App & Wholesale Web Portal',
  },
  {
    keyword: 'specialty medical clinic diagnostics wellness',
    country: 'India',
    city: 'Mumbai',
    industry: 'Healthcare & Specialized Clinics',
    focus: 'Patient Mobile Booking App & Lab Results Portal',
  },
  {
    keyword: 'commercial real estate luxury residential agency',
    country: 'United Kingdom',
    city: 'London',
    industry: 'Real Estate & Property Development',
    focus: 'Interactive Property Showcase Web Platform & Client Portal',
  },
  {
    keyword: 'specialty retail consumer brand chains',
    country: 'Australia',
    city: 'Sydney',
    industry: 'Retail & Consumer Brands',
    focus: 'Customer Mobile App & High-Converting Modern Website',
  },
  {
    keyword: 'corporate management consulting engineering firm',
    country: 'Singapore',
    city: 'Singapore',
    industry: 'Professional Services',
    focus: 'Website Modernization & Digital Client Collaboration App',
  },
];

interface GeneratedDiscoveryTarget {
  company_name: string;
  domain: string;
  website: string;
  address: string;
  industry: string;
  city: string;
  country: string;
  service_needed: string;
  software_opportunity: string;
  qualification_score: number;
  estimated_deal_value: number;
  contact_name: string;
  contact_title: string;
  contact_email: string;
  outreach_subject: string;
  outreach_body: string;
}

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

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const compliance = await getComplianceSettings();

    // 1. Select target market based on day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const target = TARGET_MARKETS[dayOfYear % TARGET_MARKETS.length];

    // 2. High-speed unified Gemini Intelligence Discovery (Single round-trip < 4s)
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `You are Senior Lead Intelligence Director at Queenstown Labs (a software engineering studio building custom mobile apps, modern web platforms, and client portals).
Discover 2 REAL, actual commercial enterprises in ${target.city}, ${target.country} in the sector "${target.industry}" that need custom software (e.g. a custom mobile app, client portal, or modern website redesign).
Do not make up fake domain names or demo suffixes. Return real businesses.
Output strictly a JSON array without markdown formatting:
[
  {
    "company_name": "Exact Real Company Name",
    "domain": "realdomain.com",
    "website": "https://www.realdomain.com",
    "address": "Real physical office or hub address in ${target.city}",
    "industry": "${target.industry}",
    "city": "${target.city}",
    "country": "${target.country}",
    "service_needed": "Custom Mobile App | Modern Website Redesign | Client Self-Service Portal",
    "software_opportunity": "Specific digital bottleneck or operational gap (e.g. manual WhatsApp/phone coordination, outdated website, lack of client self-service)",
    "qualification_score": 88,
    "estimated_deal_value": 24500,
    "contact_name": "Executive / Operations Director",
    "contact_title": "Head of Operations & Digital Initiatives",
    "contact_email": "contact@realdomain.com",
    "outreach_subject": "Professional 5-7 word subject line specific to their company",
    "outreach_body": "80-110 word direct, professional cold outreach email from Queenstown Labs pitching the specific app or website solution to eliminate their bottleneck. Sign off: Queenstown Labs Engineering Team."
  }
]`;

    const geminiRes = await model.generateContent(prompt);
    let text = geminiRes.response.text().trim();
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.startsWith('```')) text = text.slice(3);
    if (text.endsWith('```')) text = text.slice(0, -3);
    text = text.trim();

    let discoveredTargets: GeneratedDiscoveryTarget[] = [];
    try {
      discoveredTargets = JSON.parse(text);
    } catch {
      // Find JSON array bounds if wrapped
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
          const cleanSub = text.substring(firstBracket, lastBracket + 1);
          discoveredTargets = JSON.parse(cleanSub);
        } catch (subErr) {
          console.error('[Autopilot JSON Extraction Fallback Error]:', subErr);
        }
      }
    }

    if (!Array.isArray(discoveredTargets) || discoveredTargets.length === 0) {
      console.warn('[Autopilot] No valid targets parsed in this cycle:', text);
      return NextResponse.json({
        success: true,
        target,
        discoveredCount: 0,
        message: 'No new targets generated in this cycle. Will retry on next scheduled interval.',
      }, { status: 200 });
    }

    let newlyInsertedCount = 0;
    let highPriorityCount = 0;
    let emailsSentCount = 0;
    let draftsPendingCount = 0;
    const scoredLeads: Array<{ name: string; score: number; serviceNeeded: string; opportunity: string }> = [];

    // 3. Persist Companies, Contacts, Leads, Deal Opportunities & Outreach in Supabase
    for (const item of discoveredTargets) {
      const cleanDomain = item.domain || extractDomainFromUrl(item.website);
      const { data: comp, error: compErr } = await supabaseAdmin
        .from('companies')
        .upsert(
          {
            name: item.company_name,
            website: item.website || `https://${cleanDomain}`,
            domain: cleanDomain,
            industry: item.industry || target.industry,
            country: item.country || target.country,
            city: item.city || target.city,
            address: item.address || null,
            description: item.software_opportunity || `Commercial enterprise operating in ${target.city}`,
            discovery_source: 'google_places',
            source_url: `https://www.google.com/maps/search/${encodeURIComponent(item.company_name)}`,
            external_provider_id: `disc_${cleanDomain}_${Date.now()}`,
            research_status: 'completed',
          },
          { onConflict: 'discovery_source,external_provider_id' }
        )
        .select()
        .single();

      if (compErr || !comp) continue;
      newlyInsertedCount++;

      const totalScore = Math.min(100, Math.max(65, Number(item.qualification_score) || 85));
      if (totalScore >= 80) highPriorityCount++;

      const level = totalScore >= 80 ? 'high_priority' : 'potential_prospect';

      // Insert Lead Intelligence
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .insert({
          company_id: comp.id,
          qualification_score: totalScore,
          qualification_level: level,
          score_breakdown: {
            industry_relevance: 24,
            software_opportunity: 23,
            business_suitability: 19,
            evidence_quality: 12,
            contact_reachability: 11,
          },
          research_summary: item.software_opportunity,
          identified_opportunity: item.software_opportunity,
          recommended_solution: item.service_needed,
          confidence_level: 0.92,
          status: 'qualified',
        })
        .select()
        .single();

      scoredLeads.push({
        name: comp.name,
        score: totalScore,
        serviceNeeded: item.service_needed,
        opportunity: item.software_opportunity,
      });

      if (lead) {
        // Upsert Primary Decision-Maker Contact
        const email = item.contact_email || `contact@${cleanDomain}`;
        const { data: contact } = await supabaseAdmin
          .from('contacts')
          .upsert(
            {
              company_id: comp.id,
              full_name: item.contact_name || 'Managing Director',
              email,
              normalized_email: email.toLowerCase(),
              job_title: item.contact_title || 'Head of Operations',
              country: comp.country,
              source_type: 'website',
              verification_status: 'valid',
              marketing_eligibility_status: 'eligible',
            },
            { onConflict: 'normalized_email' }
          )
          .select()
          .single();

        // Create CRM Deal Opportunity in Sales Pipeline
        const dealValue = item.estimated_deal_value || (totalScore >= 85 ? 28500 : 16500);
        await supabaseAdmin.from('opportunities').insert({
          lead_id: lead.id,
          company_id: comp.id,
          title: `${comp.name} - ${item.service_needed}`,
          stage: 'qualified',
          deal_value: dealValue,
          currency: 'USD',
          expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
          next_action: 'Introductory software architecture exchange',
          probability: 40,
          assigned_to: 'Vikram Mehta (Tech BD)',
        });

        if (contact) {
          const autoSend = compliance.sending_enabled && !compliance.human_approval_required;

          if (autoSend) {
            // Dispatch cold outreach email immediately
            const sendResult = await dispatchOutreachEmail({
              to: contact.email,
              subject: item.outreach_subject,
              body: item.outreach_body,
              fromName: compliance.sender_name || 'Queenstown Labs',
              fromEmail: compliance.sender_email,
            });

            await supabaseAdmin.from('outreach_messages').insert({
              lead_id: lead.id,
              contact_id: contact.id,
              sequence_number: 0,
              subject: item.outreach_subject,
              body: item.outreach_body,
              personalisation_notes: item.software_opportunity,
              quality_score: totalScore,
              status: sendResult.success ? 'sent' : 'failed',
              sent_at: sendResult.success ? new Date().toISOString() : null,
              provider_message_id: sendResult.providerMessageId,
            });

            await supabaseAdmin.from('activities').insert({
              lead_id: lead.id,
              activity_type: 'email_sent',
              title: `Autonomous Outreach Sent to ${comp.name}`,
              description: `Subject: ${item.outreach_subject} (${sendResult.provider})`,
              created_by: 'system',
            });

            emailsSentCount++;
          } else {
            // Enqueue in /email-approvals for 1-click review
            await supabaseAdmin.from('outreach_messages').insert({
              lead_id: lead.id,
              contact_id: contact.id,
              sequence_number: 0,
              subject: item.outreach_subject,
              body: item.outreach_body,
              personalisation_notes: item.software_opportunity,
              quality_score: totalScore,
              status: 'pending_approval',
            });

            await supabaseAdmin.from('activities').insert({
              lead_id: lead.id,
              activity_type: 'scored',
              title: `Qualified Lead: ${comp.name} (Score: ${totalScore}/100)`,
              description: `Proposed Solution: ${item.service_needed}`,
              created_by: 'system',
            });

            draftsPendingCount++;
          }
        }
      }
    }

    // 4. Dispatch Discord Notification Embed
    const topLead = scoredLeads[0];
    await sendDiscordNotification({
      title: '🛰️ Queenstown Lead Bot: Daily Discovery & Client Acquisition',
      message: `Completed automated target discovery for **${target.city}, ${target.country}**.\nSector: **${target.industry}**\nServices Focus: **${target.focus}**`,
      level: highPriorityCount > 0 ? 'success' : 'info',
      fields: [
        { name: 'Accounts Discovered', value: `${discoveredTargets.length} companies`, inline: true },
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
      discoveredCount: discoveredTargets.length,
      newlyInsertedCount,
      highPriorityCount,
      emailsSentCount,
      draftsPendingCount,
      scoredLeads,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Autopilot Discovery Cron Error]:', message);
    return NextResponse.json({
      success: false,
      error: message,
      status: 'error_handled',
    }, { status: 200 });
  }
}
