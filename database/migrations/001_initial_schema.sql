-- ============================================================================
-- QUEENSTOWN LEAD INTELLIGENCE - DATABASE INITIALIZATION & SCHEMA MIGRATION 001
-- Multi-table relational schema with Row Level Security, Indexes, and Constraints
-- ============================================================================

-- Enable pgcrypto / uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. COMPANIES TABLE
-- Discovered businesses with provenance, metadata, and intelligence state
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    website TEXT,
    domain TEXT,
    industry TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    city TEXT,
    address TEXT,
    description TEXT,
    discovery_source TEXT NOT NULL CHECK (discovery_source IN ('google_places', 'search_adapter', 'csv_import', 'manual')),
    source_url TEXT,
    external_provider_id TEXT,
    discovery_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    research_status TEXT NOT NULL DEFAULT 'pending' CHECK (research_status IN ('pending', 'in_progress', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_company_provider_source UNIQUE (discovery_source, external_provider_id)
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies (domain);
CREATE INDEX IF NOT EXISTS idx_companies_country ON public.companies (country);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies (industry);
CREATE INDEX IF NOT EXISTS idx_companies_research_status ON public.companies (research_status);

-- ----------------------------------------------------------------------------
-- 2. CONTACTS TABLE
-- Business points of contact with source provenance and verification state
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    normalized_email TEXT NOT NULL,
    job_title TEXT,
    country TEXT,
    source_url TEXT,
    source_type TEXT NOT NULL DEFAULT 'website' CHECK (source_type IN ('website', 'contact_page', 'manual', 'enrichment')),
    verification_status TEXT NOT NULL DEFAULT 'unknown' CHECK (verification_status IN ('unknown', 'pending', 'valid', 'invalid', 'risky')),
    marketing_eligibility_status TEXT NOT NULL DEFAULT 'pending' CHECK (marketing_eligibility_status IN ('pending', 'eligible', 'ineligible', 'suppressed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_contacts_normalized_email UNIQUE (normalized_email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts (company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_normalized_email ON public.contacts (normalized_email);
CREATE INDEX IF NOT EXISTS idx_contacts_verification_status ON public.contacts (verification_status);
CREATE INDEX IF NOT EXISTS idx_contacts_eligibility ON public.contacts (marketing_eligibility_status);

-- ----------------------------------------------------------------------------
-- 3. LEADS TABLE
-- Lead qualification, AI scoring, research summary and recommended solutions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    primary_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    qualification_score INTEGER NOT NULL DEFAULT 0 CHECK (qualification_score >= 0 AND qualification_score <= 100),
    qualification_level TEXT NOT NULL DEFAULT 'disqualified' CHECK (qualification_level IN ('high_priority', 'potential_prospect', 'low_priority', 'disqualified')),
    score_breakdown JSONB NOT NULL DEFAULT '{
        "industry_relevance": 0,
        "software_opportunity": 0,
        "business_suitability": 0,
        "evidence_quality": 0,
        "contact_reachability": 0
    }'::jsonb,
    score_override INTEGER CHECK (score_override >= 0 AND score_override <= 100),
    score_override_reason TEXT,
    research_summary TEXT,
    business_model TEXT,
    identified_opportunity TEXT,
    recommended_solution TEXT,
    confidence_level NUMERIC(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence_level >= 0.0 AND confidence_level <= 1.0),
    status TEXT NOT NULL DEFAULT 'discovered' CHECK (status IN (
        'discovered', 'researched', 'qualified', 'contact_identified',
        'outreach_drafted', 'contacted', 'interested', 'meeting_requested',
        'meeting_completed', 'proposal_sent', 'negotiation', 'won', 'lost'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads (company_id);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_level ON public.leads (qualification_level);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads (qualification_score DESC);

-- ----------------------------------------------------------------------------
-- 4. LEAD_EVIDENCE TABLE
-- Grounded facts, observations, and opportunities discovered during research
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('verified_fact', 'observation', 'pain_point', 'website_text')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_url TEXT,
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_evidence_lead_id ON public.lead_evidence (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_evidence_type ON public.lead_evidence (evidence_type);

-- ----------------------------------------------------------------------------
-- 5. OPPORTUNITIES TABLE
-- CRM Sales pipeline stages, deal values, and closing probabilities
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT NOT NULL DEFAULT 'discovered' CHECK (stage IN (
        'discovered', 'researched', 'qualified', 'contact_identified',
        'outreach_drafted', 'contacted', 'interested', 'meeting_requested',
        'meeting_completed', 'proposal_sent', 'negotiation', 'won', 'lost'
    )),
    deal_value NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    expected_close_date DATE,
    next_action TEXT,
    probability INTEGER NOT NULL DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    loss_reason TEXT,
    notes TEXT,
    assigned_to TEXT DEFAULT 'Sales Lead',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities (stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON public.opportunities (lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON public.opportunities (company_id);

-- ----------------------------------------------------------------------------
-- 6. CAMPAIGNS TABLE
-- Outreach campaigns with targeting rules and daily pacing limits
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    target_country TEXT,
    target_industry TEXT,
    daily_limit INTEGER NOT NULL DEFAULT 5 CHECK (daily_limit >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. OUTREACH_MESSAGES TABLE
-- Individual outreach emails and sequence follow-ups with approval states
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.outreach_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL DEFAULT 0 CHECK (sequence_number >= 0 AND sequence_number <= 2),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    personalisation_notes TEXT,
    quality_score INTEGER NOT NULL DEFAULT 85 CHECK (quality_score >= 0 AND quality_score <= 100),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_approval', 'approved', 'processing', 'sent', 'failed', 'bounced', 'cancelled', 'suppressed'
    )),
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    provider_message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_outreach_sequence UNIQUE (contact_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_outreach_status ON public.outreach_messages (status);
CREATE INDEX IF NOT EXISTS idx_outreach_scheduled_at ON public.outreach_messages (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_outreach_contact_id ON public.outreach_messages (contact_id);
CREATE INDEX IF NOT EXISTS idx_outreach_lead_id ON public.outreach_messages (lead_id);

-- ----------------------------------------------------------------------------
-- 8. EMAIL_REPLIES TABLE
-- Inbound email replies with Gemini AI classification and actions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outreach_message_id UUID REFERENCES public.outreach_messages(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    provider_message_id TEXT NOT NULL UNIQUE,
    thread_id TEXT,
    classification TEXT NOT NULL CHECK (classification IN (
        'interested', 'meeting_request', 'needs_info', 'not_interested',
        'unsubscribe', 'out_of_office', 'bounce', 'unclear'
    )),
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.85,
    summary TEXT,
    action_taken TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_replies_classification ON public.email_replies (classification);
CREATE INDEX IF NOT EXISTS idx_replies_from_email ON public.email_replies (from_email);

-- ----------------------------------------------------------------------------
-- 9. SUPPRESSION_LIST TABLE
-- Contact and domain suppression enforcement (GDPR/CAN-SPAM/opt-out)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    normalized_email TEXT NOT NULL UNIQUE,
    domain TEXT,
    reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'manual', 'compliance_policy', 'complaint')),
    source TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppression_normalized_email ON public.suppression_list (normalized_email);
CREATE INDEX IF NOT EXISTS idx_suppression_domain ON public.suppression_list (domain);

-- ----------------------------------------------------------------------------
-- 10. ACTIVITIES TABLE
-- Complete audit trail and timeline of events
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities (lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities (company_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities (activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities (created_at DESC);

-- ----------------------------------------------------------------------------
-- 11. SYSTEM_SETTINGS TABLE
-- Centralized configuration, kill switches, and compliance policies
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 12. WEBHOOK_EVENTS TABLE
-- Raw incoming events from n8n, Gmail pub/sub, Telegram, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_status ON public.webhook_events (status);

-- ----------------------------------------------------------------------------
-- 13. AUTOMATION_RUNS TABLE
-- Monitoring runs for n8n workflows and scheduled workers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    items_processed INTEGER NOT NULL DEFAULT 0,
    error_log TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_automation_workflow ON public.automation_runs (workflow_id, status);

-- ----------------------------------------------------------------------------
-- 14. SENDING_ACCOUNTS TABLE
-- Gmail sender accounts, rate-limiting, and daily reset state
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sending_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL DEFAULT 'gmail',
    daily_limit INTEGER NOT NULL DEFAULT 5,
    emails_sent_today INTEGER NOT NULL DEFAULT 0,
    last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
