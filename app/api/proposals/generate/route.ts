// Queenstown Lead Intelligence - Commercial Proposal Generation API Route

import { NextRequest, NextResponse } from 'next/server';
import { generateProposalDraft, ProposalData } from '@/lib/ai/gemini';
import { createProposalPdfDocument } from '@/lib/proposals/pdf-generator';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lead_id,
      company_name,
      industry,
      problem_statement,
      recommended_solution,
      format = 'json',
      custom_proposal,
    } = body;

    let proposalData: ProposalData;

    if (custom_proposal) {
      proposalData = custom_proposal;
    } else {
      let finalCompanyName = company_name;
      let finalIndustry = industry || 'Logistics and Warehousing';
      let finalProblem = problem_statement || 'Manual coordination latency';
      let finalSolution = recommended_solution || 'Custom Enterprise Management Platform';

      if (lead_id) {
        if (isSupabaseConfigured()) {
          const { data: lead } = await supabaseAdmin
            .from('leads')
            .select('*, company:companies(*)')
            .eq('id', lead_id)
            .single();

          if (lead) {
            finalCompanyName = lead.company?.name || finalCompanyName;
            finalIndustry = lead.company?.industry || finalIndustry;
            finalProblem = lead.identified_opportunity || finalProblem;
            finalSolution = lead.recommended_solution || finalSolution;
          }
        } else {
          const lead = memoryStore.getLeadById(lead_id);
          if (lead) {
            finalCompanyName = lead.company?.name || finalCompanyName;
            finalIndustry = lead.company?.industry || finalIndustry;
            finalProblem = lead.identified_opportunity || finalProblem;
            finalSolution = lead.recommended_solution || finalSolution;
          }
        }
      }

      proposalData = await generateProposalDraft({
        companyName: finalCompanyName || 'Client Enterprise',
        industry: finalIndustry,
        problemStatement: finalProblem,
        recommendedSolution: finalSolution,
      });
    }

    if (format === 'pdf') {
      const doc = createProposalPdfDocument(proposalData);
      const pdfArrayBuffer = doc.output('arraybuffer');

      return new NextResponse(pdfArrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Queenstown-Proposal-${proposalData.client_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      proposal: proposalData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
