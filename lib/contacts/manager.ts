// Queenstown Lead Intelligence - Contact Management & Normalization

import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';
import { memoryStore } from '../data/store';

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

export function extractEmailDomain(email: string): string {
  const norm = normalizeEmail(email);
  const parts = norm.split('@');
  return parts.length > 1 ? parts[1] : '';
}

/**
 * Check if an email or its domain is on the suppression list
 */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  const normEmail = normalizeEmail(email);
  const domain = extractEmailDomain(email);

  if (!isSupabaseConfigured()) {
    return memoryStore.suppressionList.some(
      (s) => s.normalized_email === normEmail || (s.domain && s.domain === domain)
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('suppression_list')
      .select('id')
      .or(`normalized_email.eq.${normEmail},domain.eq.${domain}`)
      .limit(1);

    if (error) {
      console.warn('Suppression check database query error, fallback to safe pattern check:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (err) {
    console.error('Failed to query suppression list:', err);
    return false;
  }
}

/**
 * Add an email to the suppression list
 */
export async function suppressContact(
  email: string,
  reason: 'unsubscribe' | 'bounce' | 'manual' | 'compliance_policy' | 'complaint',
  source: string = 'system'
): Promise<boolean> {
  const normEmail = normalizeEmail(email);
  const domain = extractEmailDomain(email);

  if (!isSupabaseConfigured()) {
    const exists = memoryStore.suppressionList.some((s) => s.normalized_email === normEmail);
    if (!exists) {
      memoryStore.suppressionList.unshift({
        id: `supp_${Date.now()}`,
        email: email.trim(),
        normalized_email: normEmail,
        domain: domain || null,
        reason,
        source,
        created_at: new Date().toISOString(),
      });
    }
    return true;
  }

  try {
    const { error } = await supabaseAdmin.from('suppression_list').upsert(
      {
        email: email.trim(),
        normalized_email: normEmail,
        domain: domain || null,
        reason,
        source,
      },
      { onConflict: 'normalized_email' }
    );

    if (error) {
      console.error('Error inserting suppression record:', error);
      return false;
    }

    // Also cancel all pending follow-ups for this contact
    await supabaseAdmin
      .from('outreach_messages')
      .update({
        status: 'suppressed',
        error_message: `Contact suppressed due to: ${reason}`,
      })
      .eq('contact_id', normEmail);

    return true;
  } catch (err) {
    console.error('Suppression execution error:', err);
    return false;
  }
}
