'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  Cpu,
  Terminal,
  ArrowUpRight,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Target,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface CronPipeline {
  id: string;
  name: string;
  endpoint: string;
  schedule: string;
  purpose: string;
  tags: string[];
  status: 'Active' | 'Ready';
}

const PIPELINES: CronPipeline[] = [
  {
    id: 'PIPE-01',
    name: 'Lead Discovery & Gemini AI Scoring Engine',
    endpoint: '/api/cron/discovery',
    schedule: 'Daily at 06:00 UTC (0 6 * * *) · Vercel Cron',
    purpose:
      'Queries Google Places API across target sectors, ingests domains into Supabase, scrapes company landing pages, and runs Gemini 2.5 Flash 100-point qualification scoring.',
    tags: ['Places API', 'Web Scraping', 'Gemini 2.5 Flash', 'Lead Scoring'],
    status: 'Active',
  },
  {
    id: 'PIPE-02',
    name: 'Autonomous High-Priority Queue & Dispatch Engine',
    endpoint: '/api/cron/dispatch',
    schedule: 'Every 15 Minutes · cron-job.org Pinger',
    purpose:
      'Claims eligible outreach drafts with FOR UPDATE SKIP LOCKED, verifies global sending kill switch and recipient suppression, and delivers via Gmail OAuth2 transport.',
    tags: ['Row-Level Locking', 'Suppression Guard', 'Gmail OAuth2', 'Daily Limits'],
    status: 'Active',
  },
  {
    id: 'PIPE-03',
    name: 'Daily Executive Digest & Telegram Briefing',
    endpoint: '/api/cron/digest',
    schedule: 'Daily at 18:00 UTC (0 18 * * *) · Vercel Cron',
    purpose:
      'Aggregates 24-hour lead acquisition metrics, reply sentiment breakdown, and sends an executive formatted briefing to Telegram and Discord webhooks.',
    tags: ['CRM Telemetry', 'Discord Webhook', 'Telegram Bot', 'Analytics'],
    status: 'Active',
  },
];

