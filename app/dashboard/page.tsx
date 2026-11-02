'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { DiscoveryModal } from '@/components/leads/discovery-modal';
import { CreateCompanyModal } from '@/components/leads/create-company-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import {
  Building2,
  Target,
  Sparkles,
  Users,
  Send,
  MessageSquare,
  Flame,
  Calendar,
  Trophy,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = React.useState(false);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = React.useState(false);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/metrics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMetrics();
  }, []);

  const handleApproveEmail = async (messageId: string) => {
    try {
      const res = await fetch('/api/outreach/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, action: 'approve' }),
      });
      if (!res.ok) throw new Error('Approval failed');
      toast({
        title: 'Outreach Approved',
        message: 'Message queued for sending. Compliance checks will be enforced.',
        type: 'success',
      });
      fetchMetrics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Approval Error', message: msg, type: 'error' });
    }
  };

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const health = data?.systemHealth || {};

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar pendingApprovalsCount={data?.pendingApprovals?.length || 0} />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={health.isDemoMode} />
        <TopNav
          sendingEnabled={health.sendingEnabled}
          isDemoMode={health.isDemoMode}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenNewLead={() => setIsCreateCompanyOpen(true)}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Overview Dashboard</h2>
              <p className="text-xs text-slate-500">
                Queenstown Labs live client acquisition analytics, intelligence pipeline, and outreach telemetry.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchMetrics} className="h-8 gap-1.5 text-xs">
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsDiscoveryOpen(true)}
                className="h-8 gap-1.5 text-xs bg-slate-900 text-white"
              >
                <Search className="h-3 w-3" />
                <span>Run Discovery</span>
              </Button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Discovered</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{kpis.totalCompanies || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Target Businesses</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Building2 className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Qualified Leads</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{kpis.qualifiedLeads || 0}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Score ≥ 60</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Target className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">High Priority</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{kpis.highPriorityLeads || 0}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Score ≥ 80</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Total Contacts</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{kpis.totalContacts || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Verified Stakeholders</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Users className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Emails Sent</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{kpis.emailsSent || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Approved & Delivered</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Send className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Replies Received</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{kpis.totalReplies || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Inbound Prospect Notes</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Interested</p>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">{kpis.interestedProspects || 0}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Warm Engagement</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Flame className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Meetings Requested</p>
                  <p className="text-xl font-bold text-purple-700 mt-0.5">{kpis.meetingsRequested || 0}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">High Intent</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center text-purple-600">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Deals Won</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{kpis.dealsWon || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Converted Accounts</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
                  <Trophy className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Pipeline Value</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">
                    ${Number(kpis.estimatedPipelineValue || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active Opportunities</p>
                </div>
                <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1: Funnel & Lead Qualification */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Client Acquisition & Outreach Funnel</CardTitle>
                <p className="text-xs text-slate-400">Conversion across stages from discovery to sales closure</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.conversionFunnel || []}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0F172A" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Qualification Distribution</CardTitle>
                <p className="text-xs text-slate-400">100-Point AI Lead Scoring Breakdown</p>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col items-center">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.qualificationDistribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {(charts.qualificationDistribution || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 mt-1">
                  {(charts.qualificationDistribution || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Leads by Country & Acquisition Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Leads by Target Country</CardTitle>
                <p className="text-xs text-slate-400">Cross-border distribution across target software markets</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.leadsByCountry || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Discovery & Outreach Over Time</CardTitle>
                <p className="text-xs text-slate-400">Daily velocity of leads acquired vs. outreach messages</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.acquisitionOverTime || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="leads" stroke="#0F172A" strokeWidth={2} name="Discovered Leads" />
                      <Line type="monotone" dataKey="outreach" stroke="#10B981" strokeWidth={2} name="Outreach Sent" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Center: Pending Email Approvals & Recent Replies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Pending Email Approvals</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400">Outbound drafts requiring human safety sign-off</p>
                </div>
                <Link href="/email-approvals" className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-2">
                {(!data?.pendingApprovals || data.pendingApprovals.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                    <p>No messages awaiting approval. All drafts cleared.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.pendingApprovals.map((msg: any) => (
                      <div key={msg.id} className="p-3 border border-slate-200 rounded-md bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {msg.contact?.company?.name || 'Prospect Company'}
                          </span>
                          <Badge variant="warning">Pending Review</Badge>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 font-medium">{msg.subject}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{msg.body}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">
                            Recipient: {msg.contact?.email || 'Contact'}
                          </span>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApproveEmail(msg.id)}
                            className="h-7 px-2.5 text-[11px]"
                          >
                            Approve for Sending
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Inbound Replies */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span>Recent Prospect Replies</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400">Inbound emails classified by Gemini Intent Engine</p>
                </div>
                <Link href="/inbox" className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1">
                  <span>View Inbox</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-2">
                {(!data?.recentReplies || data.recentReplies.length === 0) ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <p>No replies received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recentReplies.map((rep: any) => (
                      <div key={rep.id} className="p-3 border border-slate-200 rounded-md bg-white space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 truncate">
                            {rep.from_email}
                          </span>
                          <Badge
                            variant={
                              rep.classification === 'meeting_request'
                                ? 'high'
                                : rep.classification === 'interested'
                                ? 'success'
                                : rep.classification === 'unsubscribe'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {rep.classification.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium line-clamp-1">{rep.subject}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{rep.body}</p>
                        {rep.summary && (
                          <p className="text-[10px] text-slate-400 italic bg-slate-50 p-1.5 rounded">
                            AI Summary: {rep.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Health Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>System Health & Integration Status</CardTitle>
              <p className="text-xs text-slate-400">Live connectivity across database, AI, and communication adapters</p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-2.5 rounded border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Supabase DB</p>
                    <p className="text-[10px] text-slate-500">
                      {health.databaseConnected ? 'PostgreSQL Active' : 'Local Demo Cache'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.databaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Google Gemini AI</p>
                    <p className="text-[10px] text-slate-500">
                      {health.geminiConfigured ? 'Connected (Flash)' : 'Offline Fallback'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.geminiConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Google Places</p>
                    <p className="text-[10px] text-slate-500">
                      {health.placesConfigured ? 'Places API Active' : 'Fallback Adapter'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.placesConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Gmail OAuth2</p>
                    <p className="text-[10px] text-slate-500">
                      {health.gmailConfigured ? 'API Connected' : 'Simulated Transport'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.gmailConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>

                <div className="p-2.5 rounded border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Telegram Alerts</p>
                    <p className="text-[10px] text-slate-500">
                      {health.telegramConfigured ? 'Bot Dispatcher Active' : 'Console Logger'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.telegramConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <DiscoveryModal
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSuccess={fetchMetrics}
      />

      <CreateCompanyModal
        isOpen={isCreateCompanyOpen}
        onClose={() => setIsCreateCompanyOpen(false)}
        onSuccess={fetchMetrics}
      />
    </div>
  );
}
