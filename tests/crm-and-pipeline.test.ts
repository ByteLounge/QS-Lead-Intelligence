import { describe, it, expect } from 'vitest';
import { generateProposalDraft } from '@/lib/ai/gemini';
import { createProposalPdfDocument } from '@/lib/proposals/pdf-generator';

describe('CRM Pipeline & Commercial Proposal Generator', () => {
  it('should generate a schema-valid proposal draft with milestones and scope', async () => {
    const proposal = await generateProposalDraft({
      companyName: 'TransIndia Cold Chain',
      industry: 'Logistics and Warehousing',
      problemStatement: 'Manual dispatch coordination and temperature tracking bottlenecks',
      recommendedSolution: 'Custom Warehouse Management & Telematics Dashboard',
    });

    expect(proposal.client_name).toBe('TransIndia Cold Chain');
    expect(proposal.estimated_total_cost_usd).toBeGreaterThan(0);
    expect(proposal.estimated_timeline_weeks).toBeGreaterThan(0);
    expect(proposal.scope_of_work.length).toBeGreaterThan(0);
    expect(proposal.milestones.length).toBeGreaterThan(0);
    expect(proposal.technology_stack.frontend).toContain('Next.js 14');
  });

  it('should generate a valid PDF proposal document with jsPDF', async () => {
    const proposal = await generateProposalDraft({
      companyName: 'TransIndia Cold Chain',
      industry: 'Logistics and Warehousing',
      problemStatement: 'Manual dispatch manifests',
      recommendedSolution: 'Custom WMS Suite',
    });

    const doc = createProposalPdfDocument(proposal);
    expect(doc).toBeDefined();
    const outputBuffer = doc.output('arraybuffer');
    expect(outputBuffer.byteLength).toBeGreaterThan(1000); // Standard PDF binary size
  });
});
