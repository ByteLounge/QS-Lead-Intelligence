import { describe, it, expect } from 'vitest';
import {
  DEFAULT_COMPLIANCE_SETTINGS,
  DEFAULT_COUNTRY_POLICIES,
  evaluateSendingEligibility,
} from '@/lib/compliance/safeguards';

describe('Sending Safeguards & Compliance Policies', () => {
  it('should have sending disabled by default (Hard Kill Switch)', () => {
    expect(DEFAULT_COMPLIANCE_SETTINGS.sending_enabled).toBe(false);
    expect(DEFAULT_COMPLIANCE_SETTINGS.human_approval_required).toBe(true);
    expect(DEFAULT_COMPLIANCE_SETTINGS.daily_email_limit).toBe(5);
    expect(DEFAULT_COMPLIANCE_SETTINGS.minimum_lead_score).toBe(80);
    expect(DEFAULT_COMPLIANCE_SETTINGS.max_followups).toBe(2);
  });

  it('should block sending when kill switch is engaged', async () => {
    const eligibility = await evaluateSendingEligibility();
    // Default system settings has sending_enabled = false
    expect(eligibility.eligible).toBe(false);
    expect(eligibility.reason).toContain('kill switch');
  });

  it('should have verified country policies for target regions', () => {
    const countries = ['India', 'United Kingdom', 'Australia', 'Singapore', 'United Arab Emirates'];
    countries.forEach((country) => {
      const policy = DEFAULT_COUNTRY_POLICIES[country];
      expect(policy).toBeDefined();
      expect(policy.mandatory_unsubscribe).toBe(true);
      expect(policy.b2b_exemption).toBe(true);
    });
  });
});
