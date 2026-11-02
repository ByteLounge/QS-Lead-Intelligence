// Queenstown Lead Intelligence - Data Store & Local Cache Engine
// Manages real database operations when Supabase is connected, and provides
// explicitly labelled demo datasets when operating in offline/demo mode.

import { Company, Lead, Contact, Opportunity, OutreachMessage, EmailReply, SuppressionRecord, Activity } from '../types';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';

export const IS_DEMO_ENVIRONMENT = !isSupabaseConfigured();

// Explicitly labelled demo records for offline preview
const DEMO_COMPANIES: Company[] = [
  {
    id: 'demo-comp-01',
    name: 'TransIndia Cold Chain & Freight Ltd',
    website: 'https://transindia-coldchain.demo',
    domain: 'transindia-coldchain.demo',
    industry: 'Logistics and Warehousing',
    country: 'India',
    city: 'Bengaluru',
    address: 'Plot 88, Electronic City Phase II, Bengaluru, Karnataka 560100',
    description: 'Multi-modal cold chain logistics, refrigerated storage, and pharmaceutical distribution.',
    discovery_source: 'google_places',
    source_url: 'https://maps.google.com/?cid=transindia_demo',
    external_provider_id: 'places_demo_101',
    discovery_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-comp-02',
    name: 'Al-Mansoor FMCG Distributors LLC',
    website: 'https://almansoor-fmcg.demo',
    domain: 'almansoor-fmcg.demo',
    industry: 'FMCG distributors and wholesalers',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: 'Warehouse Complex 14, Al Quoz Industrial Area 3, Dubai, UAE',
    description: 'Primary distributor of packaged food, beverages, and household consumer goods across UAE retail chains.',
    discovery_source: 'search_adapter',
    source_url: 'https://search.demo/al-mansoor',
    external_provider_id: 'search_demo_102',
    discovery_date: new Date(Date.now() - 3600000 * 72).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-comp-03',
    name: 'Meridian Global Express Cargo UK',
    website: 'https://meridian-cargo.demo',
    domain: 'meridian-cargo.demo',
    industry: 'Logistics and Warehousing',
    country: 'United Kingdom',
    city: 'London',
    address: 'Unit 4, Heathrow Freight Village, Hounslow, London TW6 3QR',
    description: 'Airfreight consolidation, customs brokerage, and bonded warehousing services.',
    discovery_source: 'csv_import',
    source_url: null,
    external_provider_id: 'csv_demo_103',
    discovery_date: new Date(Date.now() - 3600000 * 96).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-comp-04',
    name: 'Pacific Wholesale Grocers SG',
    website: 'https://pacificwholesale.demo',
    domain: 'pacificwholesale.demo',
    industry: 'FMCG distributors and wholesalers',
    country: 'Singapore',
    city: 'Singapore',
    address: '15 Jurong Port Road, Singapore 619119',
    description: 'B2B food service and institutional wholesale supplier serving hotels, restaurants, and retail grocers.',
    discovery_source: 'manual',
    source_url: null,
    external_provider_id: 'manual_demo_104',
    discovery_date: new Date(Date.now() - 3600000 * 120).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_CONTACTS: Contact[] = [
  {
    id: 'demo-cnt-01',
    company_id: 'demo-comp-01',
    full_name: 'Rajesh Narang',
    email: 'rajesh.narang@transindia-coldchain.demo',
    normalized_email: 'rajesh.narang@transindia-coldchain.demo',
    job_title: 'Chief Operating Officer',
    country: 'India',
    source_url: 'https://transindia-coldchain.demo/team',
    source_type: 'website',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-cnt-02',
    company_id: 'demo-comp-02',
    full_name: 'Tariq Al-Mansoor',
    email: 'tariq@almansoor-fmcg.demo',
    normalized_email: 'tariq@almansoor-fmcg.demo',
    job_title: 'Managing Director',
    country: 'United Arab Emirates',
    source_url: 'https://almansoor-fmcg.demo/contact',
    source_type: 'contact_page',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 65).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-cnt-03',
    company_id: 'demo-comp-03',
    full_name: 'Eleanor Vance',
    email: 'e.vance@meridian-cargo.demo',
    normalized_email: 'e.vance@meridian-cargo.demo',
    job_title: 'Head of Supply Chain Technology',
    country: 'United Kingdom',
    source_url: 'https://meridian-cargo.demo/leadership',
    source_type: 'website',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 85).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_LEADS: Lead[] = [
  {
    id: 'demo-lead-01',
    company_id: 'demo-comp-01',
    primary_contact_id: 'demo-cnt-01',
    qualification_score: 88,
    qualification_level: 'high_priority',
    score_breakdown: {
      industry_relevance: 24,
      software_opportunity: 23,
      business_suitability: 18,
      evidence_quality: 12,
      contact_reachability: 11,
    },
    research_summary: 'TransIndia Cold Chain operates 14 temperature-controlled facilities. Website discloses manual dispatch ticketing and lack of driver route sync.',
    business_model: 'Temperature-Controlled 3PL Logistics',
    identified_opportunity: 'Custom WMS and Automated Temperature Telematics Dashboard with driver dispatch integration.',
    recommended_solution: 'Queenstown WMS & Logistics Telematics Suite',
    confidence_level: 0.92,
    status: 'interested',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[0],
    primary_contact: DEMO_CONTACTS[0],
  },
  {
    id: 'demo-lead-02',
    company_id: 'demo-comp-02',
    primary_contact_id: 'demo-cnt-02',
    qualification_score: 84,
    qualification_level: 'high_priority',
    score_breakdown: {
      industry_relevance: 22,
      software_opportunity: 22,
      business_suitability: 18,
      evidence_quality: 11,
      contact_reachability: 11,
    },
    research_summary: 'Al-Mansoor supplies 450+ supermarkets. Currently collects orders via manual phone/WhatsApp coordination; needs self-service distributor ordering portal.',
    business_model: 'B2B Wholesale FMCG Distribution',
    identified_opportunity: 'Distributor Order Management Portal & Live Inventory Stock Synchronization.',
    recommended_solution: 'Queenstown B2B Distributor Ordering Portal',
    confidence_level: 0.89,
    status: 'meeting_requested',
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[1],
    primary_contact: DEMO_CONTACTS[1],
  },
  {
    id: 'demo-lead-03',
    company_id: 'demo-comp-03',
    primary_contact_id: 'demo-cnt-03',
    qualification_score: 76,
    qualification_level: 'potential_prospect',
    score_breakdown: {
      industry_relevance: 20,
      software_opportunity: 19,
      business_suitability: 16,
      evidence_quality: 11,
      contact_reachability: 10,
    },
    research_summary: 'Meridian Global Express provides air cargo consolidation. Uses legacy spreadsheet dispatch manifests.',
    business_model: 'Air Freight Consolidation & Customs Brokerage',
    identified_opportunity: 'Automated Manifest Ingestion & Customs Status Tracking System.',
    recommended_solution: 'Queenstown Customs & Freight Integration Engine',
    confidence_level: 0.82,
    status: 'contacted',
    created_at: new Date(Date.now() - 3600000 * 80).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[2],
    primary_contact: DEMO_CONTACTS[2],
  },
  {
    id: 'demo-lead-04',
    company_id: 'demo-comp-04',
    qualification_score: 48,
    qualification_level: 'low_priority',
    score_breakdown: {
      industry_relevance: 12,
      software_opportunity: 12,
      business_suitability: 12,
      evidence_quality: 6,
      contact_reachability: 6,
    },
    research_summary: 'Small wholesale grocer with limited public digital footprint. Custom software investment ROI is marginal.',
    business_model: 'Local Grocer Distribution',
    identified_opportunity: 'Basic web catalog.',
    recommended_solution: 'Standard eCommerce template (Out of scope for custom engineering)',
    confidence_level: 0.70,
    status: 'discovered',
    created_at: new Date(Date.now() - 3600000 * 110).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[3],
  },
];

const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'demo-opp-01',
    lead_id: 'demo-lead-01',
    company_id: 'demo-comp-01',
    title: 'Custom WMS & Cold Chain Telematics - TransIndia',
    stage: 'interested',
    deal_value: 14500,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0],
    next_action: 'Prepare technical architecture specification',
    probability: 60,
    notes: 'Prospect confirmed manual dispatch bottleneck and asked for technical overview.',
    assigned_to: 'Vikram Mehta (Tech BD)',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[0],
    company: DEMO_COMPANIES[0],
  },
  {
    id: 'demo-opp-02',
    lead_id: 'demo-lead-02',
    company_id: 'demo-comp-02',
    title: 'B2B Distributor Ordering Portal - Al-Mansoor',
    stage: 'meeting_requested',
    deal_value: 18000,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0],
    next_action: 'Discovery call scheduled for Thursday 2 PM GST',
    probability: 75,
    notes: 'Managing Director requested video call to view similar warehouse portal examples.',
    assigned_to: 'Vikram Mehta (Tech BD)',
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[1],
    company: DEMO_COMPANIES[1],
  },
  {
    id: 'demo-opp-03',
    lead_id: 'demo-lead-03',
    company_id: 'demo-comp-03',
    title: 'Manifest Ingestion Engine - Meridian Cargo UK',
    stage: 'contacted',
    deal_value: 9500,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 40).toISOString().split('T')[0],
    next_action: 'Awaiting reply to Sequence 0 intro email',
    probability: 25,
    notes: 'Email approved and sent.',
    assigned_to: 'Eleanor Vance (Sales Lead)',
    created_at: new Date(Date.now() - 3600000 * 75).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[2],
    company: DEMO_COMPANIES[2],
  },
];

