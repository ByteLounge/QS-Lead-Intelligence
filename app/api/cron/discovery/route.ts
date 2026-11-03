// Queenstown Lead Intelligence - Vercel Autopilot: Autonomous Discovery & Intelligence Cron
// Runs on schedule: Daily at 06:00 AM UTC (0 6 * * *)

import { NextRequest } from 'next/server';
import { handleAutopilotDiscovery } from '@/lib/discovery/autopilot';

export const maxDuration = 60; // Max execution time on Vercel
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutopilotDiscovery(req);
}

export async function POST(req: NextRequest) {
  return handleAutopilotDiscovery(req);
}
