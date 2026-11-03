'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  MapPin,
  Globe,
  Sparkles,
  Loader2,
  Users,
  Target,
  ArrowUpRight,
} from 'lucide-react';

export default function CompanyDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const companyId = params.id as string;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [researching, setResearching] = React.useState(false);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/companies/${companyId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch company');
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const handleResearch = async () => {
    setResearching(true);
    try {
      const res = await fetch(`/api/leads/${companyId}/research`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Research failed');
      toast({
        title: 'Research Completed',
        message: `Intelligence synthesized. Lead score: ${json.lead?.qualification_score}/100.`,
        type: 'success',
      });
      fetchCompany();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Research Failed', message: msg, type: 'error' });
    } finally {
      setResearching(false);
    }
  };

  if (loading || !data?.company) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  const { company, leads = [], contacts = [] } = data;

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle min-w-0">
          <Link
            href="/companies"
            className="text-xs text-[#666666] hover:text-[#111111] flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Companies</span>
          </Link>

          {/* Company Profile Header */}
          <div className="p-4 sm:p-6 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl font-semibold text-[#111111] tracking-tight font-display">{company.name}</h2>
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {company.discovery_source?.replace('_', ' ')}
                </Badge>
                <Badge
                  variant={company.research_status === 'completed' ? 'success' : 'outline'}
                  className="capitalize text-[10px]"
                >
                  Research: {company.research_status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] mt-1.5 font-mono text-[11px]">
                <span>{company.industry}</span>
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

            <Button
              size="sm"
              onClick={handleResearch}
              disabled={researching}
              className="gap-1.5 text-xs h-8 bg-slate-900 text-white"
            >
              {researching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              )}
              <span>Run AI Intelligence</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Business Overview & Physical Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Company Description</span>
                    <p className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed">
                      {company.description || 'No description provided during discovery ingestion.'}
                    </p>
                  </div>
                  {company.address && (
                    <div className="flex items-start gap-2 pt-1 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{company.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Associated Leads */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Intelligence Evaluations & Leads ({leads.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {leads.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No lead evaluations generated yet.</p>
                  ) : (
                    leads.map((l: any) => (
                      <div key={l.id} className="p-3 border border-slate-200 rounded-md bg-white flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-900">Score: {l.qualification_score}/100</span>
                            <Badge variant={l.qualification_score >= 80 ? 'high' : 'potential'}>
                              {l.qualification_level?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{l.recommended_solution}</p>
                        </div>
                        <Link href={`/leads/${l.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                            <span>View Lead</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Associated Contacts */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-xs">Mapped Contacts ({contacts.length})</CardTitle>
                  <Link href="/contacts" className="text-[11px] text-emerald-700 font-semibold hover:underline">
                    Add
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {contacts.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No contacts mapped.</p>
                  ) : (
                    contacts.map((c: any) => (
                      <div key={c.id} className="p-2.5 border border-slate-200 rounded bg-white">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{c.full_name}</span>
                          <Badge variant="success" className="text-[10px] py-0">{c.verification_status}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">{c.job_title || 'Stakeholder'}</p>
                        <p className="text-[11px] text-slate-700 font-medium">{c.email}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
