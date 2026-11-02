'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Database, Sparkles, MapPin, Mail, Send, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrationsSettingsPage() {
  const { toast } = useToast();

  const integrations = [
    {
      id: 'gemini',
      name: 'Google Gemini API',
      category: 'Artificial Intelligence',
      icon: Sparkles,
      iconColor: 'text-purple-600',
      description: 'Drives website intelligence research, 100-pt scoring, outreach drafting, and reply intent classification.',
      envVars: ['GEMINI_API_KEY', 'GEMINI_MODEL'],
      isConfigured: false,
    },
    {
      id: 'supabase',
      name: 'Supabase PostgreSQL & Auth',
      category: 'Database & Security',
      icon: Database,
      iconColor: 'text-emerald-600',
      description: 'Relational data store with Row Level Security, concurrency locking, and audit logs.',
      envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
      isConfigured: false,
    },
    {
      id: 'places',
      name: 'Google Places API',
      category: 'Lead Discovery',
      icon: MapPin,
      iconColor: 'text-blue-600',
      description: 'Discovers verified commercial businesses by sector, country, and city coordinates.',
      envVars: ['GOOGLE_PLACES_API_KEY'],
      isConfigured: false,
    },
    {
      id: 'gmail',
      name: 'Gmail REST API (OAuth2)',
      category: 'Email Transport',
      icon: Mail,
      iconColor: 'text-red-500',
      description: 'Authorized mailbox integration for drafting, dispatching, and reply thread synchronization.',
      envVars: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'],
      isConfigured: false,
    },
    {
      id: 'telegram',
      name: 'Telegram Bot API',
      category: 'Executive Alerts',
      icon: Send,
      iconColor: 'text-sky-500',
      description: 'Instant alerts for high-priority leads (score ≥ 80), meeting requests, opt-outs, and daily summaries.',
      envVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
      isConfigured: false,
    },
    {
      id: 'n8n',
      name: 'n8n Community Edition',
      category: 'Automation Engine',
      icon: Cpu,
      iconColor: 'text-orange-500',
      description: 'Self-hosted Docker automation engine executing WF-01 through WF-06 background workers.',
      envVars: ['N8N_BASE_URL', 'N8N_WEBHOOK_SECRET', 'N8N_ENCRYPTION_KEY'],
      isConfigured: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl">
          {/* Sub Navigation Header */}
          <div>
            <div className="flex items-center space-x-2 text-xs border-b border-slate-200 pb-3 mb-4">
              <Link
                href="/settings/compliance"
                className="text-slate-500 hover:text-slate-800 font-medium px-3"
              >
                Compliance &amp; Safeguards
              </Link>
              <Link
                href="/settings/integrations"
                className="font-bold text-slate-900 border-b-2 border-slate-900 pb-3 -mb-3"
              >
                API Integrations
              </Link>
              <Link
                href="/settings/team"
                className="text-slate-500 hover:text-slate-800 font-medium px-3"
              >
                Team &amp; Access Control
              </Link>
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight">API &amp; Service Integrations</h2>
            <p className="text-xs text-slate-500">
              Configure credentials and connection endpoints for AI models, discovery providers, email gateways, and notifications.
            </p>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-slate-50 border border-slate-200/60 rounded-md">
                        <Icon className={`h-5 w-5 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 font-medium">{item.category}</p>
                      </div>
                    </div>

                    <Badge variant={item.isConfigured ? 'success' : 'outline'} className="text-[10px]">
                      {item.isConfigured ? 'Ready' : 'Pending Keys'}
                    </Badge>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Required Environment Variables:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.envVars.map((v) => (
                        <code key={v} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {v}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Configuration Guide Box */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-xs space-y-2">
            <h4 className="font-bold text-slate-900">How to update credentials</h4>
            <p className="text-slate-600 text-[11px]">
              Queenstown Lead Intelligence loads credentials directly from <code className="bg-slate-200 px-1 rounded">.env.local</code> in production and development. Copy the template from <code className="bg-slate-200 px-1 rounded">.env.example</code>, fill in your keys, and restart the Next.js process.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
