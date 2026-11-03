'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ProposalModal } from '@/components/crm/proposal-modal';
import Link from 'next/link';
import {
  Building2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send,
  FileText,
  Loader2,
  ExternalLink,
  Edit3,
  UserCheck,
  Plus,
} from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const leadId = params.id as string;

  const [lead, setLead] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [researching, setResearching] = React.useState(false);
  const [generatingOutreach, setGeneratingOutreach] = React.useState(false);
  const [isProposalOpen, setIsProposalOpen] = React.useState(false);

  // Manual score override form
  const [isEditingScore, setIsEditingScore] = React.useState(false);
  const [overrideScore, setOverrideScore] = React.useState('');
  const [overrideReason, setOverrideReason] = React.useState('');

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leads/${leadId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch lead');
      setLead(data.lead);
      if (data.lead.score_override !== null && data.lead.score_override !== undefined) {
        setOverrideScore(String(data.lead.score_override));
        setOverrideReason(data.lead.score_override_reason || '');
      } else {
        setOverrideScore(String(data.lead.qualification_score));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeadDetails();
  }, [leadId]);

  const handleRunAiResearch = async () => {
    setResearching(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/research`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Research failed');

      toast({
        title: 'AI Intelligence Completed',
        message: `Scored ${data.lead.qualification_score}/100. Software opportunities updated.`,
        type: 'success',
      });
      fetchLeadDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Research Failed', message: msg, type: 'error' });
    } finally {
      setResearching(false);
    }
  };

  const handleSaveScoreOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scoreNum = parseInt(overrideScore, 10);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        toast({ title: 'Invalid Score', message: 'Score must be between 0 and 100', type: 'warning' });
        return;
      }

      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score_override: scoreNum,
          score_override_reason: overrideReason,
        }),
      });

      if (!res.ok) throw new Error('Failed to save score override');

      toast({
        title: 'Manual Score Saved',
        message: `Lead score adjusted to ${scoreNum}/100 with audit entry.`,
        type: 'success',
      });
      setIsEditingScore(false);
      fetchLeadDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Override Failed', message: msg, type: 'error' });
    }
  };

  const handleGenerateOutreach = async () => {
    if (!lead.primary_contact_id && (!lead.primary_contact && !lead.company?.id)) {
      toast({
        title: 'Contact Required',
        message: 'Please associate a contact person before generating outreach.',
        type: 'warning',
      });
      return;
    }

    setGeneratingOutreach(true);
    try {
      const contactId = lead.primary_contact_id || lead.primary_contact?.id;
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          contact_id: contactId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate outreach');

      toast({
        title: 'Outreach Draft Created',
        message: `Subject: ${data.generated.subject}. Awaiting approval in /email-approvals.`,
        type: 'success',
      });
      router.push('/email-approvals');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Generation Failed', message: msg, type: 'error' });
    } finally {
      setGeneratingOutreach(false);
    }
  };

  if (loading || !lead) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  const company = lead.company || {};
  const breakdown = lead.score_breakdown || {
    industry_relevance: 0,
    software_opportunity: 0,
    business_suitability: 0,
    evidence_quality: 0,
    contact_reachability: 0,
  };
  const effectiveScore = lead.score_override ?? lead.qualification_score;

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle min-w-0">
          {/* Back & Breadcrumb */}
          <div className="flex items-center space-x-2">
            <Link
              href="/leads"
              className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Leads</span>
            </Link>
          </div>

          {/* Lead Header Card */}
          <div className="p-4 sm:p-6 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{company.name}</h2>
                <Badge
                  variant={
                    effectiveScore >= 80
                      ? 'high'
                      : effectiveScore >= 60
                      ? 'potential'
                      : effectiveScore >= 40
                      ? 'low'
                      : 'disqualified'
                  }
                >
                  {lead.qualification_level?.replace('_', ' ').toUpperCase()} ({effectiveScore}/100)
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {lead.status?.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span>{company.industry || 'Logistics & Distribution'}</span>
                <span>•</span>
                <span>{company.city ? `${company.city}, ${company.country}` : company.country}</span>
                {company.website && (
                  <>
                    <span>•</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{company.domain || company.website}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunAiResearch}
                disabled={researching}
                className="gap-1.5 text-xs h-8"
              >
                {researching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                )}
                <span>Rerun AI Intelligence</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProposalOpen(true)}
                className="gap-1.5 text-xs h-8"
              >
                <FileText className="h-3.5 w-3.5 text-slate-600" />
                <span>Commercial Proposal</span>
              </Button>

              <Button
                size="sm"
                onClick={handleGenerateOutreach}
                disabled={generatingOutreach}
                className="gap-1.5 text-xs h-8 bg-slate-900 text-white"
              >
                {generatingOutreach ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Generate Outreach</span>
              </Button>
            </div>
          </div>

          {/* Grid Layout: Left Intelligence & Score, Right Contacts & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Research Intelligence */}
            <div className="lg:col-span-2 space-y-6">
              {/* 100-Point Scoring Breakdown */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle>100-Point AI Lead Scoring Breakdown</CardTitle>
                    <p className="text-xs text-slate-400">
                      Objective multi-criteria evaluation of software fit and revenue viability
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingScore(!isEditingScore)}
                    className="h-7 text-xs text-slate-600 gap-1"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isEditingScore ? 'Cancel Edit' : 'Adjust Score'}</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingScore && (
                    <form
                      onSubmit={handleSaveScoreOverride}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2.5 animate-in fade-in duration-150"
                    >
                      <p className="font-semibold text-xs text-slate-800">
                        Manual Score Override & Audit Reason
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">
                            Override Score (0-100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={overrideScore}
                            onChange={(e) => setOverrideScore(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] text-slate-600 mb-1">
                            Override Audit Reason *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Verified 25 delivery vans via phone discussion"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <Button type="submit" size="sm" className="h-7 text-xs bg-slate-900 text-white">
                          Save Audit Override
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Industry Relevance (Target Logistics/FMCG)</span>
                        <span className="font-semibold text-slate-900">{breakdown.industry_relevance || 0} / 25 pts</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((breakdown.industry_relevance || 0) / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Software Opportunity (Workflow/WMS Need)</span>
                        <span className="font-semibold text-slate-900">{breakdown.software_opportunity || 0} / 25 pts</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((breakdown.software_opportunity || 0) / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Business Suitability (Mid-Market Scale)</span>
                        <span className="font-semibold text-slate-900">{breakdown.business_suitability || 0} / 20 pts</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((breakdown.business_suitability || 0) / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Evidence Quality (Public Web Data Clarity)</span>
                        <span className="font-semibold text-slate-900">{breakdown.evidence_quality || 0} / 15 pts</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((breakdown.evidence_quality || 0) / 15) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">Contact Reachability (Identified Leadership)</span>
                        <span className="font-semibold text-slate-900">{breakdown.contact_reachability || 0} / 15 pts</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${((breakdown.contact_reachability || 0) / 15) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Research Summary & Opportunities */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Business Model & Identified Opportunities</CardTitle>
                  <p className="text-xs text-slate-400">
                    Grounded observations versus architectural engineering hypotheses
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 mb-1">Executive Research Summary</p>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                      {lead.research_summary || 'Run AI Research to summarize operations and identify software needs.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                      <p className="font-semibold text-emerald-900 mb-1">Recommended Software Solution</p>
                      <p className="text-slate-700 font-medium">
                        {lead.recommended_solution || 'Custom Warehouse & Distributor Platform'}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md">
                      <p className="font-semibold text-blue-900 mb-1">Identified Operational Bottleneck</p>
                      <p className="text-slate-700">
                        {lead.identified_opportunity || 'Manual dispatch manifests and telephone ordering.'}
                      </p>
                    </div>
                  </div>

                  {/* Grounded Evidence List */}
                  {lead.evidence && lead.evidence.length > 0 && (
                    <div>
                      <p className="font-semibold text-slate-800 mb-2">Supporting Research Evidence & Citations</p>
                      <div className="space-y-2">
                        {lead.evidence.map((ev: any) => (
                          <div key={ev.id} className="p-2.5 border border-slate-200 rounded bg-white flex items-start gap-2.5">
                            {ev.is_verified ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-900">{ev.title}</span>
                                <Badge variant={ev.is_verified ? 'success' : 'outline'} className="text-[10px] py-0">
                                  {ev.is_verified ? 'Verified Fact' : 'Inference'}
                                </Badge>
                              </div>
                              <p className="text-slate-600 text-[11px] mt-0.5">{ev.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Stakeholders & Quick Actions */}
            <div className="space-y-6">
              {/* Primary Contact */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-xs">Identified Contact Point</CardTitle>
                  <Link href="/contacts" className="text-[11px] text-emerald-700 font-semibold hover:underline">
                    Manage
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {lead.primary_contact ? (
                    <div className="p-3 border border-slate-200 rounded-md bg-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{lead.primary_contact.full_name}</span>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">{lead.primary_contact.job_title || 'Decision Maker'}</p>
                      <p className="text-[11px] text-slate-700 font-medium">{lead.primary_contact.email}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-400">
                      <UserCheck className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                      <p className="text-xs">No primary contact mapped yet.</p>
                      <Link href="/contacts">
                        <Button size="sm" variant="outline" className="h-7 text-xs mt-2">
                          Map Contact
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Outreach Generation Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs">Outreach Automation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-slate-500 leading-relaxed">
                    Generate an 80-130 word email grounded in Queenstown Labs capabilities and this company&apos;s specific bottlenecks.
                  </p>
                  <Button
                    onClick={handleGenerateOutreach}
                    disabled={generatingOutreach}
                    className="w-full h-8 text-xs bg-slate-900 text-white gap-2"
                  >
                    {generatingOutreach ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    <span>Generate Tailored Email</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <ProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        leadId={lead.id}
        companyName={company.name}
        industry={company.industry}
        problemStatement={lead.identified_opportunity}
        recommendedSolution={lead.recommended_solution}
      />
    </div>
  );
}
