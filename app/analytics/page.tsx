'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Intelligence & Conversion Analytics</h2>
            <p className="text-xs text-slate-500">
              Aggregated business performance, outreach conversion rates, and cross-border acquisition metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Conversion Funnel</CardTitle>
                <p className="text-xs text-slate-400">Prospect flow from discovery through to won deals</p>
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
                <CardTitle>Discovery & Outreach Velocity</CardTitle>
                <p className="text-xs text-slate-400">Acquisition vs. outreach volume trends</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.acquisitionOverTime || []}>
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
