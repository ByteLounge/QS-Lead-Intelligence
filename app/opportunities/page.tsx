'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ProposalModal } from '@/components/crm/proposal-modal';
import { PipelineStage, Opportunity } from '@/lib/types';
import {
  Kanban,
  DollarSign,
  FileText,
  Loader2,
  TrendingUp,
} from 'lucide-react';

const PIPELINE_COLUMNS: { stage: PipelineStage; label: string }[] = [
  { stage: 'discovered', label: '1. Discovered' },
  { stage: 'researched', label: '2. Researched' },
  { stage: 'qualified', label: '3. Qualified' },
  { stage: 'contact_identified', label: '4. Contact Identified' },
  { stage: 'outreach_drafted', label: '5. Outreach Drafted' },
  { stage: 'contacted', label: '6. Contacted' },
  { stage: 'interested', label: '7. Interested' },
  { stage: 'meeting_requested', label: '8. Meeting Requested' },
  { stage: 'meeting_completed', label: '9. Meeting Completed' },
  { stage: 'proposal_sent', label: '10. Proposal Sent' },
  { stage: 'negotiation', label: '11. Negotiation' },
  { stage: 'won', label: '12. Won' },
  { stage: 'lost', label: '13. Lost' },
];

export default function OpportunitiesPage() {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeProposalOpp, setActiveProposalOpp] = React.useState<Opportunity | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/opportunities');
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleStageChange = async (oppId: string, newStage: PipelineStage) => {
    try {
      const res = await fetch('/api/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: oppId, stage: newStage }),
      });

      if (!res.ok) throw new Error('Stage transition failed');

      toast({
        title: 'Pipeline Stage Updated',
        message: `Opportunity moved to ${newStage.replace('_', ' ').toUpperCase()}`,
        type: 'success',
      });
      fetchOpportunities();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Update Failed', message: msg, type: 'error' });
    }
  };

  // Pipeline summary
  const totalPipeline = opportunities
    .filter((o) => o.stage !== 'lost')
    .reduce((sum, o) => sum + Number(o.deal_value || 0), 0);
  const wonTotal = opportunities
    .filter((o) => o.stage === 'won')
    .reduce((sum, o) => sum + Number(o.deal_value || 0), 0);
  const activeMeetingDeals = opportunities.filter((o) => o.stage === 'meeting_requested').length;

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle min-w-0">
          {/* Header & Stats Banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
                <Kanban className="h-3 w-3 text-[#111111]" />
                <span>Deal Pipeline</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Sales Pipeline Kanban
              </h2>
              <p className="text-xs text-[#666666]">
                13-stage B2B client acquisition lifecycle tracking accounts from discovery to closed studio contracts.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:space-x-3 text-xs bg-white p-2 sm:p-2.5 border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
              <div className="px-1.5 sm:px-3 border-r border-[#e8e8e8]">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[#888888] block truncate">Active Pipeline</span>
                <span className="text-xs sm:text-sm font-semibold text-[#111111] font-display">${totalPipeline.toLocaleString()}</span>
              </div>
              <div className="px-1.5 sm:px-3 border-r border-[#e8e8e8]">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[#888888] block truncate">Won Revenue</span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-700 font-display">${wonTotal.toLocaleString()}</span>
              </div>
              <div className="px-1.5 sm:px-3">
                <span className="text-[9px] sm:text-[10px] font-mono uppercase text-[#888888] block truncate">Meetings</span>
                <span className="text-xs sm:text-sm font-semibold text-[#111111] font-display">{activeMeetingDeals}</span>
              </div>
            </div>
          </div>

          {/* Kanban Board Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-6">
            <div className="flex space-x-3.5 min-w-[3300px]">
              {PIPELINE_COLUMNS.map((col) => {
                const colOpps = opportunities.filter((o) => o.stage === col.stage);
                const colValue = colOpps.reduce((sum, o) => sum + Number(o.deal_value || 0), 0);

                return (
                  <div
                    key={col.stage}
                    className="w-64 flex-shrink-0 bg-[#f7f7f7] border border-[#e8e8e8] rounded-2xl flex flex-col max-h-[calc(100vh-220px)] shadow-[0_1px_2px_rgba(17,17,17,0.02)]"
                  >
                    {/* Column Header */}
                    <div className="p-3.5 border-b border-[#e8e8e8] bg-white rounded-t-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#111111] font-display">{col.label}</p>
                        <p className="text-[10px] text-[#888888] font-mono mt-0.5">
                          ${colValue.toLocaleString()} · {colOpps.length}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#f5f5f5] text-[#555555] border border-[#e8e8e8]">
                        {colOpps.length}
                      </span>
                    </div>

                    {/* Column Items */}
                    <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                      {colOpps.length === 0 ? (
                        <div className="py-8 text-center text-[10px] font-mono text-[#aaaaaa] border border-dashed border-[#e8e8e8] rounded-xl bg-white/40">
                          Empty Stage
                        </div>
                      ) : (
                        colOpps.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-3.5 bg-white border border-[#e8e8e8] rounded-xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] hover:border-[#cfcfcf] transition-all space-y-2 text-xs"
                          >
                            <div>
                              <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wide">
                                {opp.company?.name || 'Prospect Company'}
                              </span>
                              <h4 className="font-medium text-[#111111] leading-snug line-clamp-2 mt-0.5 font-display">
                                {opp.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="font-semibold text-[#111111] text-xs font-mono">
                                ${Number(opp.deal_value || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {opp.probability}% Prob
                              </span>
                            </div>

                            {opp.next_action && (
                              <p className="text-[11px] text-[#666666] bg-[#fafafa] p-2 rounded-lg border border-[#f0f0f0] line-clamp-2 leading-relaxed">
                                <strong className="text-[#111111]">Next:</strong> {opp.next_action}
                              </p>
                            )}

                            {/* Stage Selector & Actions */}
                            <div className="pt-2 border-t border-[#f5f5f5] flex items-center justify-between gap-1.5">
                              <select
                                value={opp.stage}
                                onChange={(e) => handleStageChange(opp.id, e.target.value as PipelineStage)}
                                className="text-[10px] px-2 py-1 border border-[#e8e8e8] rounded-full bg-white text-[#333333] focus:outline-none max-w-[130px] font-mono"
                              >
                                {PIPELINE_COLUMNS.map((c) => (
                                  <option key={c.stage} value={c.stage}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setActiveProposalOpp(opp)}
                                className="h-6 px-2 text-[10px] gap-1 text-[#666666] hover:text-[#111111] rounded-full"
                                title="Draft Proposal PDF"
                              >
                                <FileText className="h-3 w-3 text-[#888888]" />
                                <span>Proposal</span>
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {activeProposalOpp && (
        <ProposalModal
          isOpen={Boolean(activeProposalOpp)}
          onClose={() => setActiveProposalOpp(null)}
          leadId={activeProposalOpp.lead_id}
          companyName={activeProposalOpp.company?.name || 'Client Enterprise'}
          industry={activeProposalOpp.company?.industry || undefined}
          problemStatement={activeProposalOpp.lead?.identified_opportunity || undefined}
          recommendedSolution={activeProposalOpp.lead?.recommended_solution || undefined}
        />
      )}
    </div>
  );
}
