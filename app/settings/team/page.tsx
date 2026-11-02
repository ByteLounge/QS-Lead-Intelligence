'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { DemoBanner } from '@/components/layout/demo-banner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Check, X } from 'lucide-react';

export default function TeamSettingsPage() {
  const permissions = [
    { name: 'View Dashboard & CRM Pipeline', admin: true, manager: true, member: true },
    { name: 'Run Lead Discovery & CSV Import', admin: true, manager: true, member: true },
    { name: 'Run AI Intelligence & Research', admin: true, manager: true, member: true },
    { name: 'Generate Commercial Proposals', admin: true, manager: true, member: false },
    { name: 'Approve Outbound Outreach Drafts', admin: true, manager: true, member: false },
    { name: 'Toggle Global Sending Kill Switch', admin: true, manager: false, member: false },
    { name: 'Configure API Integrations & Keys', admin: true, manager: false, member: false },
    { name: 'Modify Compliance & Country Policies', admin: true, manager: false, member: false },
    { name: 'Modify / Delete Suppression Records', admin: true, manager: false, member: false },
  ];

  const team = [
    { name: 'Vikram Mehta', email: 'v.mehta@queenstownlabs.com', role: 'Administrator', status: 'Active' },
    { name: 'Eleanor Vance', email: 'e.vance@queenstownlabs.com', role: 'Sales Manager', status: 'Active' },
    { name: 'Siddharth Rao', email: 's.rao@queenstownlabs.com', role: 'Sales Member', status: 'Active' },
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
                className="text-slate-500 hover:text-slate-800 font-medium px-3"
              >
                API Integrations
              </Link>
              <Link
                href="/settings/team"
                className="font-bold text-slate-900 border-b-2 border-slate-900 pb-3 -mb-3"
              >
                Team &amp; Access Control
              </Link>
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Team &amp; Role-Based Access Control</h2>
            <p className="text-xs text-slate-500">
              Role permissions matrix governing sending authorization, compliance modifications, and credential access.
            </p>
          </div>

          {/* Team Members Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Authorized Team Members</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 text-xs">
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Member Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.map((m) => (
                      <tr key={m.email}>
                        <td className="p-3 font-semibold text-slate-900">{m.name}</td>
                        <td className="p-3 text-slate-600">{m.email}</td>
                        <td className="p-3">
                          <Badge variant={m.role === 'Administrator' ? 'high' : 'secondary'} className="text-[10px]">
                            {m.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-emerald-700 font-medium">✓ {m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* RBAC Permission Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Role-Based Access Control (RBAC) Matrix</CardTitle>
              <p className="text-xs text-slate-400">Enforced by Supabase Row Level Security and API route guards</p>
            </CardHeader>
            <CardContent className="pt-2 text-xs">
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">System Capability</th>
                      <th className="p-2.5 text-center">Administrator</th>
                      <th className="p-2.5 text-center">Sales Manager</th>
                      <th className="p-2.5 text-center">Sales Member</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {permissions.map((p) => (
                      <tr key={p.name}>
                        <td className="p-2.5 text-slate-800 font-medium">{p.name}</td>
                        <td className="p-2.5 text-center">
                          {p.admin ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="p-2.5 text-center">
                          {p.manager ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                        <td className="p-2.5 text-center">
                          {p.member ? <Check className="h-4 w-4 text-emerald-600 mx-auto" /> : <X className="h-4 w-4 text-slate-300 mx-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
