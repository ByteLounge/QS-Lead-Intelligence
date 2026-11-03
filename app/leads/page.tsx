'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { DiscoveryModal } from '@/components/leads/discovery-modal';
import { CreateCompanyModal } from '@/components/leads/create-company-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Search,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Building2,
  ExternalLink,
  Plus,
  Target,
} from 'lucide-react';

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [researchingId, setResearchingId] = React.useState<string | null>(null);

  // Filters
  const [search, setSearch] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const [isDiscoveryOpen, setIsDiscoveryOpen] = React.useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = React.useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (levelFilter) params.set('level', levelFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeads();
  }, [search, levelFilter, statusFilter]);

  const handleTriggerResearch = async (leadId: string, companyName: string) => {
    try {
      setResearchingId(leadId);
      const res = await fetch(`/api/leads/${leadId}/research`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Research failed');

      toast({
        title: 'AI Research Completed',
        message: `${companyName} scored ${data.lead.qualification_score}/100 (${data.lead.qualification_level}).`,
        type: 'success',
      });
      fetchLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Research Failed', message: msg, type: 'error' });
    } finally {
      setResearchingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenNewLead={() => setIsCreateCompanyOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
                <Target className="h-3 w-3 text-[#111111]" />
                <span>Intelligence Pipeline</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Leads &amp; Intelligence Qualification
              </h2>
              <p className="text-xs text-[#666666]">
                Objective 100-point Gemini AI qualification scoring and detected software modernization opportunities.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDiscoveryOpen(true)}
                className="h-8 gap-1.5 text-xs rounded-full border-[#e8e8e8] bg-white hover:bg-[#fafafa]"
              >
                <Search className="h-3 w-3 text-[#666666]" />
                <span>Discovery</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateCompanyOpen(true)}
                className="h-8 gap-1.5 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Lead</span>
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
            <div className="flex items-center space-x-2.5 flex-1 min-w-[240px]">
              <Search className="h-4 w-4 text-[#888888]" />
              <input
                type="text"
                placeholder="Search leads by company, opportunity, solution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none bg-transparent font-medium"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-[#777777] font-mono text-[10px] uppercase">Tier:</span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#e8e8e8] rounded-full bg-white text-[#111111] focus:outline-none"
                >
                  <option value="">All Tiers</option>
                  <option value="high_priority">High Priority (≥80)</option>
                  <option value="potential_prospect">Potential (60-79)</option>
                  <option value="low_priority">Low Priority (40-59)</option>
                  <option value="disqualified">Disqualified (&lt;40)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[#777777] font-mono text-[10px] uppercase">Stage:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#e8e8e8] rounded-full bg-white text-[#111111] focus:outline-none"
                >
                  <option value="">All Stages</option>
                  <option value="discovered">Discovered</option>
                  <option value="researched">Researched</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="meeting_requested">Meeting Requested</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#777777] font-mono text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Company &amp; Domain</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Gemini Score</th>
                    <th className="p-4">Software Opportunity</th>
                    <th className="p-4">Recommended Solution</th>
                    <th className="p-4">Stage</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-[#888888]">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#111111]" />
                        <span className="font-medium text-xs">Loading intelligence records...</span>
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-[#888888]">
                        <Building2 className="h-8 w-8 mx-auto text-[#d4d4d4] mb-2" />
                        <p className="font-semibold text-[#111111]">No leads found matching criteria</p>
                        <p className="text-[11px] text-[#777777] mt-1">Run discovery or add target companies manually.</p>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const company = lead.company || {};
                      const score = lead.score_override ?? lead.qualification_score;
                      const isHigh = score >= 80;
                      const isPotential = score >= 60 && score < 80;

                      return (
                        <tr key={lead.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="p-4">
                            <Link href={`/leads/${lead.id}`} className="font-medium text-xs text-[#111111] hover:underline flex items-center gap-1.5">
                              <span>{company.name || 'Unnamed Company'}</span>
                              <ArrowUpRight className="h-3 w-3 text-[#999999]" />
                            </Link>
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#777777] hover:text-[#111111] inline-flex items-center gap-1 mt-0.5 font-mono"
                              >
                                <span>{company.domain || company.website}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </td>

                          <td className="p-4 text-[#555555]">
                            <span className="font-medium text-[#111111]">{company.city || company.country}</span>
                            <span className="block text-[10px] text-[#888888]">{company.industry}</span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`text-xs font-semibold font-mono ${
                                  isHigh
                                    ? 'text-emerald-700'
                                    : isPotential
                                    ? 'text-blue-700'
                                    : score >= 40
                                    ? 'text-[#555555]'
                                    : 'text-rose-600'
                                }`}
                              >
                                {score}/100
                              </span>
                              <Badge
                                variant={
                                  isHigh ? 'high' : isPotential ? 'potential' : score >= 40 ? 'low' : 'disqualified'
                                }
                              >
                                {lead.qualification_level?.replace('_', ' ')}
                              </Badge>
                            </div>
                          </td>

                          <td className="p-4 max-w-xs">
                            <p className="text-[#333333] line-clamp-2 text-xs leading-relaxed">
                              {lead.identified_opportunity || 'Pending AI intelligence research'}
                            </p>
                          </td>

                          <td className="p-4 max-w-xs">
                            <p className="text-[#111111] font-medium line-clamp-1 text-xs">
                              {lead.recommended_solution || '—'}
                            </p>
                          </td>

                          <td className="p-4">
                            <Badge variant="secondary" className="capitalize text-[10px]">
                              {lead.status?.replace('_', ' ')}
                            </Badge>
                          </td>

                          <td className="p-4 text-right space-x-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTriggerResearch(lead.id, company.name)}
                              disabled={researchingId === lead.id}
                              className="h-7 px-3 text-[11px] rounded-full gap-1 border-[#e8e8e8]"
                              title="Run Gemini AI intelligence on company website"
                            >
                              {researchingId === lead.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3 text-purple-600" />
                              )}
                              <span>Research</span>
                            </Button>

                            <Link href={`/leads/${lead.id}`}>
                              <Button size="sm" className="h-7 px-3 text-[11px] rounded-full bg-[#111111] text-white">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <DiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSuccess={fetchLeads}
      />

      <CreateCompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onSuccess={fetchLeads}
      />
    </div>
  );
}
