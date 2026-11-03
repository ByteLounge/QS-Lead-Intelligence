'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Database, Plus, Search, MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileNav } from './mobile-nav-context';

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
  const [time, setTime] = React.useState<string>('');
  const { toggle } = useMobileNav();

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 glass sticky top-0 border-b border-[#e8e8e8] px-3 sm:px-6 flex items-center justify-between z-20 transition-all select-none">
      {/* Left: Mobile Hamburger & System Status Pills */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Mobile Hamburger Toggle (Visible on < lg screens) */}
        <button
          onClick={toggle}
          className="lg:hidden p-1.5 -ml-1 rounded-xl text-[#444444] hover:text-[#111111] hover:bg-[#f0f0f0] transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Sending Switch Status */}
        <Link
          href="/settings/compliance"
          className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border transition-all ${
            sendingEnabled
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 shadow-[0_1px_2px_rgba(16,185,129,0.06)]'
              : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100 shadow-[0_1px_2px_rgba(244,63,94,0.06)]'
          }`}
          title="Click to manage global sending kill switch"
        >
          {sendingEnabled ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xs:inline">SENDING: ACTIVE</span>
              <span className="xs:hidden">ACTIVE</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span className="hidden xs:inline">KILL SWITCH: BLOCKED</span>
              <span className="xs:hidden">BLOCKED</span>
            </>
          )}
        </Link>

        {/* Database Status Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-[#e8e8e8] bg-white text-[#555555] shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <Database className="h-3.5 w-3.5 text-[#888888]" />
          <span>{isDemoMode ? 'Store: Demo Cache' : 'Supabase: Connected'}</span>
        </div>

        {/* Studio Location Time */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-[#666666] border border-[#e8e8e8] bg-white/70">
          <MapPin className="h-3 w-3 text-[#999999]" />
          <span>Goa, India {time ? `· ${time} IST` : ''}</span>
        </div>
      </div>

      {/* Right Actions & Operator Badge */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5">
        {onOpenDiscovery && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDiscovery}
            className="h-8 px-2.5 sm:px-3 gap-1 text-xs rounded-full border-[#e8e8e8] bg-white hover:bg-[#fafafa]"
          >
            <Search className="h-3.5 w-3.5 text-[#666666]" />
            <span className="hidden sm:inline">Discover Leads</span>
          </Button>
        )}

        {onOpenNewLead && (
          <Button
            size="sm"
            onClick={onOpenNewLead}
            className="h-8 px-2.5 sm:px-3 gap-1 text-xs rounded-full bg-[#111111] hover:bg-[#262626] text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Target</span>
          </Button>
        )}

        <div className="h-4 w-[1px] bg-[#e8e8e8] mx-0.5 sm:mx-1" />

        <div className="flex items-center space-x-2 pl-0.5 sm:pl-1">
          <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[10px] tracking-tight">
            QL
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-semibold text-[#111111] leading-none font-display">Studio Admin</p>
            <p className="text-[10px] text-[#888888] font-mono">Queenstown Labs</p>
          </div>
        </div>
      </div>
    </header>
  );
}
