'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { DiscoveryModal } from '@/components/leads/discovery-modal';
import { CreateCompanyModal } from '@/components/leads/create-company-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Plus,
  Zap,
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

  const PIE_COLORS = ['#111111', '#10B981', '#666666', '#a3a3a3', '#e8e8e8'];

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar pendingApprovalsCount={data?.pendingApprovals?.length || 0} />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={health.isDemoMode} />
        <TopNav
          sendingEnabled={health.sendingEnabled}
          isDemoMode={health.isDemoMode}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenNewLead={() => setIsCreateCompanyOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto hairline-grid-subtle">
          {/* Studio Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666] shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Autonomous Studio Engine · Vercel Autopilot</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-semibold text-[#111111] tracking-tight font-display">
                Lead Intelligence &amp; Acquisition
              </h2>
              <p className="text-xs text-[#666666] max-w-2xl leading-relaxed">
                Queenstown Labs autonomous telemetry, multi-channel discovery, Gemini 2.5 prospect qualification, and automated outbound sales engine.
              </p>
            </div>
            
            <div className="flex items-center space-x-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMetrics}
                className="h-8 gap-1.5 text-xs rounded-full border-[#e8e8e8] bg-white hover:bg-[#fafafa]"
              >
                <RefreshCw className={`h-3 w-3 text-[#666666] ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsDiscoveryOpen(true)}
                className="h-8 gap-1.5 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs"
              >
                <Search className="h-3 w-3" />
                <span>Run Discovery</span>
              </Button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Discovered</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.totalCompanies || 0}</p>
                  <p className="text-[10px] text-[#888888] mt-0.5">Target Businesses</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#f5f5f5] border border-[#e8e8e8] flex items-center justify-center text-[#111111]">
                  <Building2 className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Qualified</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.qualifiedLeads || 0}</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Score ≥ 60</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Target className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">High Priority</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-0.5 font-display">{kpis.highPriorityLeads || 0}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Score ≥ 80</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Contacts</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.totalContacts || 0}</p>
                  <p className="text-[10px] text-[#888888] mt-0.5">Stakeholders</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#f5f5f5] border border-[#e8e8e8] flex items-center justify-center text-[#111111]">
                  <Users className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Outreach Sent</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.emailsSent || 0}</p>
                  <p className="text-[10px] text-[#888888] mt-0.5">Delivered</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#f5f5f5] border border-[#e8e8e8] flex items-center justify-center text-[#111111]">
                  <Send className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Replies</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.totalReplies || 0}</p>
                  <p className="text-[10px] text-[#888888] mt-0.5">Inbound Notes</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Interested</p>
                  <p className="text-2xl font-semibold text-emerald-700 mt-0.5 font-display">{kpis.interestedProspects || 0}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Warm Engagement</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Flame className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Meetings</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.meetingsRequested || 0}</p>
                  <p className="text-[10px] text-[#666666] mt-0.5">High Intent Calls</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Deals Won</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">{kpis.dealsWon || 0}</p>
                  <p className="text-[10px] text-[#888888] mt-0.5">Converted Accounts</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                  <Trophy className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-[#cfcfcf] transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#777777]">Pipeline Value</p>
                  <p className="text-2xl font-semibold text-[#111111] mt-0.5 font-display">
                    ${Number(kpis.estimatedPipelineValue || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#888888] mt-0.5">Active Opportunities</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1: Funnel & AI Lead Qualification */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 border-b border-[#f0f0f0]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Acquisition &amp; Outreach Funnel</CardTitle>
                    <CardDescription>Conversion telemetry from discovery to closed customer accounts</CardDescription>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[#888888] bg-[#f5f5f5] px-2 py-0.5 rounded-full border border-[#e8e8e8]">
                    Realtime
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.conversionFunnel || []}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#e8e8e8" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#666666' }} />
                      <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: '#111111' }} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8',
                          boxShadow: '0 4px 12px rgba(17,17,17,0.08)',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="count" fill="#111111" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-[#f0f0f0]">
                <CardTitle>Qualification Distribution</CardTitle>
                <CardDescription>100-Point Gemini Lead Scoring</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.qualificationDistribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={3}
                      >
                        {(charts.qualificationDistribution || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8',
                          boxShadow: '0 4px 12px rgba(17,17,17,0.08)',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 text-[11px] text-[#555555] mt-2 pt-2 border-t border-[#f0f0f0]">
                  {(charts.qualificationDistribution || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="truncate">{item.name}: <strong className="text-[#111111]">{item.value}</strong></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Target Countries & Velocity Over Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[#f0f0f0]">
                <CardTitle>Leads by Target Market</CardTitle>
                <CardDescription>Geographic distribution across digital product and software markets</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.leadsByCountry || []}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e8e8e8" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666666' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#666666' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8',
                          boxShadow: '0 4px 12px rgba(17,17,17,0.08)',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-[#f0f0f0]">
                <CardTitle>Discovery &amp; Outreach Velocity</CardTitle>
                <CardDescription>Daily volume of discovered leads vs. approved emails sent</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.acquisitionOverTime || []}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e8e8e8" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#666666' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#666666' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e8e8e8',
                          boxShadow: '0 4px 12px rgba(17,17,17,0.08)',
                          fontSize: '11px',
                        }}
                      />
                      <Line type="monotone" dataKey="leads" stroke="#111111" strokeWidth={2} dot={{ r: 3, fill: '#111111' }} name="Discovered Leads" />
                      <Line type="monotone" dataKey="outreach" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} name="Outreach Sent" />
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
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#f0f0f0]">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Pending Email Approvals</span>
                  </CardTitle>
                  <CardDescription>Drafts generated by AI requiring human approval before delivery</CardDescription>
                </div>
                <Link href="/email-approvals" className="text-xs font-medium text-[#111111] hover:underline inline-flex items-center gap-1">
                  <span>View All</span>
                  <ArrowUpRight className="h-3 w-3 text-[#777777]" />
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {(!data?.pendingApprovals || data.pendingApprovals.length === 0) ? (
                  <div className="py-10 text-center text-xs text-[#888888] space-y-1.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="font-medium text-[#111111] pt-1">All Drafts Cleared</p>
                    <p className="text-[11px] text-[#777777]">No messages currently awaiting operator review.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.pendingApprovals.map((msg: any) => (
                      <div key={msg.id} className="p-4 border border-[#e8e8e8] rounded-xl bg-white hover:border-[#cfcfcf] transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#111111] truncate">
                            {msg.contact?.company?.name || 'Prospect Company'}
                          </span>
                          <Badge variant="warning">Review Required</Badge>
                        </div>
                        <p className="text-[11px] text-[#333333] font-medium line-clamp-1">{msg.subject}</p>
                        <p className="text-[11px] text-[#666666] line-clamp-2 leading-relaxed">{msg.body}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-[#f5f5f5]">
                          <span className="text-[10px] text-[#888888] font-mono">
                            To: {msg.contact?.email || 'Contact'}
                          </span>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveEmail(msg.id)}
                            className="h-7 px-3 text-[11px] rounded-full"
                          >
                            Approve
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
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#f0f0f0]">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    <span>Recent Inbound Replies</span>
                  </CardTitle>
                  <CardDescription>Processed and categorized by Gemini Intent Engine</CardDescription>
                </div>
                <Link href="/inbox" className="text-xs font-medium text-[#111111] hover:underline inline-flex items-center gap-1">
                  <span>View Inbox</span>
                  <ArrowUpRight className="h-3 w-3 text-[#777777]" />
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {(!data?.recentReplies || data.recentReplies.length === 0) ? (
                  <div className="py-10 text-center text-xs text-[#888888] space-y-1">
                    <MessageSquare className="h-8 w-8 text-[#d4d4d4] mx-auto mb-1" />
                    <p className="font-medium text-[#111111]">No replies received yet</p>
                    <p className="text-[11px] text-[#777777]">Inbound email webhook will automatically log responses here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recentReplies.map((rep: any) => (
                      <div key={rep.id} className="p-4 border border-[#e8e8e8] rounded-xl bg-white hover:border-[#cfcfcf] transition-all space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-[#111111] truncate">
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
                        <p className="text-[11px] text-[#333333] font-medium line-clamp-1">{rep.subject}</p>
                        <p className="text-[11px] text-[#666666] line-clamp-2 leading-relaxed">{rep.body}</p>
                        {rep.summary && (
                          <p className="text-[10px] text-[#555555] bg-[#fafafa] p-2 rounded-lg border border-[#f0f0f0]">
                            <strong>AI Summary:</strong> {rep.summary}
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
            <CardHeader className="pb-3 border-b border-[#f0f0f0]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Autonomous Telemetry &amp; System Health</CardTitle>
                  <CardDescription>Live status across database, generative AI, and communication adapters</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ALL ENGINES LIVE</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-between hover:border-[#cfcfcf] transition-all">
                  <div>
                    <p className="font-medium text-[#111111]">Supabase PostgreSQL</p>
                    <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                      {health.databaseConnected ? 'Connected (Pool)' : 'Demo Cache'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.databaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-between hover:border-[#cfcfcf] transition-all">
                  <div>
                    <p className="font-medium text-[#111111]">Google Gemini 2.5</p>
                    <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                      {health.geminiConfigured ? 'Flash Active' : 'Fallback Adapter'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.geminiConfigured ? 'bg-emerald-500' : 'bg-[#e8e8e8]'}`} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-between hover:border-[#cfcfcf] transition-all">
                  <div>
                    <p className="font-medium text-[#111111]">Google Places API</p>
                    <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                      {health.placesConfigured ? 'Discovery Engine' : 'Mock Places'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.placesConfigured ? 'bg-emerald-500' : 'bg-[#e8e8e8]'}`} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-between hover:border-[#cfcfcf] transition-all">
                  <div>
                    <p className="font-medium text-[#111111]">Gmail OAuth2</p>
                    <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                      {health.gmailConfigured ? 'Transport Ready' : 'Console Transport'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.gmailConfigured ? 'bg-emerald-500' : 'bg-[#e8e8e8]'}`} />
                </div>

                <div className="p-3.5 rounded-xl border border-[#e8e8e8] bg-white flex items-center justify-between hover:border-[#cfcfcf] transition-all">
                  <div>
                    <p className="font-medium text-[#111111]">Telegram / Discord</p>
                    <p className="text-[10px] text-[#777777] font-mono mt-0.5">
                      {health.telegramConfigured ? 'Notifications Live' : 'Logger'}
                    </p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${health.telegramConfigured ? 'bg-emerald-500' : 'bg-[#e8e8e8]'}`} />
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
