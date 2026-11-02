// Queenstown Lead Intelligence - Discovery Provider Abstraction

import { DiscoverySource } from '../types';

export interface DiscoverySearchParams {
  keyword: string;
  country: string;
  city?: string;
  industry?: string;
  maxResults?: number;
}

export interface DiscoveredCompanyInput {
  name: string;
  website?: string | null;
  domain?: string | null;
  industry?: string | null;
  country: string;
  city?: string | null;
  address?: string | null;
  description?: string | null;
  discovery_source: DiscoverySource;
  source_url?: string | null;
  external_provider_id?: string | null;
}

export interface IDiscoveryProvider {
  name: string;
  sourceType: DiscoverySource;
  search(params: DiscoverySearchParams): Promise<DiscoveredCompanyInput[]>;
}

export function extractDomainFromUrl(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const cleaned = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
    const parsed = new URL(cleaned);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}
