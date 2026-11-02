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
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Loader2,
  CheckCircle2,
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Header & Stats Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sales Pipeline Kanban</h2>
              <p className="text-xs text-slate-500">
                13-stage B2B client acquisition lifecycle tracking deals from initial discovery to closure.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
              <div className="px-3 border-r border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Active Pipeline</span>
                <span className="text-sm font-bold text-slate-900">${totalPipeline.toLocaleString()}</span>
              </div>
              <div className="px-3 border-r border-slate-100">
                <span className="text-[10px] text-slate-400 block font-medium">Won Revenue</span>
                <span className="text-sm font-bold text-emerald-700">${wonTotal.toLocaleString()}</span>
              </div>
              <div className="px-3">
                <span className="text-[10px] text-slate-400 block font-medium">Meeting Requests</span>
                <span className="text-sm font-bold text-purple-700">{activeMeetingDeals}</span>
              </div>
            </div>
          </div>

          {/* Kanban Board Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-3 min-w-[3200px]">
              {PIPELINE_COLUMNS.map((col) => {
                const colOpps = opportunities.filter((o) => o.stage === col.stage);
                const colValue = colOpps.reduce((sum, o) => sum + Number(o.deal_value || 0), 0);

                return (
                  <div
                    key={col.stage}
                    className="w-64 flex-shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-lg flex flex-col max-h-[calc(100vh-220px)]"
                  >
                    {/* Column Header */}
                    <div className="p-3 border-b border-slate-200/60 bg-white/50 rounded-t-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{col.label}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          ${colValue.toLocaleString()} ({colOpps.length})
                        </p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                        {colOpps.length}
                      </span>
                    </div>

                    {/* Column Items */}
                    <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                      {colOpps.length === 0 ? (
                        <div className="py-6 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-md">
                          No deals in stage
                        </div>
                      ) : (
                        colOpps.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-3 bg-white border border-slate-200 rounded-md shadow-xs hover:shadow-sm transition-shadow space-y-2 text-xs"
                          >
                            <div>
                              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                {opp.company?.name || 'Prospect Company'}
                              </span>
                              <h4 className="font-semibold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                                {opp.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="font-bold text-slate-900 text-xs">
                                ${Number(opp.deal_value || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {opp.probability}% Prob
                              </span>
                            </div>

                            {opp.next_action && (
                              <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded line-clamp-2">
                                <span className="font-semibold text-slate-700">Next:</span> {opp.next_action}
                              </p>
                            )}

                            {/* Stage Selector & Actions */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <select
                                value={opp.stage}
                                onChange={(e) => handleStageChange(opp.id, e.target.value as PipelineStage)}
                                className="text-[10px] px-1.5 py-1 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none max-w-[130px]"
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
                                className="h-6 px-1.5 text-[10px] gap-1 text-slate-600 hover:text-slate-900"
                                title="Draft Proposal PDF"
                              >
                                <FileText className="h-3 w-3 text-slate-500" />
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
