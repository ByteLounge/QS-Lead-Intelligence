'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Megaphone, Send, Users } from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle min-w-0">
          <Link
            href="/campaigns"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Campaigns</span>
          </Link>

          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign #{id.substring(0, 8)}</h2>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Logistics & Warehouse Digitalization 2026 • 3-Touch Sequence Sequence Enforced
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-500 block font-medium">Day 0: Initial Touch</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Introduction & Grounded Solution</p>
                <p className="text-[10px] text-slate-400 mt-1">80-130 words with verified observation</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-500 block font-medium">Day 4: Sequence 1</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Technical Insight & Case Parallel</p>
                <p className="text-[10px] text-slate-400 mt-1">50-80 words follow-up</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-[11px] text-slate-500 block font-medium">Day 9: Sequence 2</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Polite Break-up & Door Open</p>
                <p className="text-[10px] text-slate-400 mt-1">40-60 words final note</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
