'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Terminal, ArrowUpRight, CheckCircle2, Download } from 'lucide-react';

const WORKFLOWS = [
  {
    id: 'WF-01',
    name: 'Lead Discovery Engine',
    file: 'WF-01_Lead_Discovery_Engine.json',
    trigger: 'Schedule (Every 6h) / Webhook',
    purpose: 'Queries Google Places API, extracts company metadata, normalizes and deduplicates in Supabase.',
    nodes: ['Schedule Trigger', 'Edit Fields', 'HTTP Request (Places)', 'Code', 'Postgres', 'Telegram'],
    status: 'Ready / Exported',
  },
  {
    id: 'WF-02',
    name: 'Business Intelligence Agent',
    file: 'WF-02_Business_Intelligence_Agent.json',
    trigger: 'Schedule (Every 2h) / Postgres Polling',
    purpose: 'Fetches public websites safely, runs Gemini AI intelligence, computes 100-pt lead scores.',
    nodes: ['Postgres Query', 'HTTP Request (Scrape)', 'Sanitize Code', 'Gemini API', 'Postgres Update', 'Telegram Alert'],
    status: 'Ready / Exported',
  },
  {
    id: 'WF-03',
    name: 'Contact Qualification & Outreach Writer',
    file: 'WF-03_Contact_Qualification_Outreach.json',
    trigger: 'Schedule (Every 4h)',
    purpose: 'Maps decision-maker contact points, writes tailored 80-130 word intro emails, queues for safety approval.',
    nodes: ['Postgres Query (Score ≥ 80)', 'Contact Ingestion', 'Gemini Writer', 'Postgres Insert (Pending Approval)', 'Telegram Alert'],
    status: 'Ready / Exported',
  },
  {
    id: 'WF-04',
    name: 'Email Delivery & Follow-ups Queue',
    file: 'WF-04_Email_Delivery_Followups.json',
    trigger: 'Schedule (Every 15m)',
    purpose: 'Calls claim_eligible_outbound_messages() with FOR UPDATE SKIP LOCKED, verifies kill switch, sends via Gmail.',
    nodes: ['Schedule Trigger', 'Postgres Stored Function', 'If Eligible', 'Email API Dispatch', 'Postgres Update', 'Telegram Alert'],
    status: 'Ready / Exported',
  },
  {
    id: 'WF-05',
    name: 'Reply & Conversation Manager',
    file: 'WF-05_Reply_Conversation_Manager.json',
    trigger: 'Incoming Webhook / Gmail Trigger',
    purpose: 'Applies deterministic opt-out checks, runs Gemini intent classification, halts follow-ups on reply.',
    nodes: ['Webhook', 'Deterministic Opt-Out Guard', 'Gemini Classifier', 'Switch Intent', 'Suppression Insert', 'Pipeline Promote', 'Telegram Alert'],
    status: 'Ready / Exported',
  },
  {
    id: 'WF-06',
    name: 'CRM & Executive Briefing',
    file: 'WF-06_CRM_Reporting.json',
    trigger: 'Daily at 09:00 UTC',
    purpose: 'Aggregates daily performance metrics and posts markdown briefing to Telegram channel.',
    nodes: ['Cron 0 9 * * *', 'Postgres Metrics Query', 'Format Report Code', 'Telegram Notification'],
    status: 'Ready / Exported',
  },
];

export default function AutomationsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">n8n Automation Engine</h2>
            <p className="text-xs text-slate-500">
              Self-hosted n8n workflows powering background lead discovery, AI scoring, email dispatch, and reply monitoring.
            </p>
          </div>

          {/* Docker Compose Quickstart Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-lg shadow-sm text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-emerald-400">Self-Hosted Deployment Quickstart</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2.5 rounded">
              cd n8n &amp;&amp; docker compose up -d
            </p>
            <p className="text-slate-400 text-[11px]">
              Access local n8n instance at <code className="text-slate-200">http://localhost:5678</code>. All workflow JSON exports are stored in <code className="text-slate-200">n8n/workflows/</code>.
            </p>
          </div>

          {/* Workflow Cards */}
          <div className="space-y-4">
            {WORKFLOWS.map((wf) => (
              <div key={wf.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm text-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{wf.id}: {wf.name}</span>
                      <Badge variant="success" className="text-[10px]">
                        {wf.status}
                      </Badge>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-1">{wf.purpose}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {wf.file}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 font-medium block">Trigger Mechanism:</span>
                    <span className="font-semibold text-slate-700">{wf.trigger}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Key Integrated Nodes:</span>
                    <span className="font-medium text-slate-700">{wf.nodes.join(' → ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
