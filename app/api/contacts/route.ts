// Queenstown Lead Intelligence - Contacts API Route

import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/data/store';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { normalizeEmail, isValidEmailFormat, isEmailSuppressed } from '@/lib/contacts/manager';
import { Contact } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from('contacts')
        .select('*, company:companies(*)', { count: 'exact' });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      if (status) {
        query = query.eq('verification_status', status);
      }
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      query = query.order('created_at', { ascending: false });
      const { data, count, error } = await query;
      if (error) throw error;
      return NextResponse.json({ contacts: data || [], total: count || 0 });
    }

    let filtered = memoryStore.contacts;
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.full_name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          (c.job_title && c.job_title.toLowerCase().includes(search))
      );
    }
    if (status) {
      filtered = filtered.filter((c) => c.verification_status === status);
    }
    if (companyId) {
      filtered = filtered.filter((c) => c.company_id === companyId);
    }

    return NextResponse.json({ contacts: filtered, total: filtered.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company_id, full_name, email, job_title, country, source_type } = body;

    if (!company_id || !full_name || !email) {
      return NextResponse.json(
        { error: 'Company ID, Full Name, and Email are mandatory fields.' },
        { status: 400 }
      );
    }

    if (!isValidEmailFormat(email)) {
      return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
    }

    const normEmail = normalizeEmail(email);
    const isSuppressed = await isEmailSuppressed(normEmail);

    const newContact: Contact = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      company_id,
      full_name: full_name.trim(),
      email: email.trim(),
      normalized_email: normEmail,
      job_title: job_title ? job_title.trim() : null,
      country: country || null,
      source_type: source_type || 'manual',
      verification_status: 'valid',
      marketing_eligibility_status: isSuppressed ? 'suppressed' : 'eligible',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('contacts')
        .upsert(
          {
            company_id: newContact.company_id,
            full_name: newContact.full_name,
            email: newContact.email,
            normalized_email: newContact.normalized_email,
            job_title: newContact.job_title,
            country: newContact.country,
            source_type: newContact.source_type,
            verification_status: newContact.verification_status,
            marketing_eligibility_status: newContact.marketing_eligibility_status,
          },
          { onConflict: 'normalized_email' }
        )
        .select('*, company:companies(*)')
        .single();

      if (error) throw error;
      return NextResponse.json({ contact: data }, { status: 201 });
    }

    // In-memory check
    const existingIdx = memoryStore.contacts.findIndex(
      (c) => c.normalized_email === newContact.normalized_email
    );
    if (existingIdx !== -1) {
      memoryStore.contacts[existingIdx] = { ...memoryStore.contacts[existingIdx], ...newContact };
      return NextResponse.json({ contact: memoryStore.contacts[existingIdx] });
    }

    memoryStore.contacts.unshift(newContact);
    memoryStore.recordActivity({
      company_id,
      activity_type: 'contact_added',
      title: `Contact Added: ${newContact.full_name}`,
      description: `${newContact.job_title || 'Lead'} <${newContact.email}>`,
      metadata: { email: newContact.email },
      created_by: 'user',
    });

    return NextResponse.json({ contact: newContact }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
