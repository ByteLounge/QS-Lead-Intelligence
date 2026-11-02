-- ============================================================================
-- QUEENSTOWN LEAD INTELLIGENCE - ROW LEVEL SECURITY (RLS) POLICIES 003
-- ============================================================================

-- Enable RLS on all operational tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sending_accounts ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Policies for Authenticated Users (Admins, Sales Managers, Sales Members)
-- ----------------------------------------------------------------------------

-- Companies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON public.companies;
CREATE POLICY "Authenticated users can view companies"
    ON public.companies FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert/update companies" ON public.companies;
CREATE POLICY "Authenticated users can insert/update companies"
    ON public.companies FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Contacts
DROP POLICY IF EXISTS "Authenticated users can manage contacts" ON public.contacts;
CREATE POLICY "Authenticated users can manage contacts"
    ON public.contacts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Leads
DROP POLICY IF EXISTS "Authenticated users can manage leads" ON public.leads;
CREATE POLICY "Authenticated users can manage leads"
    ON public.leads FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Lead Evidence
DROP POLICY IF EXISTS "Authenticated users can manage lead evidence" ON public.lead_evidence;
CREATE POLICY "Authenticated users can manage lead evidence"
    ON public.lead_evidence FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Opportunities
DROP POLICY IF EXISTS "Authenticated users can manage opportunities" ON public.opportunities;
CREATE POLICY "Authenticated users can manage opportunities"
    ON public.opportunities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Campaigns
DROP POLICY IF EXISTS "Authenticated users can manage campaigns" ON public.campaigns;
CREATE POLICY "Authenticated users can manage campaigns"
    ON public.campaigns FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Outreach Messages
DROP POLICY IF EXISTS "Authenticated users can manage outreach messages" ON public.outreach_messages;
CREATE POLICY "Authenticated users can manage outreach messages"
    ON public.outreach_messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Email Replies
DROP POLICY IF EXISTS "Authenticated users can view and update email replies" ON public.email_replies;
CREATE POLICY "Authenticated users can view and update email replies"
    ON public.email_replies FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Suppression List (Read for all authenticated, modify for authorized)
DROP POLICY IF EXISTS "Authenticated users can view suppression list" ON public.suppression_list;
CREATE POLICY "Authenticated users can view suppression list"
    ON public.suppression_list FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert into suppression list" ON public.suppression_list;
CREATE POLICY "Authenticated users can insert into suppression list"
    ON public.suppression_list FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Activities
DROP POLICY IF EXISTS "Authenticated users can manage activities" ON public.activities;
CREATE POLICY "Authenticated users can manage activities"
    ON public.activities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- System Settings
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON public.system_settings;
CREATE POLICY "Authenticated users can read system settings"
    ON public.system_settings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can update system settings" ON public.system_settings;
CREATE POLICY "Authenticated users can update system settings"
    ON public.system_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Webhook Events & Automation Runs
DROP POLICY IF EXISTS "Authenticated users can view webhook events" ON public.webhook_events;
CREATE POLICY "Authenticated users can view webhook events"
    ON public.webhook_events FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can view automation runs" ON public.automation_runs;
CREATE POLICY "Authenticated users can view automation runs"
    ON public.automation_runs FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage sending accounts" ON public.sending_accounts;
CREATE POLICY "Authenticated users can manage sending accounts"
    ON public.sending_accounts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow service_role key full bypass on everything
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
