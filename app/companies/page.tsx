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
  Building2,
  Search,
  ExternalLink,
  ArrowUpRight,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function CompaniesPage() {
  const { toast } = useToast();
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [industry, setIndustry] = React.useState('');

  const [isDiscoveryOpen, setIsDiscoveryOpen] = React.useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = React.useState(false);
  const [researchingId, setResearchingId] = React.useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (country) params.set('country', country);
      if (industry) params.set('industry', industry);

      const res = await fetch(`/api/companies?${params.toString()}`);
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, [search, country, industry]);

  const handleResearchCompany = async (companyId: string, companyName: string) => {
    try {
      setResearchingId(companyId);
      const res = await fetch(`/api/leads/${companyId}/research`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Research failed');

      toast({
        title: 'AI Intelligence Completed',
        message: `${companyName} analyzed. Scored ${data.lead.qualification_score}/100.`,
        type: 'success',
      });
      fetchCompanies();
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
                <Building2 className="h-3 w-3 text-[#111111]" />
                <span>Target Accounts</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
                Discovered Companies
              </h2>
              <p className="text-xs text-[#666666]">
                Commercial organizations discovered via Google Places API, CSV ingestion, and outbound prospecting.
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
                <span>Run Discovery</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateCompanyOpen(true)}
                className="h-8 gap-1.5 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Target</span>
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
            <div className="flex items-center space-x-2.5 flex-1 min-w-[240px]">
              <Search className="h-4 w-4 text-[#888888]" />
              <input
                type="text"
                placeholder="Search by company name, domain, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs text-[#111111] placeholder:text-[#999999] focus:outline-none bg-transparent font-medium"
              />
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-[#777777] font-mono text-[10px] uppercase">Country:</span>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#e8e8e8] rounded-full bg-white text-[#111111] focus:outline-none"
                >
                  <option value="">All Countries</option>
                  <option value="India">India</option>
                  <option value="United Arab Emirates">UAE</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[#777777] font-mono text-[10px] uppercase">Sector:</span>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-[#e8e8e8] rounded-full bg-white text-[#111111] focus:outline-none"
                >
                  <option value="">All Sectors</option>
                  <option value="Logistics and Warehousing">Logistics & Warehousing</option>
                  <option value="FMCG distributors and wholesalers">FMCG Wholesalers</option>
                  <option value="Hospitality and travel">Hospitality & Travel</option>
                  <option value="Small and medium enterprises">SME Operations</option>
                </select>
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e8e8e8] text-[#777777] font-mono text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Company Name &amp; Domain</th>
                    <th className="p-4">Sector</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Provenance</th>
                    <th className="p-4">AI Intelligence</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-[#888888]">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#111111]" />
                        <span className="font-medium text-xs">Loading target accounts...</span>
                      </td>
                    </tr>
                  ) : companies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-[#888888]">
                        <Building2 className="h-8 w-8 mx-auto text-[#d4d4d4] mb-2" />
                        <p className="font-semibold text-[#111111]">No companies recorded</p>
                        <p className="text-[11px] text-[#777777] mt-1">Run Lead Discovery to ingest businesses from Google Places API.</p>
                      </td>
                    </tr>
                  ) : (
                    companies.map((comp) => (
                      <tr key={comp.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="p-4">
                          <Link href={`/companies/${comp.id}`} className="font-medium text-xs text-[#111111] hover:underline flex items-center gap-1.5">
                            <span>{comp.name}</span>
                            <ArrowUpRight className="h-3 w-3 text-[#999999]" />
                          </Link>
                          {comp.website && (
                            <a
                              href={comp.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#777777] hover:text-[#111111] inline-flex items-center gap-1 mt-0.5 font-mono"
                            >
                              <span>{comp.domain || comp.website}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </td>

                        <td className="p-4 text-[#555555]">{comp.industry || 'General SME'}</td>

                        <td className="p-4 text-[#555555]">
                          <span className="font-medium text-[#111111]">{comp.city || '—'}</span>
                          <span className="block text-[10px] text-[#888888]">{comp.country}</span>
                        </td>

                        <td className="p-4">
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {comp.discovery_source?.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <Badge
                            variant={
                              comp.research_status === 'completed'
                                ? 'success'
                                : comp.research_status === 'in_progress'
                                ? 'potential'
                                : 'outline'
                            }
                            className="capitalize text-[10px]"
                          >
                            {comp.research_status}
                          </Badge>
                        </td>

                        <td className="p-4 text-right space-x-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResearchCompany(comp.id, comp.name)}
                            disabled={researchingId === comp.id}
                            className="h-7 px-3 text-[11px] rounded-full gap-1 border-[#e8e8e8]"
                          >
                            {researchingId === comp.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3 text-purple-600" />
                            )}
                            <span>AI Research</span>
                          </Button>

                          <Link href={`/companies/${comp.id}`}>
                            <Button size="sm" className="h-7 px-3 text-[11px] rounded-full bg-[#111111] text-white">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
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
        onSuccess={fetchCompanies}
      />

      <CreateCompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
