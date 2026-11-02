// Queenstown Lead Intelligence - CSV Import API Route

import { NextRequest, NextResponse } from 'next/server';
import { parseCompaniesCsv } from '@/lib/discovery/csv-importer';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { Company } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const csvContent = body.csvContent;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: 'Missing csvContent parameter.' }, { status: 400 });
    }

    const { validCompanies, errors, totalParsed } = parseCompaniesCsv(csvContent);

    let newlyAddedCount = 0;
    const importedCompanies: Company[] = [];

    for (const item of validCompanies) {
      const companyRecord: Company = {
        id: `comp_csv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        website: item.website || null,
        domain: item.domain || null,
        industry: item.industry || 'Logistics and Warehousing',
        country: item.country,
        city: item.city || null,
        address: item.address || null,
        description: item.description || null,
        discovery_source: 'csv_import',
        source_url: null,
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
              discovery_source: 'csv_import',
              external_provider_id: companyRecord.external_provider_id,
              research_status: 'pending',
            },
            { onConflict: 'discovery_source,external_provider_id' }
          )
          .select()
          .single();

        if (!error && data) {
          importedCompanies.push(data);
          newlyAddedCount++;
        }
      } else {
        const exists = memoryStore.companies.some(
          (c) =>
            (item.domain && c.domain === item.domain) ||
            c.name.toLowerCase() === item.name.toLowerCase()
        );

        if (!exists) {
          memoryStore.companies.unshift(companyRecord);
          importedCompanies.push(companyRecord);
          newlyAddedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalParsed,
      newlyAddedCount,
      errors,
      companies: importedCompanies,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
