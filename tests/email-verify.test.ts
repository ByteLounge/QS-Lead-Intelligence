// Unit tests for Free Native DNS MX Email Deliverability Verifier

import { describe, it, expect } from 'vitest';
import { verifyEmailDomain } from '@/lib/email/verify';

describe('Free Native DNS MX Email Verifier', () => {
  it('should validate deliverability for established domains (google.com)', async () => {
    const res = await verifyEmailDomain('test@google.com');
    expect(res.deliverable).toBe(true);
    expect(res.mxRecords).toBeDefined();
    expect(res.mxRecords!.length).toBeGreaterThan(0);
  });

  it('should reject invalid email syntax', async () => {
    const res = await verifyEmailDomain('not-an-email');
    expect(res.deliverable).toBe(false);
    expect(res.reason).toContain('syntax');
  });

  it('should reject fake non-existent domains', async () => {
    const res = await verifyEmailDomain('fake@thisdomaindoesnotexistanywhereinpublicdns998877.com');
    expect(res.deliverable).toBe(false);
    expect(res.reason).toBeDefined();
  });
});
