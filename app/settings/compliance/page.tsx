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
import {
  ShieldAlert,
  ShieldCheck,
  Save,
  Loader2,
  AlertTriangle,
  UserX,
  Plus,
  Trash2,
} from 'lucide-react';
import { ComplianceSettings } from '@/lib/types';

export default function ComplianceSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [compliance, setCompliance] = React.useState<ComplianceSettings>({
    sending_enabled: false,
    human_approval_required: true,
    daily_email_limit: 5,
    max_followups: 2,
    minimum_lead_score: 80,
    require_verified_email: true,
    sender_name: 'Queenstown Labs Team',
    sender_email: 'solutions@queenstownlabs.com',
    company_physical_address: 'Queenstown Labs, Tech Hub Innovation Centre, Bengaluru / London',
    privacy_policy_url: 'https://queenstownlabs.com/privacy',
    unsubscribe_url: 'https://queenstownlabs.com/unsubscribe',
  });

  const [countryPolicies, setCountryPolicies] = React.useState<Record<string, any>>({});
  const [suppressInput, setSuppressInput] = React.useState('');
  const [suppressReason, setSuppressReason] = React.useState('unsubscribe');
  const [suppressing, setSuppressing] = React.useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/compliance');
      const data = await res.json();
      if (data.compliance) setCompliance(data.compliance);
      if (data.countryPolicies) setCountryPolicies(data.countryPolicies);
    } catch (err) {
      console.error('Failed to load compliance settings:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compliance,
          countryPolicies,
        }),
      });

      if (!res.ok) throw new Error('Failed to update compliance settings');

      toast({
        title: 'Safeguards Updated',
        message: 'Compliance configuration and kill switch state saved to database.',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Save Failed', message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleManualSuppress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressInput.trim()) return;

    setSuppressing(true);
    try {
      const res = await fetch('/api/email/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_email: suppressInput.trim(),
          subject: 'Manual Suppression',
          body: 'Please unsubscribe and do not contact again.',
        }),
      });

      if (!res.ok) throw new Error('Suppression failed');

      toast({
        title: 'Contact Suppressed',
        message: `${suppressInput} added to suppression list and sequence cancelled.`,
        type: 'warning',
      });
      setSuppressInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Suppression Error', message: msg, type: 'error' });
    } finally {
      setSuppressing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DemoBanner isDemoMode={false} />
        <TopNav sendingEnabled={compliance.sending_enabled} />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-5xl">
          {/* Sub Navigation Header */}
          <div>
            <div className="flex items-center space-x-2 text-xs border-b border-slate-200 pb-3 mb-4">
              <Link
                href="/settings/compliance"
                className="font-bold text-slate-900 border-b-2 border-slate-900 pb-3 -mb-3"
              >
                Compliance &amp; Safeguards
              </Link>
              <Link
                href="/settings/integrations"
                className="text-slate-500 hover:text-slate-800 font-medium px-3"
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

            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Compliance &amp; Sending Safeguards
            </h2>
            <p className="text-xs text-slate-500">
              Mandatory sending controls, global kill switch, daily caps, and international regulatory guardrails.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Global Kill Switch Banner */}
            <div
              className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                compliance.sending_enabled
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {compliance.sending_enabled ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Global Outbound Sending Kill Switch:{' '}
                    {compliance.sending_enabled ? (
                      <span className="text-emerald-700">SENDING ACTIVE</span>
                    ) : (
                      <span className="text-rose-700">HALTED (SAFEGUARD ACTIVE)</span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {compliance.sending_enabled
                      ? 'Approved emails can be claimed by the worker and transmitted via Gmail API.'
                      : 'All outbound marketing sending is globally blocked. Incoming replies and opt-outs continue operating normally.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCompliance({ ...compliance, sending_enabled: !compliance.sending_enabled })
                }
                className={`px-4 py-2 text-xs font-bold rounded-md shadow-sm transition-colors ${
                  compliance.sending_enabled
                    ? 'bg-rose-700 text-white hover:bg-rose-800'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {compliance.sending_enabled ? 'ENGAGE KILL SWITCH' : 'ENABLE SENDING'}
              </button>
            </div>

            {/* Core Guardrail Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Sending Guardrails &amp; Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Daily Email Cap (Safe Pacing)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={compliance.daily_email_limit}
                      onChange={(e) =>
                        setCompliance({
                          ...compliance,
                          daily_email_limit: parseInt(e.target.value, 10) || 5,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Default: 5 emails/day to preserve domain reputation.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Max Sequence Follow-ups
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={compliance.max_followups}
                      onChange={(e) =>
                        setCompliance({
                          ...compliance,
                          max_followups: parseInt(e.target.value, 10) || 2,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Maximum: 2 follow-ups (Day 4 &amp; Day 9).
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Minimum AI Lead Score
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="100"
                      value={compliance.minimum_lead_score}
                      onChange={(e) =>
                        setCompliance({
                          ...compliance,
                          minimum_lead_score: parseInt(e.target.value, 10) || 80,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Only leads ≥ 80 are eligible for outreach.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Require Human Review Mode
                    </span>
                    <span className="text-[11px] text-slate-500">
                      When enabled, drafts cannot be transmitted until an operator explicitly clicks Approve.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={compliance.human_approval_required}
                    onChange={(e) =>
                      setCompliance({
                        ...compliance,
                        human_approval_required: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sender Identity & Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Sender Identification &amp; Mandatory Footer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={compliance.sender_name}
                      onChange={(e) =>
                        setCompliance({ ...compliance, sender_name: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Sender Email</label>
                    <input
                      type="email"
                      value={compliance.sender_email}
                      onChange={(e) =>
                        setCompliance({ ...compliance, sender_email: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Physical Operating Address
                  </label>
                  <input
                    type="text"
                    value={compliance.company_physical_address}
                    onChange={(e) =>
                      setCompliance({ ...compliance, company_physical_address: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Country Marketing Eligibility Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Per-Country Marketing Eligibility Policies</CardTitle>
                <p className="text-xs text-slate-400">
                  Regulatory framework governing commercial B2B electronic outreach
                </p>
              </CardHeader>
              <CardContent className="pt-2 text-xs">
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Country</th>
                        <th className="p-2.5">Allowed</th>
                        <th className="p-2.5">B2B Exemption</th>
                        <th className="p-2.5">Mandatory Opt-Out</th>
                        <th className="p-2.5">Legal Guidelines</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(countryPolicies).map(([countryName, policy]) => (
                        <tr key={countryName}>
                          <td className="p-2.5 font-semibold text-slate-900">{countryName}</td>
                          <td className="p-2.5">
                            <input
                              type="checkbox"
                              checked={policy.allowed}
                              onChange={(e) =>
                                setCountryPolicies({
                                  ...countryPolicies,
                                  [countryName]: { ...policy, allowed: e.target.checked },
                                })
                              }
                            />
                          </td>
                          <td className="p-2.5 text-emerald-700 font-medium">Yes (Corporate)</td>
                          <td className="p-2.5 text-slate-600">Enforced</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{policy.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-slate-900 text-white gap-2">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Compliance Settings</span>
              </Button>
            </div>
          </form>

          {/* Suppression List Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                <span>Manual Contact &amp; Domain Suppression</span>
              </CardTitle>
              <p className="text-xs text-slate-400">
                Immediately block future emails to a specific address or domain.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <form onSubmit={handleManualSuppress} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="e.g. optout@prospect.com"
                  value={suppressInput}
                  onChange={(e) => setSuppressInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded"
                />
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={suppressing}
                  className="h-8 text-xs gap-1.5"
                >
                  {suppressing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  <span>Suppress Contact</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
