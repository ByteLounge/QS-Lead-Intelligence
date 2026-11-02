// Queenstown Lead Intelligence - Companies API Handler

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { extractDomainFromUrl } from '@/lib/discovery/provider';
import { Company } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const country = searchParams.get('country') || '';
    const industry = searchParams.get('industry') || '';
    const status = searchParams.get('status') || '';

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin.from('companies').select('*', { count: 'exact' });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (country) {
        query = query.eq('country', country);
      }
      if (industry) {
        query = query.eq('industry', industry);
      }
      if (status) {
        query = query.eq('research_status', status);
      }

      query = query.order('created_at', { ascending: false });
      const { data, count, error } = await query;

      if (error) throw error;
      return NextResponse.json({ companies: data || [], total: count || 0 });
    }

    // Memory Store filter
    let filtered = memoryStore.companies;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          (c.city && c.city.toLowerCase().includes(search)) ||
          (c.description && c.description.toLowerCase().includes(search))
      );
    }
    if (country) {
      filtered = filtered.filter((c) => c.country.toLowerCase() === country.toLowerCase());
    }
    if (industry) {
      filtered = filtered.filter((c) => c.industry === industry);
    }
    if (status) {
      filtered = filtered.filter((c) => c.research_status === status);
    }

    return NextResponse.json({
      companies: filtered,
      total: filtered.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, website, industry, country, city, address, description } = body;

    if (!name || !country) {
      return NextResponse.json(
        { error: 'Company name and country are required.' },
        { status: 400 }
      );
    }

    const domain = extractDomainFromUrl(website);

    const newCompany: Company = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      website: website ? website.trim() : null,
      domain,
      industry: industry || 'Logistics and Warehousing',
      country: country.trim(),
      city: city ? city.trim() : null,
      address: address ? address.trim() : null,
      description: description ? description.trim() : null,
      discovery_source: 'manual',
      source_url: null,
      external_provider_id: `manual_${Date.now()}`,
      discovery_date: new Date().toISOString(),
      research_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .insert(newCompany)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ company: data }, { status: 201 });
    }

    memoryStore.companies.unshift(newCompany);
    memoryStore.recordActivity({
      company_id: newCompany.id,
      activity_type: 'lead_created',
      title: `Company Created: ${newCompany.name}`,
      description: `Manual entry by user. Location: ${newCompany.city || newCompany.country}`,
      metadata: { source: 'manual' },
      created_by: 'user',
    });

    return NextResponse.json({ company: newCompany }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
