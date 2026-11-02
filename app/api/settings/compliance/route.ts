// Queenstown Lead Intelligence - Compliance Settings API Route

import { NextRequest, NextResponse } from 'next/server';
import {
  getComplianceSettings,
  updateComplianceSettings,
  DEFAULT_COUNTRY_POLICIES,
} from '@/lib/compliance/safeguards';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  try {
    const compliance = await getComplianceSettings();

    let countryPolicies = DEFAULT_COUNTRY_POLICIES;
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'country_marketing_policies')
        .single();
      if (data?.value) {
        countryPolicies = data.value;
      }
    }

    return NextResponse.json({
      compliance,
      countryPolicies,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { compliance, countryPolicies } = body;

    let updatedCompliance = null;
    if (compliance) {
      updatedCompliance = await updateComplianceSettings(compliance);
    }

    if (countryPolicies && isSupabaseConfigured()) {
      await supabaseAdmin.from('system_settings').upsert({
        key: 'country_marketing_policies',
        value: countryPolicies,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      compliance: updatedCompliance || (await getComplianceSettings()),
      countryPolicies: countryPolicies || DEFAULT_COUNTRY_POLICIES,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
