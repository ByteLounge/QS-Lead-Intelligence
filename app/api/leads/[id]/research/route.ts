// Queenstown Lead Intelligence - AI Intelligence & Research Execution Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAndExtractWebContent } from '@/lib/ai/web-extractor';
import { analyzeCompanyIntelligence } from '@/lib/ai/gemini';
import { sendTelegramNotification } from '@/lib/notifications/telegram';
import { Lead, LeadEvidence, QualificationLevel } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    let company = null;
    let existingLead: Lead | null = null;

    if (isSupabaseConfigured()) {
      const { data: leadData } = await supabaseAdmin
        .from('leads')
        .select('*, company:companies(*)')
        .eq('id', id)
        .single();

      if (leadData) {
        existingLead = leadData;
        company = leadData.company;
      } else {
        // Check if id is a company_id
        const { data: compData } = await supabaseAdmin
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();
        company = compData;
      }
    } else {
      existingLead = memoryStore.getLeadById(id) || null;
      if (existingLead) {
        company = memoryStore.getCompanyById(existingLead.company_id);
      } else {
        company = memoryStore.getCompanyById(id);
      }
    }

    if (!company) {
      return NextResponse.json({ error: 'Company or Lead not found for research.' }, { status: 404 });
    }

    // 1. Scrape public website content safely
    let scrapedText = company.description || '';
    if (company.website) {
      const scrapeRes = await fetchAndExtractWebContent(company.website);
      if (scrapeRes.content) {
        scrapedText = `${scrapeRes.title}\n${scrapeRes.metaDescription}\n${scrapeRes.content}`;
      }
    }

    // 2. Call Google Gemini AI Researcher
    const aiAnalysis = await analyzeCompanyIntelligence({
      companyName: company.name,
      industry: company.industry || undefined,
      country: company.country,
      city: company.city || undefined,
      scrapedContent: scrapedText || 'Commercial B2B company operating in regional logistics and wholesale trade.',
    });

    // 3. Compute qualification level
    const totalScore = aiAnalysis.total_score;
    let qualificationLevel: QualificationLevel = 'disqualified';
    if (totalScore >= 80) qualificationLevel = 'high_priority';
    else if (totalScore >= 60) qualificationLevel = 'potential_prospect';
    else if (totalScore >= 40) qualificationLevel = 'low_priority';

    const opportunitiesText = aiAnalysis.software_opportunities.join('; ');
    const solutionText =
      typeof aiAnalysis.recommended_solution === 'object'
        ? aiAnalysis.recommended_solution.solution_title
        : aiAnalysis.recommended_solution;

    // 4. Save into Database or Memory Store
    if (isSupabaseConfigured()) {
      let savedLead = null;
      if (existingLead) {
        const { data } = await supabaseAdmin
          .from('leads')
          .update({
            qualification_score: totalScore,
            qualification_level: qualificationLevel,
            score_breakdown: aiAnalysis.score_components,
            research_summary: aiAnalysis.business_summary,
            business_model: aiAnalysis.business_model,
            identified_opportunity: opportunitiesText,
            recommended_solution: solutionText,
            confidence_level: aiAnalysis.confidence_level,
            status: 'researched',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingLead.id)
          .select('*, company:companies(*)')
          .single();
        savedLead = data;
      } else {
        const { data } = await supabaseAdmin
          .from('leads')
          .insert({
            company_id: company.id,
            qualification_score: totalScore,
            qualification_level: qualificationLevel,
            score_breakdown: aiAnalysis.score_components,
            research_summary: aiAnalysis.business_summary,
            business_model: aiAnalysis.business_model,
            identified_opportunity: opportunitiesText,
            recommended_solution: solutionText,
            confidence_level: aiAnalysis.confidence_level,
            status: 'researched',
          })
          .select('*, company:companies(*)')
          .single();
        savedLead = data;
      }

      await supabaseAdmin
        .from('companies')
        .update({ research_status: 'completed' })
        .eq('id', company.id);

      // Insert Evidence
      if (savedLead) {
        const evidenceItems = [
          ...aiAnalysis.verified_facts.map((fact) => ({
            lead_id: savedLead.id,
            evidence_type: 'verified_fact',
            title: 'Verified Fact',
            description: fact,
            source_url: company.website,
            is_verified: true,
            confidence_score: 1.0,
          })),
          ...aiAnalysis.observations.map((obs) => ({
            lead_id: savedLead.id,
            evidence_type: 'observation',
            title: 'Architectural Observation',
            description: obs,
            source_url: company.website,
            is_verified: false,
            confidence_score: 0.85,
          })),
          ...aiAnalysis.potential_pain_points.map((pp) => ({
            lead_id: savedLead.id,
            evidence_type: 'pain_point',
            title: 'Identified Bottleneck',
            description: pp,
            source_url: company.website,
            is_verified: false,
            confidence_score: 0.8,
          })),
        ];

        if (evidenceItems.length > 0) {
          await supabaseAdmin.from('lead_evidence').insert(evidenceItems);
        }

        await supabaseAdmin.from('activities').insert({
          lead_id: savedLead.id,
          company_id: company.id,
          activity_type: 'lead_researched',
          title: `AI Intelligence Completed: ${company.name}`,
          description: `Score: ${totalScore}/100 (${qualificationLevel.toUpperCase()}). Recommended: ${solutionText}`,
          metadata: { score: totalScore, solution: solutionText },
          created_by: 'gemini_ai',
        });
      }

      // Telegram alert if high priority
      if (totalScore >= 80) {
        await sendTelegramNotification({
          title: 'High Priority Lead Qualified',
          message: `Company: ${company.name}\nScore: ${totalScore}/100\nOpportunity: ${opportunitiesText}\nSolution: ${solutionText}`,
          level: 'success',
        });
      }

      return NextResponse.json({
        success: true,
        lead: savedLead,
        aiAnalysis,
      });
    }

    // Offline / Memory Store Execution
    const leadId = existingLead
      ? existingLead.id
      : `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const updatedLead: Lead = {
      id: leadId,
      company_id: company.id,
      qualification_score: totalScore,
      qualification_level: qualificationLevel,
      score_breakdown: aiAnalysis.score_components,
      research_summary: aiAnalysis.business_summary,
      business_model: aiAnalysis.business_model,
      identified_opportunity: opportunitiesText,
      recommended_solution: solutionText,
      confidence_level: aiAnalysis.confidence_level,
      status: 'researched',
      created_at: existingLead ? existingLead.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company,
    };

    if (existingLead) {
      const idx = memoryStore.leads.findIndex((l) => l.id === existingLead.id);
      if (idx !== -1) memoryStore.leads[idx] = updatedLead;
    } else {
      memoryStore.leads.unshift(updatedLead);
    }

    company.research_status = 'completed';

    memoryStore.recordActivity({
      lead_id: updatedLead.id,
      company_id: company.id,
      activity_type: 'lead_researched',
      title: `AI Intelligence Completed: ${company.name}`,
      description: `Score: ${totalScore}/100 (${qualificationLevel.toUpperCase()}). Solution: ${solutionText}`,
      metadata: { score: totalScore, solution: solutionText },
      created_by: 'gemini_ai',
    });

    if (totalScore >= 80) {
      await sendTelegramNotification({
        title: 'High Priority Lead Qualified',
        message: `Company: ${company.name}\nScore: ${totalScore}/100\nSolution: ${solutionText}`,
        level: 'success',
      });
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      aiAnalysis,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