const DEMO_OUTREACH: OutreachMessage[] = [
  {
    id: 'demo-out-01',
    lead_id: 'demo-lead-01',
    contact_id: 'demo-cnt-01',
    sequence_number: 0,
    subject: 'TransIndia Cold Chain - Warehouse & Telematics dispatch architecture',
    body: `Hi Rajesh,\n\nI noticed TransIndia's expanding temperature-controlled logistics footprint across Karnataka. Queenstown Labs builds bespoke inventory tracking and driver dispatch portals specifically for cold chain operators.\n\nWe recently engineered an automated dispatch pipeline that reduced manual order re-keying by 40% and synced warehouse telematics in real time.\n\nWould you be open to a brief 10-minute technical exchange next Tuesday to explore if our software architecture aligns with your roadmap?\n\nBest regards,\nEngineering Team\nQueenstown Labs`,
    personalisation_notes: 'Cited cold chain telematics and multi-facility dispatch sync.',
    quality_score: 92,
    status: 'sent',
    scheduled_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    sent_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    provider_message_id: 'msg_demo_transindia_01',
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    updated_at: new Date().toISOString(),
    contact: DEMO_CONTACTS[0],
    lead: DEMO_LEADS[0],
  },
  {
    id: 'demo-out-02',
    lead_id: 'demo-lead-02',
    contact_id: 'demo-cnt-02',
    sequence_number: 0,
    subject: 'Al-Mansoor FMCG - Distributor ordering portal software',
    body: `Hi Tariq,\n\nI noticed Al-Mansoor's wholesale distribution network serving over 450 retail storefronts across the UAE. Queenstown Labs develops dedicated B2B distributor portals that eliminate phone/WhatsApp order bottlenecks.\n\nOur client portal allows retail distributors to place stock orders 24/7 with live inventory validation, reducing coordination overhead and dispatch errors.\n\nAre you open to a brief 10-minute technical chat next Wednesday to see if a similar solution fits your operations?\n\nBest regards,\nEngineering Team\nQueenstown Labs`,
    personalisation_notes: 'Addresses 450+ retail store order friction with self-service ordering.',
    quality_score: 94,
    status: 'sent',
    scheduled_at: new Date(Date.now() - 3600000 * 55).toISOString(),
    sent_at: new Date(Date.now() - 3600000 * 52).toISOString(),
    provider_message_id: 'msg_demo_almansoor_01',
    created_at: new Date(Date.now() - 3600000 * 58).toISOString(),
    updated_at: new Date().toISOString(),
    contact: DEMO_CONTACTS[1],
    lead: DEMO_LEADS[1],
  },
  {
    id: 'demo-out-03',
    lead_id: 'demo-lead-03',
    contact_id: 'demo-cnt-03',
    sequence_number: 0,
    subject: 'Meridian Cargo UK - Customs manifest ingestion system',
    body: `Hi Eleanor,\n\nI came across Meridian Cargo's consolidation operations at Heathrow Freight Village. Queenstown Labs specializes in custom API integrations and automated manifest workflows for UK freight forwarders.\n\nWe build custom tools that extract flight manifests and sync clearance statuses directly with internal dispatch boards, cutting manual entry time significantly.\n\nWould you be open to a 10-minute technical exchange next week?\n\nBest regards,\nEngineering Team\nQueenstown Labs`,
    personalisation_notes: 'Focuses on Heathrow freight village customs manifest automation.',
    quality_score: 89,
    status: 'pending_approval',
    scheduled_at: new Date(Date.now() + 3600000 * 4).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    contact: DEMO_CONTACTS[2],
    lead: DEMO_LEADS[2],
  },
];

