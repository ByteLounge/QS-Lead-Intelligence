'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ProposalData } from '@/lib/ai/gemini';
import { FileText, Download, Loader2, Sparkles, Check } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  companyName: string;
  industry?: string;
  problemStatement?: string;
  recommendedSolution?: string;
}

export function ProposalModal({
  isOpen,
  onClose,
  leadId,
  companyName,
  industry,
  problemStatement,
  recommendedSolution,
}: ProposalModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [proposal, setProposal] = React.useState<ProposalData | null>(null);

  // Generate draft when modal opens
  React.useEffect(() => {
    if (isOpen && !proposal) {
      generateDraft();
    }
  }, [isOpen]);

  const generateDraft = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          company_name: companyName,
          industry,
          problem_statement: problemStatement,
          recommended_solution: recommendedSolution,
          format: 'json',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate proposal');
      setProposal(data.proposal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Proposal Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!proposal) return;
    setDownloading(true);

    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_proposal: proposal,
          format: 'pdf',
        }),
      });

      if (!res.ok) throw new Error('PDF generation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Queenstown-Proposal-${proposal.client_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'PDF Proposal Generated',
        message: 'Commercial PDF downloaded successfully.',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Download Error', message: msg, type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Commercial Proposal - ${companyName}`}
      description="Review and customize project scope, milestone timelines, and pricing before exporting."
      maxWidth="4xl"
    >
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-xs font-semibold text-slate-700">Synthesizing Architecture & Commercial Proposal...</p>
          <p className="text-[11px] text-slate-400 mt-1">Grounding modules in verified company opportunities</p>
        </div>
      ) : proposal ? (
        <div className="space-y-4 text-xs">
          {/* Header Specs */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Project Title</label>
              <input
                type="text"
                value={proposal.project_title}
                onChange={(e) => setProposal({ ...proposal, project_title: e.target.value })}
                className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Total Budget (USD)</label>
                <input
                  type="number"
                  value={proposal.estimated_total_cost_usd}
                  onChange={(e) =>
                    setProposal({ ...proposal, estimated_total_cost_usd: Number(e.target.value) })
                  }
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-semibold text-emerald-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration (Weeks)</label>
                <input
                  type="number"
                  value={proposal.estimated_timeline_weeks}
                  onChange={(e) =>
                    setProposal({ ...proposal, estimated_timeline_weeks: Number(e.target.value) })
                  }
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Executive Summary</label>
            <textarea
              rows={2}
              value={proposal.executive_summary}
              onChange={(e) => setProposal({ ...proposal, executive_summary: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none"
            />
          </div>

          {/* Scope of Work */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Scope of Work Modules ({proposal.scope_of_work.length})
            </label>
            <div className="space-y-2">
              {proposal.scope_of_work.map((mod, idx) => (
                <div key={idx} className="p-2.5 border border-slate-200 rounded bg-white">
                  <p className="font-semibold text-slate-900">{mod.module_name}</p>
                  <p className="text-slate-600 mt-0.5">{mod.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {mod.deliverables.map((del, dIdx) => (
                      <span
                        key={dIdx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium"
                      >
                        ✓ {del}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Commercial Milestones</label>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-medium">
                  <tr>
                    <th className="p-2">Milestone Phase</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Deliverables</th>
                    <th className="p-2 text-right">Investment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proposal.milestones.map((m, mIdx) => (
                    <tr key={mIdx}>
                      <td className="p-2 font-medium text-slate-900">{m.phase}</td>
                      <td className="p-2 text-slate-600">{m.duration_weeks} wks</td>
                      <td className="p-2 text-slate-600">{m.deliverables}</td>
                      <td className="p-2 text-right font-semibold text-slate-900">
                        ${m.estimated_cost_usd.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={generateDraft} className="gap-1.5 text-xs text-slate-600">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Regenerate with AI</span>
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                <span>Download Commercial PDF</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
