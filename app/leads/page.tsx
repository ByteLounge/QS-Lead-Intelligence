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
  Filter,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Building2,
  CheckCircle2,
  ExternalLink,
  Plus,
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenNewLead={() => setIsCreateCompanyOpen(true)}
        />

        <main className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Leads & Intelligence</h2>
              <p className="text-xs text-slate-500">
                AI qualification, objective 100-point scoring, and identified software engineering opportunities.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDiscoveryOpen(true)}
                className="h-8 gap-1.5 text-xs"
              >
                <Search className="h-3 w-3" />
                <span>Discover via Places / CSV</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateCompanyOpen(true)}
                className="h-8 gap-1.5 text-xs bg-slate-900 text-white"
              >
                <Plus className="h-3 w-3" />
                <span>New Lead</span>
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by company, opportunity, solution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium text-[11px]">Score Tier:</span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700"
                >
                  <option value="">All Tiers</option>
                  <option value="high_priority">High Priority (≥80)</option>
                  <option value="potential_prospect">Potential (60-79)</option>
                  <option value="low_priority">Low Priority (40-59)</option>
                  <option value="disqualified">Disqualified (&lt;40)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 font-medium text-[11px]">Stage:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700"
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
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Company & Domain</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">AI Score</th>
                    <th className="p-3.5">Software Opportunity</th>
                    <th className="p-3.5">Recommended Solution</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-slate-500" />
                        <span>Loading lead records...</span>
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400">
                        <Building2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No leads found matching criteria</p>
                        <p className="text-[11px] text-slate-400 mt-1">Run discovery or add target companies manually.</p>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const company = lead.company || {};
                      const score = lead.score_override ?? lead.qualification_score;
                      const isHigh = score >= 80;
                      const isPotential = score >= 60 && score < 80;

                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5">
                            <Link href={`/leads/${lead.id}`} className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1.5">
                              <span>{company.name || 'Unnamed Company'}</span>
                              <ArrowUpRight className="h-3 w-3 text-slate-400" />
                            </Link>
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>{company.domain || company.website}</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600">
                            <span className="font-medium text-slate-800">{company.city || company.country}</span>
                            <span className="block text-[10px] text-slate-400">{company.industry}</span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`text-sm font-bold ${
                                  isHigh
                                    ? 'text-emerald-700 font-extrabold'
                                    : isPotential
                                    ? 'text-blue-700'
                                    : score >= 40
                                    ? 'text-slate-600'
                                    : 'text-red-500'
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

                          <td className="p-3.5 max-w-xs">
                            <p className="text-slate-700 line-clamp-2 text-xs">
                              {lead.identified_opportunity || 'Pending deep AI intelligence research'}
                            </p>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <p className="text-slate-900 font-medium line-clamp-1">
                              {lead.recommended_solution || '—'}
                            </p>
                          </td>

                          <td className="p-3.5">
                            <Badge variant="secondary" className="capitalize">
                              {lead.status?.replace('_', ' ')}
                            </Badge>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTriggerResearch(lead.id, company.name)}
                              disabled={researchingId === lead.id}
                              className="h-7 px-2 text-[11px] gap-1"
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
                              <Button size="sm" className="h-7 px-2.5 text-[11px] bg-slate-900 text-white">
                                View Intelligence
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
