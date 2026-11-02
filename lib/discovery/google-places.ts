// Queenstown Lead Intelligence - Google Places Discovery Provider

import { IDiscoveryProvider, DiscoverySearchParams, DiscoveredCompanyInput, extractDomainFromUrl } from './provider';

interface GooglePlaceItem {
  place_id: string;
  name: string;
  formatted_address?: string;
  types?: string[];
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

export class GooglePlacesDiscoveryProvider implements IDiscoveryProvider {
  name = 'Google Places API';
  sourceType = 'google_places' as const;

  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_PLACES_API_KEY || '';
  }

  async search(params: DiscoverySearchParams): Promise<DiscoveredCompanyInput[]> {
    const query = `${params.keyword} in ${params.city || ''} ${params.country}`.trim();

    if (!this.apiKey) {
      // Clean fallback if Google Places API key not configured yet
      return [
        {
          name: `${params.city || params.country} Apex Freight & Warehousing`,
          website: 'https://apexfreight-demo.com',
          domain: 'apexfreight-demo.com',
          industry: params.industry || 'Logistics and Warehousing',
          country: params.country,
          city: params.city || 'Bengaluru',
          address: `Plot 42, Logistics Park, ${params.city || 'Industrial Zone'}, ${params.country}`,
          description: 'Freight forwarding, bonded container logistics, and temperature-controlled distribution.',
          discovery_source: 'google_places',
          source_url: 'https://maps.google.com/?cid=1001',
          external_provider_id: 'place_id_demo_01',
        },
        {
          name: `TransGlobal FMCG Distributors ${params.country}`,
          website: 'https://transglobalfmcg-demo.com',
          domain: 'transglobalfmcg-demo.com',
          industry: 'FMCG distributors and wholesalers',
          country: params.country,
          city: params.city || 'Bengaluru',
          address: `Sector 7, Wholesale Trade Center, ${params.city || 'Main Hub'}, ${params.country}`,
          description: 'Multi-brand wholesale consumer goods distributor managing 450+ retail storefront supply lines.',
          discovery_source: 'google_places',
          source_url: 'https://maps.google.com/?cid=1002',
          external_provider_id: 'place_id_demo_02',
        },
        {
          name: `Horizon Cargo Express`,
          website: 'https://horizoncargo-demo.com',
          domain: 'horizoncargo-demo.com',
          industry: 'Logistics and Warehousing',
          country: params.country,
          city: params.city || 'Bengaluru',
          address: `Gateway Airport Cargo Village, ${params.city || 'Cargo Center'}, ${params.country}`,
          description: 'Air cargo consolidation and express overland dispatch operations.',
          discovery_source: 'google_places',
          source_url: 'https://maps.google.com/?cid=1003',
          external_provider_id: 'place_id_demo_03',
        },
      ];
    }

    const endpoint = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    endpoint.searchParams.set('query', query);
    endpoint.searchParams.set('key', this.apiKey);

    const res = await fetch(endpoint.toString());
    if (!res.ok) {
      throw new Error(`Google Places API returned status ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const results: GooglePlaceItem[] = data.results || [];
    const limit = params.maxResults || 10;

    return results.slice(0, limit).map((place) => {
      const website = place.website || null;
      return {
        name: place.name,
        website,
        domain: extractDomainFromUrl(website),
        industry: params.industry || 'Logistics and Warehousing',
        country: params.country,
        city: params.city || null,
        address: place.formatted_address || null,
        description: place.types ? place.types.join(', ') : 'Commercial Enterprise',
        discovery_source: 'google_places',
        source_url: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        external_provider_id: place.place_id,
      };
    });
  }
}
