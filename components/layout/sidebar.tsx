'use client';

import * as React from 'react';
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
  Settings,
  ShieldCheck,
  Bot,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { QueenstownMark } from '@/components/brand/logo';
import { useMobileNav } from './mobile-nav-context';

interface SidebarProps {
  pendingApprovalsCount?: number;
}

export function Sidebar({ pendingApprovalsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNav();

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
    { name: 'Autopilot Engine', href: '/automations', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const renderNavContent = (isMobile = false) => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#e8e8e8] flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={() => isMobile && close()}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center p-1.5 shadow-[0_1px_2px_rgba(17,17,17,0.1)] group-hover:scale-[1.03] transition-transform">
            <QueenstownMark size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold tracking-tight text-[#111111] font-display">
                Queenstown Labs
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-[#777777] font-mono tracking-wide">
              Lead Intelligence · Studio
            </p>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#f0f0f0] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3.5 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9a9a9a]">
          Core Intelligence
        </div>
        {navigation.slice(0, 5).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && close()}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#111111] text-white shadow-[0_1px_2px_rgba(17,17,17,0.12)]'
                  : 'text-[#555555] hover:text-[#111111] hover:bg-[#f6f6f6]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-white' : 'text-[#888888]'
                  }`}
                />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9a9a9a]">
          Outreach &amp; Relations
        </div>
        {navigation.slice(5, 8).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && close()}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#111111] text-white shadow-[0_1px_2px_rgba(17,17,17,0.12)]'
                  : 'text-[#555555] hover:text-[#111111] hover:bg-[#f6f6f6]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-white' : 'text-[#888888]'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#9a9a9a]">
          Autonomous Telemetry
        </div>
        {navigation.slice(8).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && close()}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#111111] text-white shadow-[0_1px_2px_rgba(17,17,17,0.12)]'
                  : 'text-[#555555] hover:text-[#111111] hover:bg-[#f6f6f6]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-white' : 'text-[#888888]'
                  }`}
                />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Autopilot Status & Safeguards */}
      <div className="p-3.5 border-t border-[#e8e8e8] space-y-2 bg-[#fafafa]">
        <div className="p-2.5 rounded-xl border border-[#e8e8e8] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#111111] flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Autopilot Active
            </span>
            <span className="text-[9px] font-mono text-[#888888] uppercase">
              24/7
            </span>
          </div>
          <p className="text-[10px] text-[#777777] mt-1 leading-snug">
            Vercel Serverless &amp; Gemini 3.1 Dispatched
          </p>
        </div>

        <Link
          href="/settings/compliance"
          onClick={() => isMobile && close()}
          className="flex items-center justify-between p-2 rounded-xl border border-[#e8e8e8] bg-white hover:bg-[#fafafa] text-[11px] text-[#555555] hover:text-[#111111] transition-colors"
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-medium text-[11px]">Guardrails Online</span>
          </div>
          <ArrowUpRight className="h-3 w-3 text-[#aaaaaa]" />
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar (Hidden on Mobile/Tablet < lg) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#e8e8e8] flex-col flex-shrink-0 min-h-screen select-none sticky top-0 h-screen">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer & Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 border-r border-[#e8e8e8] transform transition-transform duration-200 ease-in-out">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
