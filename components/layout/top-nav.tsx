'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Database, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavProps {
  sendingEnabled?: boolean;
  isDemoMode?: boolean;
  onOpenDiscovery?: () => void;
  onOpenNewLead?: () => void;
}

export function TopNav({
  sendingEnabled = false,
  isDemoMode = false,
  onOpenDiscovery,
  onOpenNewLead,
}: TopNavProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
      {/* Left System Status Pills */}
      <div className="flex items-center space-x-3">
        {/* Global Sending Switch Status */}
        <Link
          href="/settings/compliance"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
            sendingEnabled
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
          title="Click to manage global sending kill switch"
        >
          {sendingEnabled ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>SENDING: ACTIVE</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span>KILL SWITCH: SENDING BLOCKED</span>
            </>
          )}
        </Link>

        {/* Database Status Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700">
          <Database className="h-3.5 w-3.5 text-slate-500" />
          <span>{isDemoMode ? 'Store: Local Demo Cache' : 'PostgreSQL: Connected'}</span>
        </div>
      </div>

      {/* Right Actions & Operator Badge */}
      <div className="flex items-center space-x-3">
        {onOpenDiscovery && (
          <Button variant="outline" size="sm" onClick={onOpenDiscovery} className="h-8 gap-1.5 text-xs">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>Discover Leads</span>
          </Button>
        )}

        {onOpenNewLead && (
          <Button size="sm" onClick={onOpenNewLead} className="h-8 gap-1.5 text-xs bg-slate-900 text-white">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Company</span>
          </Button>
        )}

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
            QL
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-none">Admin</p>
            <p className="text-[10px] text-slate-400">Queenstown Labs</p>
          </div>
        </div>
      </div>
    </header>
  );
}
