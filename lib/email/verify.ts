// Queenstown Lead Intelligence - Free Native DNS MX Email Verifier
// Verifies whether a domain actually has active mail servers before sending to eliminate bounces.
// 100% Free - uses native Node.js DNS resolution with zero third-party API dependencies.

import dns from 'dns';

export interface EmailVerificationResult {
  deliverable: boolean;
  mxRecords?: string[];
  reason?: string;
}

// Configured DNS resolver with fallback to high-reliability public resolvers (Google / Cloudflare)
const resolver = new dns.promises.Resolver();
try {
  const currentServers = dns.getServers();
  if (!currentServers || currentServers.length === 0 || currentServers.every((s) => s.startsWith('127.'))) {
    resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch {
  try {
    resolver.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore fallback configuration errors
  }
}

export async function verifyEmailDomain(email: string): Promise<EmailVerificationResult> {
  try {
    if (!email || !email.includes('@')) {
      return { deliverable: false, reason: 'Invalid email syntax' };
    }

    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) {
      return { deliverable: false, reason: 'Missing email domain' };
    }

    // Resolve MX records via DNS Resolver
    let records: dns.MxRecord[] = [];
    try {
      records = await resolver.resolveMx(domain);
    } catch (err: unknown) {
      const code = (err as any)?.code;
      if (code === 'ECONNREFUSED' || code === 'SERVFAIL') {
        resolver.setServers(['8.8.8.8', '1.1.1.1']);
        records = await resolver.resolveMx(domain);
      } else {
        throw err;
      }
    }

    if (!records || records.length === 0) {
      return { deliverable: false, reason: `Domain "${domain}" has no active mail exchange (MX) servers.` };
    }

    // Sort by priority (lowest number = highest priority)
    records.sort((a, b) => a.priority - b.priority);

    return {
      deliverable: true,
      mxRecords: records.map((r) => r.exchange),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const code = (err as any)?.code;
    
    // ENOTFOUND or ENODATA means domain doesn't exist or has no mail server
    return {
      deliverable: false,
      reason: code === 'ENOTFOUND'
        ? `Domain does not exist in public DNS.`
        : code === 'ENODATA'
        ? `Domain exists but has no active MX records configured.`
        : `DNS MX check failed: ${message}`,
    };
  }
}
