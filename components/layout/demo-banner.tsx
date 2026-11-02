'use client';

import { AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface DemoBannerProps {
  isDemoMode: boolean;
}

export function DemoBanner({ isDemoMode }: DemoBannerProps) {
  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex items-center justify-between text-amber-900">
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <div>
          <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-200/80 text-amber-800 px-1.5 py-0.5 rounded mr-2">
            SIMULATED DEMO ENVIRONMENT
          </span>
          <span>
            Database credentials are not yet populated in <code>.env.local</code>. Displaying clearly labelled mock records for interface verification.
          </span>
        </div>
      </div>
      <Link
        href="/settings/integrations"
        className="flex items-center space-x-1 font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 ml-4 flex-shrink-0"
      >
        <span>Configure Supabase</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
