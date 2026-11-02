// Queenstown Lead Intelligence - Lead Discovery Search API Route

import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesDiscoveryProvider } from '@/lib/discovery/google-places';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { Company } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, country, city, industry, maxResults } = body;

    if (!keyword || !country) {
      return NextResponse.json(
        { error: 'Search keyword and country are mandatory parameters.' },
        { status: 400 }
      );
    }

    const provider = new GooglePlacesDiscoveryProvider();
    const discovered = await provider.search({
      keyword,
      country,
      city,
      industry,
      maxResults: Number(maxResults) || 10,
    });

    let newlyAddedCount = 0;
    const savedCompanies: Company[] = [];

    for (const item of discovered) {
      const companyRecord: Company = {
        id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: item.name,
        website: item.website || null,
        domain: item.domain || null,
        industry: item.industry || 'Logistics and Warehousing',
        country: item.country,
        city: item.city || null,
        address: item.address || null,
        description: item.description || null,
        discovery_source: item.discovery_source,
        source_url: item.source_url || null,
        external_provider_id: item.external_provider_id || null,
        discovery_date: new Date().toISOString(),
        research_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin
          .from('companies')
          .upsert(
            {
              name: companyRecord.name,
              website: companyRecord.website,
              domain: companyRecord.domain,
              industry: companyRecord.industry,
              country: companyRecord.country,
              city: companyRecord.city,
              address: companyRecord.address,
              description: companyRecord.description,
              discovery_source: companyRecord.discovery_source,
              source_url: companyRecord.source_url,
              external_provider_id: companyRecord.external_provider_id,
              research_status: 'pending',
            },
            { onConflict: 'discovery_source,external_provider_id' }
          )
          .select()
          .single();

        if (!error && data) {
          savedCompanies.push(data);
          newlyAddedCount++;
        }
      } else {
        // In-memory deduplication check
        const exists = memoryStore.companies.some(
          (c) =>
            (item.external_provider_id && c.external_provider_id === item.external_provider_id) ||
            (item.domain && c.domain === item.domain) ||
            c.name.toLowerCase() === item.name.toLowerCase()
        );

        if (!exists) {
          memoryStore.companies.unshift(companyRecord);
          savedCompanies.push(companyRecord);
          newlyAddedCount++;

          memoryStore.recordActivity({
            company_id: companyRecord.id,
            activity_type: 'lead_created',
            title: `Company Discovered: ${companyRecord.name}`,
            description: `Source: Google Places API | Country: ${companyRecord.country}`,
            metadata: { provider: 'google_places', keyword },
            created_by: 'system',
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      query: { keyword, country, city, industry },
      totalFound: discovered.length,
      newlyAddedCount,
      companies: savedCompanies.length > 0 ? savedCompanies : discovered,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
