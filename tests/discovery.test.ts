import { describe, it, expect } from 'vitest';
import { extractDomainFromUrl } from '@/lib/discovery/provider';
import { GooglePlacesDiscoveryProvider } from '@/lib/discovery/google-places';
import { parseCompaniesCsv } from '@/lib/discovery/csv-importer';

describe('Lead Discovery & CSV Normalization', () => {
  it('should extract domains cleanly from diverse URL formats', () => {
    expect(extractDomainFromUrl('https://www.apexfreight.com/about')).toBe('apexfreight.com');
    expect(extractDomainFromUrl('http://logistics-hub.in')).toBe('logistics-hub.in');
    expect(extractDomainFromUrl('warehouse.sg/services/wms')).toBe('warehouse.sg');
    expect(extractDomainFromUrl(null)).toBe(null);
  });

  it('should return discovered companies from Google Places Provider', async () => {
    const provider = new GooglePlacesDiscoveryProvider();
    const results = await provider.search({
      keyword: 'cold chain warehouse',
      country: 'India',
      city: 'Bengaluru',
      industry: 'Logistics and Warehousing',
      maxResults: 5,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBeDefined();
    expect(results[0].discovery_source).toBe('google_places');
    expect(results[0].country).toBe('India');
  });

  it('should parse and deduplicate CSV company uploads', () => {
    const sampleCsv = `company_name,website,industry,country,city,description
Apex Freight Ltd,https://apexfreight.demo,Logistics,India,Bengaluru,Regional 3PL
TransGlobal Cargo,https://transglobal.demo,Logistics,UAE,Dubai,Air cargo forwarder
,https://missing-name.demo,Logistics,India,Mumbai,Invalid row without name`;

    const parsed = parseCompaniesCsv(sampleCsv);
    expect(parsed.validCompanies.length).toBe(2);
    expect(parsed.errors.length).toBe(1); // One missing name row
    expect(parsed.validCompanies[0].name).toBe('Apex Freight Ltd');
    expect(parsed.validCompanies[0].domain).toBe('apexfreight.demo');
    expect(parsed.validCompanies[1].country).toBe('UAE');
  });
});
