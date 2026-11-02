-- ============================================================================
-- QUEENSTOWN LEAD INTELLIGENCE - SQL FUNCTIONS AND STORED PROCEDURES 002
-- Concurrency-safe message queue claiming, suppression checks, and automation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Automatic updated_at timestamp trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_outreach_updated_at
    BEFORE UPDATE ON public.outreach_messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-calculate qualification level on leads based on qualification_score
-- 80-100: high_priority
-- 60-79: potential_prospect
-- 40-59: low_priority
-- Below 40: disqualified
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_lead_qualification_level()
RETURNS TRIGGER AS $$
DECLARE
    effective_score INTEGER;
BEGIN
    -- If there is a manual score override, use it; otherwise use qualification_score
    effective_score := COALESCE(NEW.score_override, NEW.qualification_score);

    IF effective_score >= 80 THEN
        NEW.qualification_level := 'high_priority';
    ELSIF effective_score >= 60 THEN
        NEW.qualification_level := 'potential_prospect';
    ELSIF effective_score >= 40 THEN
        NEW.qualification_level := 'low_priority';
    ELSE
        NEW.qualification_level := 'disqualified';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_lead_qualification_level
    BEFORE INSERT OR UPDATE OF qualification_score, score_override ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_lead_qualification_level();

-- ----------------------------------------------------------------------------
-- Suppression check function
-- Returns TRUE if email or domain is on suppression list
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_contact_suppression(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_norm_email TEXT;
    v_domain TEXT;
    v_suppressed BOOLEAN := false;
BEGIN
    v_norm_email := lower(trim(p_email));
    v_domain := split_part(v_norm_email, '@', 2);

    IF EXISTS (
        SELECT 1 FROM public.suppression_list
        WHERE normalized_email = v_norm_email
           OR (domain IS NOT NULL AND domain = v_domain)
    ) THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Concurrency-Safe Outbound Message Claim Function
-- Uses SELECT FOR UPDATE SKIP LOCKED
-- Checks:
-- 1. Global SENDING_ENABLED setting
-- 2. Daily limits
-- 3. Suppression check
-- 4. Status = 'approved' and scheduled_at <= now()
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_eligible_outbound_messages(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    message_id UUID,
    lead_id UUID,
    contact_id UUID,
    recipient_email TEXT,
    recipient_name TEXT,
    subject TEXT,
    body TEXT,
    sequence_number INTEGER
) AS $$
DECLARE
    v_sending_enabled BOOLEAN;
    v_daily_limit INTEGER;
    v_today_sent INTEGER;
    v_slots_available INTEGER;
BEGIN
    -- 1. Check Global Sending Switch in system_settings
    SELECT (value->>'sending_enabled')::boolean INTO v_sending_enabled
    FROM public.system_settings
    WHERE key = 'compliance_settings';

    IF v_sending_enabled IS NOT TRUE THEN
        RETURN; -- Global sending switch disabled, return empty
    END IF;

    -- 2. Check Daily Limit
    SELECT COALESCE((value->>'daily_email_limit')::integer, 5) INTO v_daily_limit
    FROM public.system_settings
    WHERE key = 'compliance_settings';

    SELECT COUNT(*) INTO v_today_sent
    FROM public.outreach_messages
    WHERE status = 'sent'
      AND sent_at >= CURRENT_DATE::timestamptz;

    v_slots_available := v_daily_limit - v_today_sent;
    IF v_slots_available <= 0 THEN
        RETURN; -- Daily limit reached, return empty
    END IF;

    -- Clamp request by available slots
    IF p_limit > v_slots_available THEN
        p_limit := v_slots_available;
    END IF;

    -- 3. Select eligible messages and lock rows
    RETURN QUERY
    WITH eligible_batch AS (
        SELECT 
            m.id,
            m.lead_id,
            m.contact_id,
            c.email AS recipient_email,
            c.full_name AS recipient_name,
            m.subject,
            m.body,
            m.sequence_number
        FROM public.outreach_messages m
        JOIN public.contacts c ON m.contact_id = c.id
        WHERE m.status = 'approved'
          AND m.scheduled_at <= now()
          AND NOT public.check_contact_suppression(c.email)
        ORDER BY m.scheduled_at ASC
        LIMIT p_limit
        FOR UPDATE OF m SKIP LOCKED
    )
    UPDATE public.outreach_messages up
    SET status = 'processing',
        updated_at = now()
    FROM eligible_batch b
    WHERE up.id = b.id
    RETURNING 
        b.id,
        b.lead_id,
        b.contact_id,
        b.recipient_email,
        b.recipient_name,
        b.subject,
        b.body,
        b.sequence_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Follow-up sequence cancellation helper
-- Cancels pending/scheduled messages when contact replies or opts out
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_sequence_on_reply(p_contact_id UUID, p_reason TEXT DEFAULT 'reply_received')
RETURNS INTEGER AS $$
DECLARE
    v_cancelled_count INTEGER;
BEGIN
    UPDATE public.outreach_messages
    SET status = 'cancelled',
        error_message = 'Cancelled due to: ' || p_reason,
        updated_at = now()
    WHERE contact_id = p_contact_id
      AND status IN ('draft', 'pending_approval', 'approved')
      AND sequence_number > 0;

    GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;
    RETURN v_cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Activity recording helper
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_activity(
    p_lead_id UUID,
    p_company_id UUID,
    p_activity_type TEXT,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_created_by TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO public.activities (
        lead_id,
        company_id,
        activity_type,
        title,
        description,
        metadata,
        created_by
    ) VALUES (
        p_lead_id,
        p_company_id,
        p_activity_type,
        p_title,
        p_description,
        p_metadata,
        p_created_by
    ) RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
