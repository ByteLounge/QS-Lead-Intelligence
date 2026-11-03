'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
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

export default function AnalyticsPage() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/metrics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Analytics load error:', err);
      }
    }
    load();
  }, []);

  const charts = data?.charts || {};
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto hairline-grid-subtle min-w-0">
          <div className="space-y-1 pb-2 border-b border-[#e8e8e8]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666]">
              <BarChart3 className="h-3 w-3 text-[#111111]" />
              <span>Conversion Telemetry</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
              Intelligence &amp; Conversion Analytics
            </h2>
            <p className="text-xs text-[#666666]">
              Aggregated studio performance, outreach conversion velocity, and cross-border acquisition metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-[#f0f0f0]">
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Prospect flow from discovery through to won deals</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={charts.conversionFunnel || []}
                      layout="vertical"
                      margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#e8e8e8" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#666666' }} />
                      <YAxis type="category" dataKey="stage" tick={{ fontSize: 10, fill: '#111111' }} width={90} />
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
              <CardHeader className="pb-2">
                <CardTitle>Qualification Distribution</CardTitle>
                <p className="text-xs text-slate-400">AI Scoring breakdown across 100 points</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.qualificationDistribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Market Reach by Country</CardTitle>
                <p className="text-xs text-slate-400">Total discovered prospects by geographical region</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.leadsByCountry || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
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
                <CardTitle>Discovery &amp; Outreach Velocity</CardTitle>
                <p className="text-xs text-slate-400">Acquisition vs. outreach volume trends</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.acquisitionOverTime || []} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="leads" stroke="#0F172A" strokeWidth={2} name="Discovered" />
                      <Line type="monotone" dataKey="outreach" stroke="#10B981" strokeWidth={2} name="Dispatched" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
