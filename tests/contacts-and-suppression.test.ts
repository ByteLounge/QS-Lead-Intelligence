import { describe, it, expect } from 'vitest';
import {
  normalizeEmail,
  isValidEmailFormat,
  extractEmailDomain,
} from '@/lib/contacts/manager';
import { detectOptOutKeywords } from '@/lib/compliance/safeguards';

describe('Contacts Normalization & Suppression Logic', () => {
  it('should correctly normalize and trim email addresses', () => {
    expect(normalizeEmail('  John.Doe@Example.COM  ')).toBe('john.doe@example.com');
    expect(normalizeEmail('OPERATIONS@LOGISTICS.IN')).toBe('operations@logistics.in');
  });

  it('should validate email format accurately', () => {
    expect(isValidEmailFormat('user@company.com')).toBe(true);
    expect(isValidEmailFormat('lead.director@logistics-hub.co.uk')).toBe(true);
    expect(isValidEmailFormat('invalid-email-without-at')).toBe(false);
    expect(isValidEmailFormat('user@')).toBe(false);
    expect(isValidEmailFormat('@domain.com')).toBe(false);
  });

  it('should extract domains correctly', () => {
    expect(extractEmailDomain('ceo@queenstownlabs.com')).toBe('queenstownlabs.com');
    expect(extractEmailDomain('ops@sub.domain.co.uk')).toBe('sub.domain.co.uk');
  });

  it('should deterministically detect unsubscribe & opt-out keywords', () => {
    expect(detectOptOutKeywords('Please unsubscribe me from this list')).toBe(true);
    expect(detectOptOutKeywords('Remove me immediately')).toBe(true);
    expect(detectOptOutKeywords('Stop emailing our company')).toBe(true);
    expect(detectOptOutKeywords('I would like to opt out')).toBe(true);
    expect(detectOptOutKeywords('Please suppress this email address')).toBe(true);

    // False positives prevention
    expect(detectOptOutKeywords('We are looking forward to our meeting next week')).toBe(false);
    expect(detectOptOutKeywords('Please send over your software proposal and pricing')).toBe(false);
  });
});
