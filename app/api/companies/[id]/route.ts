// Queenstown Lead Intelligence - Single Company API Handler

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (isSupabaseConfigured()) {
      const { data: company, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const [leadsRes, contactsRes] = await Promise.all([
        supabaseAdmin.from('leads').select('*').eq('company_id', id),
        supabaseAdmin.from('contacts').select('*').eq('company_id', id),
      ]);

      return NextResponse.json({
        company,
        leads: leadsRes.data || [],
        contacts: contactsRes.data || [],
      });
    }

    const company = memoryStore.getCompanyById(id);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const leads = memoryStore.leads.filter((l) => l.company_id === id);
    const contacts = memoryStore.contacts.filter((c) => c.company_id === id);

    return NextResponse.json({ company, leads, contacts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updates = await req.json();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('companies')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ company: data });
    }

    const idx = memoryStore.companies.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    memoryStore.companies[idx] = {
      ...memoryStore.companies[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ company: memoryStore.companies[idx] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