export default function AutomationsPage() {
  const { toast } = useToast();
  const [runningPipeline, setRunningPipeline] = React.useState<string | null>(null);
  const [pipelineResults, setPipelineResults] = React.useState<Record<string, any>>({});

  const triggerPipeline = async (pipe: CronPipeline) => {
    try {
      setRunningPipeline(pipe.id);
      const res = await fetch(pipe.endpoint, { method: 'GET' });
      const data = await res.json();
      
      setPipelineResults((prev) => ({ ...prev, [pipe.id]: data }));

      if (!res.ok) throw new Error(data.error || 'Pipeline run failed');

      toast({
        title: `${pipe.name} Completed`,
        message: data.message || `Pipeline executed successfully. Processed: ${JSON.stringify(data.metrics || data.discovered || 'OK')}`,
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Pipeline Trigger Error',
        message: msg,
        type: 'error',
      });
    } finally {
      setRunningPipeline(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto hairline-grid-subtle max-w-5xl min-w-0">
          {/* Header */}
          <div className="space-y-1.5 pb-2 border-b border-[#e8e8e8]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider border border-[#e8e8e8] bg-white text-[#666666] shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Vercel Cloud Autopilot &amp; Serverless Pipelines</span>
            </div>
            <h2 className="text-2xl font-semibold text-[#111111] tracking-tight font-display">
              Autonomous Autopilot Engine
            </h2>
            <p className="text-xs text-[#666666] max-w-2xl leading-relaxed">
              Queenstown Labs cloud pipelines run automatically 24/7 without requiring local servers or heavy infrastructure. Trigger, test, and monitor background tasks directly below.
            </p>
          </div>

          {/* Autopilot Overview Banner */}
          <div className="p-4 sm:p-6 bg-[#111111] text-white rounded-2xl shadow-[0_4px_24px_-6px_rgba(17,17,17,0.25)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-white font-display">
                    24/7 Serverless Autopilot Active
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Cloud Native · Vercel Edge &amp; Supabase PostgreSQL
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>AUTOPILOT ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Discovery Engine</span>
                <span className="font-semibold text-white mt-0.5 block">Daily 06:00 UTC</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Places API + Web Scrape + AI</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Outreach Dispatch</span>
                <span className="font-semibold text-white mt-0.5 block">Every 15 Minutes</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">cron-job.org Trigger</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] text-zinc-400 font-mono uppercase block">Daily Digest</span>
                <span className="font-semibold text-white mt-0.5 block">Daily 18:00 UTC</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Telegram &amp; Discord Notifications</span>
              </div>
            </div>
          </div>

          {/* Pipelines List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-[#111111] font-display">
                Automated Pipeline Endpoints
              </h3>
              <span className="text-xs text-[#777777] font-mono">3 Cloud Pipelines Registered</span>
            </div>

            {PIPELINES.map((pipe) => {
              const isRunning = runningPipeline === pipe.id;
              const result = pipelineResults[pipe.id];

              return (
                <div
                  key={pipe.id}
                  className="p-5 bg-white border border-[#e8e8e8] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.04)] hover:border-[#cfcfcf] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-[#888888]">{pipe.id}</span>
                        <h4 className="font-semibold text-sm text-[#111111] tracking-tight font-display">
                          {pipe.name}
                        </h4>
                        <Badge variant="success" className="text-[10px]">
                          {pipe.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#666666] leading-relaxed max-w-2xl">{pipe.purpose}</p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => triggerPipeline(pipe)}
                        disabled={isRunning}
                        className="h-8 px-3.5 text-xs rounded-full gap-1.5 shadow-sm"
                      >
                        {isRunning ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3 fill-current" />
                        )}
                        <span>{isRunning ? 'Running...' : 'Run Pipeline'}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#f5f5f5]">
                    <div className="space-y-1">
                      <span className="text-[#888888] font-mono text-[10px] uppercase block">
                        Schedule Trigger
                      </span>
                      <span className="font-medium text-[#111111] flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#888888]" />
                        {pipe.schedule}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#888888] font-mono text-[10px] uppercase block">
                        Cloud Route &amp; Endpoint
                      </span>
                      <code className="px-2 py-0.5 rounded bg-[#f5f5f5] text-[#111111] font-mono text-[11px] border border-[#e8e8e8]">
                        GET {pipe.endpoint}
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {pipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#f7f7f7] text-[#666666] border border-[#e8e8e8]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {result && (
                    <div className="p-3 bg-[#fafafa] rounded-xl border border-[#e8e8e8] text-[11px] font-mono text-[#333333] space-y-1">
                      <div className="flex items-center justify-between text-[#888888]">
                        <span>Last Execution Response</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                      <pre className="overflow-x-auto text-[10px] text-[#111111] max-h-32">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Architecture Guardrails Section */}
          <div className="p-6 bg-white border border-[#e8e8e8] rounded-2xl space-y-3 shadow-[0_1px_2px_rgba(17,17,17,0.04)]">
            <h3 className="text-sm font-semibold tracking-tight text-[#111111] font-display flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Built-in Compliance &amp; Reliability Safeguards</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#666666] pt-1">
              <div>
                <p className="font-medium text-[#111111] mb-1">Row-Level DB Locking</p>
                <p className="leading-relaxed">
                  PostgreSQL <code className="font-mono text-[10px] bg-[#f5f5f5] px-1 py-0.5 rounded">FOR UPDATE SKIP LOCKED</code> ensures messages are never claimed or sent twice even if multiple workers execute simultaneously.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#111111] mb-1">Global Sending Kill Switch</p>
                <p className="leading-relaxed">
                  Instantly halt all outgoing communications with one toggle in the header or compliance settings. System respects daily send limits (25/day default).
                </p>
              </div>
              <div>
                <p className="font-medium text-[#111111] mb-1">Deterministic Opt-Out Guard</p>
                <p className="leading-relaxed">
                  Incoming replies containing keywords like &quot;unsubscribe&quot; or &quot;stop&quot; immediately halt campaigns and insert domain suppression records.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
