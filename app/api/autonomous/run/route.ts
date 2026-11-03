// Queenstown Lead Intelligence - On-Demand Autonomous AI Lead Generation & Outreach Engine
// Triggers discovery of companies needing apps/websites, AI qualification,
// email drafting/dispatch, and Discord notification updates.

import { NextRequest } from 'next/server';
import { handleAutopilotDiscovery } from '@/lib/discovery/autopilot';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleAutopilotDiscovery(req);
}

export async function POST(req: NextRequest) {
  return handleAutopilotDiscovery(req);
}
