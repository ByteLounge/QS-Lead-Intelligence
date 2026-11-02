// Queenstown Lead Intelligence - Sending Safeguards & Compliance Engine

import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';
import { ComplianceSettings, CountryPolicy } from '../types';

export const DEFAULT_COMPLIANCE_SETTINGS: ComplianceSettings = {
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
};

// In-memory compliance state for offline/demo environment
let localComplianceState: ComplianceSettings = { ...DEFAULT_COMPLIANCE_SETTINGS };

export const DEFAULT_COUNTRY_POLICIES: Record<string, CountryPolicy> = {
  India: {
    allowed: true,
    requires_explicit_opt_in: false,
    b2b_exemption: true,
    mandatory_unsubscribe: true,
    notes: 'B2B commercial outreach allowed with accurate sender identity and clear opt-out.',
  },
  'United Kingdom': {
    allowed: true,
    requires_explicit_opt_in: false,
    b2b_exemption: true,
    mandatory_unsubscribe: true,
    notes: 'PECR rules allow B2B outreach to corporate bodies (Ltd, PLC, LLP) with immediate opt-out.',
  },
  Australia: {
    allowed: true,
    requires_explicit_opt_in: false,
    b2b_exemption: true,
    mandatory_unsubscribe: true,
    notes: 'Spam Act 2003 allows contact if email is publicly published and relevant to recipient role.',
  },
  Singapore: {
    allowed: true,
    requires_explicit_opt_in: false,
    b2b_exemption: true,
    mandatory_unsubscribe: true,
    notes: 'PDPA B2B exclusion applies for business contact info for commercial purposes.',
  },
  'United Arab Emirates': {
    allowed: true,
    requires_explicit_opt_in: false,
    b2b_exemption: true,
    mandatory_unsubscribe: true,
    notes: 'Commercial electronic messages require identifiable sender and functional unsubscribe.',
  },
};

export async function getComplianceSettings(): Promise<ComplianceSettings> {
  if (!isSupabaseConfigured()) {
    return localComplianceState;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'compliance_settings')
      .single();

    if (error || !data) {
      return localComplianceState;
    }
    return { ...DEFAULT_COMPLIANCE_SETTINGS, ...data.value };
  } catch {
    return localComplianceState;
  }
}

export async function updateComplianceSettings(
  settings: Partial<ComplianceSettings>
): Promise<ComplianceSettings> {
  const current = await getComplianceSettings();
  const updated = { ...current, ...settings };
  localComplianceState = updated;

  if (isSupabaseConfigured()) {
    await supabaseAdmin.from('system_settings').upsert({
      key: 'compliance_settings',
      value: updated,
      updated_at: new Date().toISOString(),
    });
  }

  return updated;
}

export async function evaluateSendingEligibility(): Promise<{
  eligible: boolean;
  reason?: string;
  dailySentCount: number;
  dailyLimit: number;
}> {
  const settings = await getComplianceSettings();

  // 1. Hard Kill Switch Check
  if (!settings.sending_enabled) {
    return {
      eligible: false,
      reason: 'Global SENDING_ENABLED kill switch is active (disabled).',
      dailySentCount: 0,
      dailyLimit: settings.daily_email_limit,
    };
  }

  // 2. Daily Volume Check
  if (!isSupabaseConfigured()) {
    return {
      eligible: true,
      dailySentCount: 0,
      dailyLimit: settings.daily_email_limit,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count, error } = await supabaseAdmin
    .from('outreach_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', today.toISOString());

  const dailySent = error || count === null ? 0 : count;

  if (dailySent >= settings.daily_email_limit) {
    return {
      eligible: false,
      reason: `Daily sending limit reached (${dailySent}/${settings.daily_email_limit} sent today).`,
      dailySentCount: dailySent,
      dailyLimit: settings.daily_email_limit,
    };
  }

  return {
    eligible: true,
    dailySentCount: dailySent,
    dailyLimit: settings.daily_email_limit,
  };
}

export function detectOptOutKeywords(text: string): boolean {
  const optOutPattern =
    /\b(unsubscribe|remove\s+me|stop\s+emailing|opt\s*out|take\s+me\s+off|please\s+suppress)\b/i;
  return optOutPattern.test(text);
}