const DEMO_REPLIES: EmailReply[] = [
  {
    id: 'demo-rep-01',
    outreach_message_id: 'demo-out-02',
    contact_id: 'demo-cnt-02',
    from_email: 'tariq@almansoor-fmcg.demo',
    subject: 'Re: Al-Mansoor FMCG - Distributor ordering portal software',
    body: 'Hi, thanks for reaching out. We actually have been considering moving our supermarket clients to an online ordering portal. Can we set up a 15 min Zoom call this Thursday at 2 PM GST?',
    provider_message_id: 'rep_demo_101',
    classification: 'meeting_request',
    confidence_score: 0.98,
    summary: 'Prospect confirmed active need for ordering portal and requested 15-min Zoom call Thursday 2 PM GST.',
    action_taken: 'Lead promoted to Meeting Requested. Sequence follow-ups halted.',
    received_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    contact: DEMO_CONTACTS[1],
  },
  {
    id: 'demo-rep-02',
    outreach_message_id: 'demo-out-01',
    contact_id: 'demo-cnt-01',
    from_email: 'rajesh.narang@transindia-coldchain.demo',
    subject: 'Re: TransIndia Cold Chain - Warehouse & Telematics dispatch architecture',
    body: 'Interesting timing. Could you send over a brief PDF overview or scope of what the telematics integration entails? If it looks promising we can arrange a call with our IT manager.',
    provider_message_id: 'rep_demo_102',
    classification: 'interested',
    confidence_score: 0.94,
    summary: 'COO requested technical PDF architecture overview to evaluate with IT manager.',
    action_taken: 'Lead updated to Interested. Commercial proposal draft initiated.',
    received_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    contact: DEMO_CONTACTS[0],
  },
];

const DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'act-01',
    activity_type: 'reply_received',
    title: 'Meeting Requested by Tariq Al-Mansoor',
    description: 'Prospect requested Zoom call for Thursday at 2 PM GST regarding distributor ordering portal.',
    metadata: { classification: 'meeting_request', lead_id: 'demo-lead-02' },
    created_by: 'system',
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 'act-02',
    activity_type: 'email_sent',
    title: 'Intro Outreach Sent to TransIndia Cold Chain',
    description: 'Delivered Sequence 0 email to rajesh.narang@transindia-coldchain.demo',
    metadata: { outreach_id: 'demo-out-01' },
    created_by: 'system',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'act-03',
    activity_type: 'scored',
    title: 'Lead Qualified: TransIndia Cold Chain (Score: 88/100)',
    description: 'Categorized as High Priority prospect with verified warehouse telematics opportunity.',
    metadata: { score: 88, level: 'high_priority' },
    created_by: 'system',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

// In-memory operational store for runtime state
class RuntimeDataStore {
  companies: Company[] = [...DEMO_COMPANIES];
  contacts: Contact[] = [...DEMO_CONTACTS];
  leads: Lead[] = [...DEMO_LEADS];
  opportunities: Opportunity[] = [...DEMO_OPPORTUNITIES];
  outreachMessages: OutreachMessage[] = [...DEMO_OUTREACH];
  emailReplies: EmailReply[] = [...DEMO_REPLIES];
  suppressionList: SuppressionRecord[] = [
    {
      id: 'supp-01',
      email: 'optout-test@example.com',
      normalized_email: 'optout-test@example.com',
      domain: 'example.com',
      reason: 'unsubscribe',
      source: 'test_seed',
      created_at: new Date().toISOString(),
    },
  ];
  activities: Activity[] = [...DEMO_ACTIVITIES];

  // Helper getters
  getCompanies() {
    return this.companies;
  }

  getCompanyById(id: string) {
    return this.companies.find((c) => c.id === id);
  }

  getLeads() {
    return this.leads;
  }

  getLeadById(id: string) {
    return this.leads.find((l) => l.id === id);
  }

  getOpportunities() {
    return this.opportunities;
  }

  getOutreachMessages() {
    return this.outreachMessages;
  }

  getContacts() {
    return this.contacts;
  }

  getSuppressionList() {
    return this.suppressionList;
  }

  getActivities() {
    return this.activities;
  }

  recordActivity(act: Omit<Activity, 'id' | 'created_at'>) {
    const entry: Activity = {
      ...act,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.activities.unshift(entry);
    return entry;
  }
}

// Global runtime instance
export const memoryStore = new RuntimeDataStore();
