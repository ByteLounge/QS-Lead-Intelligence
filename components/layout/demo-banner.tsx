'use client';

import { AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface DemoBannerProps {
  isDemoMode: boolean;
}

export function DemoBanner({ isDemoMode }: DemoBannerProps) {
  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-2.5 text-xs flex items-center justify-between text-amber-900 backdrop-blur-sm">
      <div className="flex items-center space-x-2.5">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <div>
          <span className="font-mono uppercase tracking-wider text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full mr-2 font-medium">
            SIMULATED DEMO ENVIRONMENT
          </span>
          <span className="text-[#555555]">
            Database credentials are not yet populated in <code>.env.local</code>. Displaying simulated records for interface verification.
          </span>
        </div>
      </div>
      <Link
        href="/settings/integrations"
        className="flex items-center space-x-1 font-medium text-amber-900 hover:text-[#111111] underline underline-offset-4 ml-4 flex-shrink-0 transition-colors"
      >
        <span>Configure Supabase</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
