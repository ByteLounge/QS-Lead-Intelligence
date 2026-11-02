'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  Kanban,
  Megaphone,
  MailCheck,
  Inbox,
  History,
  BarChart3,
  Cpu,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  pendingApprovalsCount?: number;
}

export function Sidebar({ pendingApprovalsCount = 1 }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads & Discovery', href: '/leads', icon: Target },
    { name: 'Companies', href: '/companies', icon: Building2 },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'CRM Pipeline', href: '/opportunities', icon: Kanban },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    {
      name: 'Email Approvals',
      href: '/email-approvals',
      icon: MailCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    { name: 'Inbox & Replies', href: '/inbox', icon: Inbox },
    { name: 'Activity Log', href: '/activities', icon: History },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'n8n Automations', href: '/automations', icon: Cpu },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center text-white font-bold text-xs">
            Q
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-slate-900 uppercase">
              Queenstown Labs
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Lead Intelligence Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Core Platform
        </div>
        {navigation.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Outreach & Relations
        </div>
        {navigation.slice(5, 8).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          System & Telemetry
        </div>
        {navigation.slice(8).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Compliance Guardrail Badge */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <Link
          href="/settings/compliance"
          className="flex items-center justify-between p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-700 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-medium">Safeguards Active</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </Link>
      </div>
    </aside>
  );
}
