// Queenstown Lead Intelligence - Core Domain Types

export type DiscoverySource = 'google_places' | 'search_adapter' | 'csv_import' | 'manual';
export type ResearchStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type VerificationStatus = 'unknown' | 'pending' | 'valid' | 'invalid' | 'risky';
export type MarketingEligibility = 'pending' | 'eligible' | 'ineligible' | 'suppressed';
export type QualificationLevel = 'high_priority' | 'potential_prospect' | 'low_priority' | 'disqualified';

export type PipelineStage = 
  | 'discovered'
  | 'researched'
  | 'qualified'
  | 'contact_identified'
  | 'outreach_drafted'
  | 'contacted'
  | 'interested'
  | 'meeting_requested'
  | 'meeting_completed'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type MessageStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'bounced'
  | 'cancelled'
  | 'suppressed';

export type ReplyClassification = 
  | 'interested'
  | 'meeting_request'
  | 'needs_info'
  | 'not_interested'
  | 'unsubscribe'
  | 'out_of_office'
  | 'bounce'
  | 'unclear';

export interface ScoreBreakdown {
  industry_relevance: number;      // 0 - 25
  software_opportunity: number;    // 0 - 25
  business_suitability: number;    // 0 - 20
  evidence_quality: number;        // 0 - 15
  contact_reachability: number;    // 0 - 15
}

export interface Company {
  id: string;
  name: string;
  website?: string | null;
  domain?: string | null;
  industry?: string | null;
  country: string;
  city?: string | null;
  address?: string | null;
  description?: string | null;
  discovery_source: DiscoverySource;
  source_url?: string | null;
  external_provider_id?: string | null;
  discovery_date: string;
  research_status: ResearchStatus;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  normalized_email: string;
  job_title?: string | null;
  country?: string | null;
  source_url?: string | null;
  source_type: 'website' | 'contact_page' | 'manual' | 'enrichment';
  verification_status: VerificationStatus;
  marketing_eligibility_status: MarketingEligibility;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface LeadEvidence {
  id: string;
  lead_id: string;
  evidence_type: 'verified_fact' | 'observation' | 'pain_point' | 'website_text';
  title: string;
  description: string;
  source_url?: string | null;
  confidence_score: number;
  is_verified: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  company_id: string;
  primary_contact_id?: string | null;
  qualification_score: number;
  qualification_level: QualificationLevel;
  score_breakdown: ScoreBreakdown;
  score_override?: number | null;
  score_override_reason?: string | null;
  research_summary?: string | null;
  business_model?: string | null;
  identified_opportunity?: string | null;
  recommended_solution?: string | null;
  confidence_level: number;
  status: PipelineStage;
  created_at: string;
  updated_at: string;
  company?: Company;
  primary_contact?: Contact;
  evidence?: LeadEvidence[];
}

export interface Opportunity {
  id: string;
  lead_id: string;
  company_id: string;
  title: string;
  stage: PipelineStage;
  deal_value: number;
  currency: string;
  expected_close_date?: string | null;
  next_action?: string | null;
  probability: number;
  loss_reason?: string | null;
  notes?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  company?: Company;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_country?: string | null;
  target_industry?: string | null;
  daily_limit: number;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  campaign_id?: string | null;
  lead_id: string;
  contact_id: string;
  sequence_number: number;
  subject: string;
  body: string;
  personalisation_notes?: string | null;
  quality_score: number;
  status: MessageStatus;
  scheduled_at: string;
  sent_at?: string | null;
  provider_message_id?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  contact?: Contact;
  lead?: Lead;
}

export interface EmailReply {
  id: string;
  outreach_message_id?: string | null;
  contact_id?: string | null;
  from_email: string;
  subject: string;
  body: string;
  provider_message_id: string;
  thread_id?: string | null;
  classification: ReplyClassification;
  confidence_score: number;
  summary?: string | null;
  action_taken?: string | null;
  received_at: string;
  created_at: string;
  contact?: Contact;
}

export interface SuppressionRecord {
  id: string;
  email: string;
  normalized_email: string;
  domain?: string | null;
  reason: 'unsubscribe' | 'bounce' | 'manual' | 'compliance_policy' | 'complaint';
  source: string;
  created_at: string;
}

export interface Activity {
  id: string;
  lead_id?: string | null;
  company_id?: string | null;
  activity_type: string;
  title: string;
  description?: string | null;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface ComplianceSettings {
  sending_enabled: boolean;
  human_approval_required: boolean;
  daily_email_limit: number;
  max_followups: number;
  minimum_lead_score: number;
  require_verified_email: boolean;
  sender_name: string;
  sender_email: string;
  company_physical_address: string;
  privacy_policy_url: string;
  unsubscribe_url: string;
}

export interface CountryPolicy {
  allowed: boolean;
  requires_explicit_opt_in: boolean;
  b2b_exemption: boolean;
  mandatory_unsubscribe: boolean;
  notes: string;
}
