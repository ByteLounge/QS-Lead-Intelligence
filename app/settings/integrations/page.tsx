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
import { Database, Sparkles, MapPin, Mail, Send, Cpu, MessageSquare, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function IntegrationsSettingsPage() {
  const { toast } = useToast();
  const [discordUrl, setDiscordUrl] = React.useState('');
  const [discordConfigured, setDiscordConfigured] = React.useState(false);
  const [savingDiscord, setSavingDiscord] = React.useState(false);
  const [testingDiscord, setTestingDiscord] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/settings/discord')
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setDiscordConfigured(true);
          setDiscordUrl(data.maskedUrl || '');
        }
      })
      .catch((err) => console.error('Failed to load Discord settings:', err));
  }, []);

  const handleSaveDiscord = async () => {
    if (!discordUrl.startsWith('https://discord.com/api/webhooks/')) {
      toast({
        title: 'Invalid Webhook URL',
        message: 'Discord Webhook URL must start with https://discord.com/api/webhooks/',
        type: 'error',
      });
      return;
    }

    try {
      setSavingDiscord(true);
      const res = await fetch('/api/settings/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: discordUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setDiscordConfigured(true);
      toast({
        title: 'Discord Saved',
        message: 'Discord Webhook URL successfully saved in system settings.',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error Saving Discord', message: msg, type: 'error' });
    } finally {
      setSavingDiscord(false);
    }
  };

  const handleTestDiscord = async () => {
    try {
      setTestingDiscord(true);
      const res = await fetch('/api/settings/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: discordUrl.startsWith('https://discord.com/api/webhooks/') ? discordUrl : undefined,
          test: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to test');
      toast({
        title: 'Discord Test Delivered!',
        message: 'Check your Discord channel for the Queenstown Lead Bot verification embed.',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Discord Test Failed', message: msg, type: 'error' });
    } finally {
      setTestingDiscord(false);
    }
  };

  const integrations = [
    {
      id: 'discord',
      name: 'Discord Webhook Alerts',
      category: 'Executive Alerts & Telemetry',
      icon: MessageSquare,
      iconColor: 'text-indigo-600',
      description: 'Dispatches daily company discoveries (apps/websites needed), cold email outreach status, and pipeline digests directly to your Discord server.',
      envVars: ['DISCORD_WEBHOOK_URL'],
      isConfigured: discordConfigured,
    },
    {
      id: 'gemini',
      name: 'Google Gemini AI',
      category: 'Artificial Intelligence',
      icon: Sparkles,
      iconColor: 'text-purple-600',
      description: 'Autonomous research engine that discovers companies needing apps/websites, evaluates digital presence, and writes tailored cold outreach.',
      envVars: ['GEMINI_API_KEY', 'GEMINI_MODEL'],
      isConfigured: true,
    },
    {
      id: 'supabase',
      name: 'Supabase PostgreSQL & Auth',
      category: 'Database & Security',
      icon: Database,
      iconColor: 'text-emerald-600',
      description: 'Production cloud database storing companies, contacts, AI lead scores, deal pipeline, and audit logs.',
      envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
      isConfigured: true,
    },
    {
      id: 'resend',
      name: 'Resend API (Cold Email Dispatch)',
      category: 'Email Transport',
      icon: Mail,
      iconColor: 'text-neutral-900',
      description: 'Modern developer-first email platform for sending high-deliverability cold outreach directly to company decision-makers.',
      envVars: ['RESEND_API_KEY', 'SENDER_EMAIL'],
      isConfigured: false,
    },
    {
      id: 'gmail',
      name: 'Gmail REST API (OAuth2)',
      category: 'Email Transport',
      icon: Mail,
      iconColor: 'text-red-500',
      description: 'Authorized mailbox integration for drafting, dispatching, and synchronizing reply threads.',
      envVars: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'],
      isConfigured: false,
    },
    {
      id: 'places',
      name: 'Google Places API',
      category: 'Lead Discovery',
      icon: MapPin,
      iconColor: 'text-blue-600',
      description: 'Queries commercial establishments by sector and city coordinates (Gemini AI acts as intelligent primary discovery provider).',
      envVars: ['GOOGLE_PLACES_API_KEY'],
      isConfigured: false,
    },
    {
      id: 'autopilot',
      name: 'Vercel Serverless Autopilot & Cron',
      category: 'Autonomous Engine',
      icon: Cpu,
      iconColor: 'text-emerald-500',
      description: 'Cloud cron schedules running daily discovery at 06:00 UTC and executive pipeline digests at 18:00 UTC.',
      envVars: ['CRON_SECRET', 'NEXT_PUBLIC_APP_URL'],
      isConfigured: true,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto hairline-grid-subtle max-w-5xl">
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
              Configure credentials for AI discovery, Discord notifications, email gateways, and database telemetry.
            </p>
          </div>

          {/* Quick Discord Webhook Setup Box */}
          <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-100 rounded-md">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-900">Discord Notification Channel</CardTitle>
                    <p className="text-[11px] text-slate-500">
                      Paste your Discord Webhook URL below to receive instant alerts when AI finds companies needing apps/websites.
                    </p>
                  </div>
                </div>
                <Badge variant={discordConfigured ? 'success' : 'outline'} className="text-[10px]">
                  {discordConfigured ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={discordUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full text-xs h-9 px-3 rounded-md border border-slate-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={handleSaveDiscord}
                    disabled={savingDiscord}
                    className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    {savingDiscord ? 'Saving...' : 'Save Webhook'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestDiscord}
                    disabled={testingDiscord}
                    className="h-9 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    {testingDiscord ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                    Test Channel
                  </Button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                To create a webhook: Discord Server Settings &gt; Integrations &gt; Webhooks &gt; New Webhook &gt; Copy Webhook URL.
              </p>
            </CardContent>
          </Card>

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
                      {item.isConfigured ? 'Active' : 'Pending Keys'}
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
              Queenstown Lead Intelligence loads credentials directly from <code className="bg-slate-200 px-1 rounded">.env.local</code> in development or Vercel Environment Variables in production. Settings saved in this dashboard are persisted directly in Supabase PostgreSQL.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
