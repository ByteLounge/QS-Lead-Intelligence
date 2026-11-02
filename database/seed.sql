-- ============================================================================
-- QUEENSTOWN LEAD INTELLIGENCE - SEED DATA & INITIAL CONFIGURATION
-- ============================================================================

-- 1. Initialize Default System Settings & Compliance Guardrails
INSERT INTO public.system_settings (key, value)
VALUES 
(
    'compliance_settings',
    '{
        "sending_enabled": false,
        "human_approval_required": true,
        "daily_email_limit": 5,
        "max_followups": 2,
        "minimum_lead_score": 80,
        "require_verified_email": true,
        "sender_name": "Queenstown Labs Team",
        "sender_email": "queenstownlabs@gmail.com",
        "company_physical_address": "Queenstown Labs, Tech Hub Innovation Centre, Bengaluru / London",
        "privacy_policy_url": "https://queenstownlabs.com/privacy",
        "unsubscribe_url": "https://queenstownlabs.com/unsubscribe"
    }'::jsonb
),
(
    'country_marketing_policies',
    '{
        "India": {
            "allowed": true,
            "requires_explicit_opt_in": false,
            "b2b_exemption": true,
            "mandatory_unsubscribe": true,
            "notes": "B2B commercial outreach allowed with accurate sender identity and clear opt-out."
        },
        "United Kingdom": {
            "allowed": true,
            "requires_explicit_opt_in": false,
            "b2b_exemption": true,
            "mandatory_unsubscribe": true,
            "notes": "PECR rules allow B2B outreach to corporate bodies (Ltd, PLC, LLP) with immediate opt-out."
        },
        "Australia": {
            "allowed": true,
            "requires_explicit_opt_in": false,
            "b2b_exemption": true,
            "mandatory_unsubscribe": true,
            "notes": "Spam Act 2003 allows contact if email is publicly published and relevant to software role."
        },
        "Singapore": {
            "allowed": true,
            "requires_explicit_opt_in": false,
            "b2b_exemption": true,
            "mandatory_unsubscribe": true,
            "notes": "PDPA B2B exclusion applies for business contact info for commercial purposes."
        },
        "United Arab Emirates": {
            "allowed": true,
            "requires_explicit_opt_in": false,
            "b2b_exemption": true,
            "mandatory_unsubscribe": true,
            "notes": "Commercial electronic messages require identifiable sender and functional unsubscribe."
        }
    }'::jsonb
),
(
    'integration_status',
    '{
        "gemini_api_configured": false,
        "google_places_configured": false,
        "gmail_oauth_configured": false,
        "telegram_bot_configured": false,
        "n8n_connected": false
    }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Default Active Campaign for Queenstown Labs Services
INSERT INTO public.campaigns (id, name, description, status, target_country, target_industry, daily_limit)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Logistics & Warehouse Digitalization 2026',
    'Targeting 3PL, FMCG and warehouse distributors for custom ERP and inventory automation software.',
    'active',
    'India',
    'Logistics and Warehousing',
    5
) ON CONFLICT (id) DO NOTHING;

-- 3. Default Sending Account
INSERT INTO public.sending_accounts (id, email, provider, daily_limit, emails_sent_today, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'queenstownlabs@gmail.com',
    'gmail',
    5,
    0,
    true
) ON CONFLICT (email) DO NOTHING;
