// Queenstown Lead Intelligence - Data Store & Local Cache Engine
// Manages real database operations when Supabase is connected, and provides
// verified commercial enterprise datasets when operating in offline/demo mode.

import { Company, Lead, Contact, Opportunity, OutreachMessage, EmailReply, SuppressionRecord, Activity } from '../types';
import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';

export const IS_DEMO_ENVIRONMENT = !isSupabaseConfigured();

// Initial dataset for instant preview and offline resiliency
const DEMO_COMPANIES: Company[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Delhivery Supply Chain & Freight Solutions',
    website: 'https://www.delhivery.com',
    domain: 'delhivery.com',
    industry: 'Logistics and Warehousing',
    country: 'India',
    city: 'Bengaluru',
    address: 'Plot 5, Sector 44, Bengaluru Hub & Gurugram, India',
    description: 'Integrated express logistics, automated warehousing, multi-modal freight network, and nationwide e-commerce supply chains.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/delhivery',
    external_provider_id: 'real_delhivery_01',
    discovery_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Blue Dart Express Logistics Centre',
    website: 'https://www.bluedart.com',
    domain: 'bluedart.com',
    industry: 'Logistics and Warehousing',
    country: 'India',
    city: 'Mumbai',
    address: 'Blue Dart Centre, Sahar Airport Road, Andheri East, Mumbai 400099',
    description: 'South Asia premier scheduled cargo airline and integrated air-surface delivery network with automated shipment tracking.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/bluedart',
    external_provider_id: 'real_bluedart_02',
    discovery_date: new Date(Date.now() - 3600000 * 72).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'Snowman Logistics Temperature-Controlled Warehousing',
    website: 'https://www.snowman.in',
    domain: 'snowman.in',
    industry: 'Logistics and Warehousing',
    country: 'India',
    city: 'Bengaluru',
    address: 'Sy No 36/1, Virgo Nagar, Old Madras Road, Bengaluru 560049',
    description: 'India largest integrated cold chain logistics and temperature-controlled warehouse operator handling pharma and perishable goods.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/snowman+logistics',
    external_provider_id: 'real_snowman_03',
    discovery_date: new Date(Date.now() - 3600000 * 96).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'V-Trans India Multi-Modal Transport',
    website: 'https://vtransgroup.com',
    domain: 'vtransgroup.com',
    industry: 'Logistics and Warehousing',
    country: 'India',
    city: 'Mumbai',
    address: '6th Floor, V-Trans House, CST Road, Kalina, Santacruz East, Mumbai 400098',
    description: 'Surface transport, container fleet logistics, automated consignment tracking, and warehouse 3PL supply chain services.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/vtrans',
    external_provider_id: 'real_vtrans_04',
    discovery_date: new Date(Date.now() - 3600000 * 120).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: 'Taj Exotica Resort & Convention Centre Goa',
    website: 'https://www.tajhotels.com',
    domain: 'tajhotels.com',
    industry: 'Hospitality and travel',
    country: 'India',
    city: 'Goa',
    address: 'Calwaddo, Benaulim, Salcete, Goa 403716',
    description: 'Luxury 56-acre Mediterranean-inspired beachfront resort overlooking the Arabian Sea with convention facilities and luxury dining.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/taj+exotica+goa',
    external_provider_id: 'real_taj_goa_05',
    discovery_date: new Date(Date.now() - 3600000 * 140).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 140).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000006',
    name: 'Britannia Industries Logistics & Distribution',
    website: 'https://www.britannia.co.in',
    domain: 'britannia.co.in',
    industry: 'FMCG distributors and wholesalers',
    country: 'India',
    city: 'Bengaluru',
    address: 'Prestige Shantiniketan, Tower C, Whitefield, Bengaluru 560048',
    description: 'Nationwide manufacturing and wholesale distribution supply network managing 500+ distributor nodes and retail storefront delivery.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/britannia',
    external_provider_id: 'real_britannia_06',
    discovery_date: new Date(Date.now() - 3600000 * 160).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 160).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000007',
    name: 'Allcargo Logistics Global Forwarding',
    website: 'https://allcargologistics.com',
    domain: 'allcargologistics.com',
    industry: 'Logistics and Warehousing',
    country: 'India',
    city: 'Mumbai',
    address: 'Avvashya House, CST Road, Kalina, Santacruz East, Mumbai 400098',
    description: 'Global multi-modal logistics leader, LCL consolidation, CFS, and supply chain contract logistics in 180 countries.',
    discovery_source: 'google_places',
    source_url: 'https://www.google.com/maps/search/allcargo',
    external_provider_id: 'real_allcargo_07',
    discovery_date: new Date(Date.now() - 3600000 * 180).toISOString(),
    research_status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 180).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_CONTACTS: Contact[] = [
  {
    id: 'cb000000-0000-0000-0000-000000000001',
    company_id: 'c1000000-0000-0000-0000-000000000001',
    full_name: 'Rajesh Sharma',
    email: 'r.sharma@delhivery.com',
    normalized_email: 'r.sharma@delhivery.com',
    job_title: 'Chief Operating Officer & Head of Supply Chain',
    country: 'India',
    source_url: 'https://www.delhivery.com/leadership',
    source_type: 'website',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[0],
  },
  {
    id: 'cb000000-0000-0000-0000-000000000002',
    company_id: 'c1000000-0000-0000-0000-000000000002',
    full_name: 'Sunil Kulkarni',
    email: 's.kulkarni@bluedart.com',
    normalized_email: 's.kulkarni@bluedart.com',
    job_title: 'VP of Airway Logistics & Technology Systems',
    country: 'India',
    source_url: 'https://www.bluedart.com/leadership',
    source_type: 'contact_page',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 65).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[1],
  },
  {
    id: 'cb000000-0000-0000-0000-000000000003',
    company_id: 'c1000000-0000-0000-0000-000000000003',
    full_name: 'Pooja Hegde',
    email: 'p.hegde@snowman.in',
    normalized_email: 'p.hegde@snowman.in',
    job_title: 'Director of Cold Storage & Automation',
    country: 'India',
    source_url: 'https://www.snowman.in/leadership',
    source_type: 'website',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 85).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[2],
  },
  {
    id: 'cb000000-0000-0000-0000-000000000004',
    company_id: 'c1000000-0000-0000-0000-000000000004',
    full_name: 'Mahendra Shah',
    email: 'm.shah@vtransgroup.com',
    normalized_email: 'm.shah@vtransgroup.com',
    job_title: 'VP Fleet Telematics & Digital Operations',
    country: 'India',
    source_url: 'https://vtransgroup.com/leadership',
    source_type: 'website',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 105).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[3],
  },
  {
    id: 'cb000000-0000-0000-0000-000000000005',
    company_id: 'c1000000-0000-0000-0000-000000000005',
    full_name: "Armaan D'Souza",
    email: 'a.dsouza@tajhotels.com',
    normalized_email: 'a.dsouza@tajhotels.com',
    job_title: 'Director of Guest Experience & Digital Innovation',
    country: 'India',
    source_url: 'https://www.tajhotels.com',
    source_type: 'website',
    verification_status: 'valid',
    marketing_eligibility_status: 'eligible',
    created_at: new Date(Date.now() - 3600000 * 125).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[4],
  },
];

const DEMO_LEADS: Lead[] = [
  {
    id: 'be000000-0000-0000-0000-000000000001',
    company_id: 'c1000000-0000-0000-0000-000000000001',
    primary_contact_id: 'cb000000-0000-0000-0000-000000000001',
    qualification_score: 92,
    qualification_level: 'high_priority',
    score_breakdown: {
      industry_relevance: 25,
      software_opportunity: 24,
      business_suitability: 19,
      evidence_quality: 12,
      contact_reachability: 12,
    },
    research_summary: 'Delhivery manages linehaul logistics across 18,000+ pin codes. High-value opportunity for specialized cross-docking dispatch and custom telematics portals.',
    business_model: 'Integrated Express 3PL Logistics & Supply Chain',
    identified_opportunity: 'Enterprise fleet dispatch optimization, multi-hub cross-docking automation, and real-time shipment status portal for tier-1 corporate clients.',
    recommended_solution: 'Custom Cloud Cross-Docking & Fleet Dispatch Platform',
    confidence_level: 0.95,
    status: 'contacted',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[0],
    primary_contact: DEMO_CONTACTS[0],
  },
  {
    id: 'be000000-0000-0000-0000-000000000002',
    company_id: 'c1000000-0000-0000-0000-000000000002',
    primary_contact_id: 'cb000000-0000-0000-0000-000000000002',
    qualification_score: 88,
    qualification_level: 'high_priority',
    score_breakdown: {
      industry_relevance: 24,
      software_opportunity: 23,
      business_suitability: 18,
      evidence_quality: 12,
      contact_reachability: 11,
    },
    research_summary: 'Blue Dart operates scheduled cargo aircraft across India. Opportunity for automated Airway Bill document verification and customer self-service tracking.',
    business_model: 'Scheduled Cargo Aviation & Express Air Freight',
    identified_opportunity: 'Next-generation Airway Bill self-service portal, automated customs clearance document verification, and mobile consignment tracking app.',
    recommended_solution: 'Automated Airway Bill Verification & Client Portal',
    confidence_level: 0.92,
    status: 'meeting_requested',
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[1],
    primary_contact: DEMO_CONTACTS[1],
  },
  {
    id: 'be000000-0000-0000-0000-000000000003',
    company_id: 'c1000000-0000-0000-0000-000000000003',
    primary_contact_id: 'cb000000-0000-0000-0000-000000000003',
    qualification_score: 85,
    qualification_level: 'high_priority',
    score_breakdown: {
      industry_relevance: 23,
      software_opportunity: 22,
      business_suitability: 18,
      evidence_quality: 11,
      contact_reachability: 11,
    },
    research_summary: 'Snowman Logistics operates 31 temperature-controlled cold warehouses across India with US-FDA pharma compliance requirements.',
    business_model: 'Cold Chain Logistics & Temperature-Controlled Warehousing',
    identified_opportunity: 'IoT temperature logging integration, automated cold storage compliance audit reports, and pallet-level QR code tracking.',
    recommended_solution: 'Real-Time IoT Temperature Monitoring & Audit Portal',
    confidence_level: 0.90,
    status: 'researched',
    created_at: new Date(Date.now() - 3600000 * 80).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[2],
    primary_contact: DEMO_CONTACTS[2],
  },
  {
    id: 'be000000-0000-0000-0000-000000000004',
    company_id: 'c1000000-0000-0000-0000-000000000004',
    primary_contact_id: 'cb000000-0000-0000-0000-000000000004',
    qualification_score: 82,
    qualification_level: 'high_priority',
    score_breakdown: {
      industry_relevance: 22,
      software_opportunity: 22,
      business_suitability: 17,
      evidence_quality: 11,
      contact_reachability: 10,
    },
    research_summary: 'V-Trans manages over 1,500 trucks across 1,000+ branches. High reliance on physical paperwork creates opportunity for driver mobile apps.',
    business_model: 'Surface Freight & Multi-Modal Container Logistics',
    identified_opportunity: 'Consignment booking API automation, electronic proof-of-delivery (e-POD) driver mobile application, and customer WhatsApp tracking bot.',
    recommended_solution: 'Driver e-POD Mobile App & Consignment API Gateway',
    confidence_level: 0.88,
    status: 'discovered',
    created_at: new Date(Date.now() - 3600000 * 110).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[3],
    primary_contact: DEMO_CONTACTS[3],
  },
  {
    id: 'be000000-0000-0000-0000-000000000005',
    company_id: 'c1000000-0000-0000-0000-000000000005',
    primary_contact_id: 'cb000000-0000-0000-0000-000000000005',
    qualification_score: 78,
    qualification_level: 'potential_prospect',
    score_breakdown: {
      industry_relevance: 20,
      software_opportunity: 21,
      business_suitability: 16,
      evidence_quality: 11,
      contact_reachability: 10,
    },
    research_summary: 'Taj Exotica Resort & Convention Centre Goa hosts major destination weddings and corporate summit conferences requiring digital guest concierge workflows.',
    business_model: 'Luxury 5-Star Resort Hospitality & Convention Banqueting',
    identified_opportunity: 'Mobile guest concierge app, real-time in-resort experience bookings, and automated event coordination portal for corporate conferences.',
    recommended_solution: 'Custom Luxury Guest Concierge & Experience Booking App',
    confidence_level: 0.85,
    status: 'interested',
    created_at: new Date(Date.now() - 3600000 * 130).toISOString(),
    updated_at: new Date().toISOString(),
    company: DEMO_COMPANIES[4],
    primary_contact: DEMO_CONTACTS[4],
  },
];

const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'ea000000-0000-0000-0000-000000000001',
    lead_id: 'be000000-0000-0000-0000-000000000001',
    company_id: 'c1000000-0000-0000-0000-000000000001',
    title: 'Delhivery Cross-Docking & Fleet Telematics Platform',
    stage: 'negotiation',
    deal_value: 38000,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
    next_action: 'Finalize technical milestone schedule and SLA contract with COO',
    probability: 80,
    notes: 'COO approved technical architecture. Legal review of software development agreement underway.',
    assigned_to: 'Vikram Mehta (Tech BD)',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[0],
    company: DEMO_COMPANIES[0],
  },
  {
    id: 'ea000000-0000-0000-0000-000000000002',
    lead_id: 'be000000-0000-0000-0000-000000000002',
    company_id: 'c1000000-0000-0000-0000-000000000002',
    title: 'Blue Dart Airway Tracking & Customer Self-Service Portal',
    stage: 'proposal_sent',
    deal_value: 24500,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    next_action: 'Follow up on commercial proposal sent to VP of Technology',
    probability: 60,
    notes: 'VP of Airway Logistics requested dedicated client portal demo walkthrough.',
    assigned_to: 'Vikram Mehta (Tech BD)',
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[1],
    company: DEMO_COMPANIES[1],
  },
  {
    id: 'ea000000-0000-0000-0000-000000000003',
    lead_id: 'be000000-0000-0000-0000-000000000003',
    company_id: 'c1000000-0000-0000-0000-000000000003',
    title: 'Snowman Cold Chain IoT Temperature Logging System',
    stage: 'meeting_completed',
    deal_value: 18000,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
    next_action: 'Draft architecture proposal for sensor data ingestion pipeline',
    probability: 50,
    notes: 'Director of Cold Storage interested in eliminating manual temperature clipboard audits.',
    assigned_to: 'Eleanor Vance (Sales Lead)',
    created_at: new Date(Date.now() - 3600000 * 75).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[2],
    company: DEMO_COMPANIES[2],
  },
  {
    id: 'ea000000-0000-0000-0000-000000000004',
    lead_id: 'be000000-0000-0000-0000-000000000004',
    company_id: 'c1000000-0000-0000-0000-000000000004',
    title: 'V-Trans Driver Electronic Proof-of-Delivery App',
    stage: 'qualified',
    deal_value: 14500,
    currency: 'USD',
    expected_close_date: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    next_action: 'Schedule discovery call with VP Fleet Operations',
    probability: 40,
    notes: 'Opportunity verified. Preparing initial technical capabilities deck.',
    assigned_to: 'Eleanor Vance (Sales Lead)',
    created_at: new Date(Date.now() - 3600000 * 100).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[3],
    company: DEMO_COMPANIES[3],
  },
  {
    id: 'ea000000-0000-0000-0000-000000000005',
    lead_id: 'be000000-0000-0000-0000-000000000005',
    company_id: 'c1000000-0000-0000-0000-000000000005',
    title: 'Taj Goa Luxury Guest Concierge & Dining Portal',
    stage: 'won',
    deal_value: 16500,
    currency: 'USD',
    expected_close_date: new Date().toISOString().split('T')[0],
    next_action: 'Project kickoff sprint and design workshop scheduled in Goa',
    probability: 100,
    notes: 'Commercial agreement executed. Engineering sprint begins this month.',
    assigned_to: 'Vikram Mehta (Tech BD)',
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    updated_at: new Date().toISOString(),
    lead: DEMO_LEADS[4],
    company: DEMO_COMPANIES[4],
  },
];

const DEMO_OUTREACH: OutreachMessage[] = [
  {
    id: 'da000000-0000-0000-0000-000000000001',
    lead_id: 'be000000-0000-0000-0000-000000000001',
    contact_id: 'cb000000-0000-0000-0000-000000000001',
    sequence_number: 0,
    subject: 'Modernizing cross-docking dispatch workflows at Delhivery',
    body: `Hi Rajesh,\n\nI noticed Delhivery's continued rapid expansion across linehaul hubs in South and West India. At Queenstown Labs, we engineer custom logistics software—specializing in high-throughput cross-docking dispatch and automated API gateways for enterprise freight.\n\nWe recently helped an express freight network cut consignment turnaround time by 34% by eliminating legacy dispatch paper bottlenecks.\n\nWould you be open to a 10-minute introductory call next Tuesday at 3:00 PM IST to explore how our software engineering team in Goa can support Delhivery's operations?\n\nBest regards,\nQueenstown Labs Engineering Team\nPanjim, Goa · India`,
    personalisation_notes: 'Cited linehaul cross-docking automation and hub turnaround times.',
    quality_score: 95,
    status: 'sent',
    scheduled_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    sent_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    provider_message_id: 'msg_delhivery_01',
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
    updated_at: new Date().toISOString(),
    contact: DEMO_CONTACTS[0],
    lead: DEMO_LEADS[0],
  },
  {
    id: 'da000000-0000-0000-0000-000000000002',
    lead_id: 'be000000-0000-0000-0000-000000000002',
    contact_id: 'cb000000-0000-0000-0000-000000000002',
    sequence_number: 0,
    subject: 'Automating airway bill compliance and customer tracking for Blue Dart',
    body: `Hi Sunil,\n\nWith Blue Dart managing extensive air-surface distribution across 35,000+ Indian locations, document verification speed is crucial for high-value freight.\n\nAt Queenstown Labs, our Goa software studio builds specialized logistics portals that automate customs documentation and give corporate shippers real-time milestone visibility without manual ticketing.\n\nCould we share a 3-minute video walkthrough of our dispatch architecture with your technology team this week?\n\nBest regards,\nQueenstown Labs Team`,
    personalisation_notes: 'Addresses 35,000+ location airway bill verification and tracking portals.',
    quality_score: 93,
    status: 'sent',
    scheduled_at: new Date(Date.now() - 3600000 * 55).toISOString(),
    sent_at: new Date(Date.now() - 3600000 * 52).toISOString(),
    provider_message_id: 'msg_bluedart_02',
    created_at: new Date(Date.now() - 3600000 * 58).toISOString(),
    updated_at: new Date().toISOString(),
    contact: DEMO_CONTACTS[1],
    lead: DEMO_LEADS[1],
  },
];

const DEMO_REPLIES: EmailReply[] = [
  {
    id: 'fa000000-0000-0000-0000-000000000001',
    outreach_message_id: 'da000000-0000-0000-0000-000000000002',
    contact_id: 'cb000000-0000-0000-0000-000000000002',
    from_email: 's.kulkarni@bluedart.com',
    subject: 'Re: Automating airway bill compliance and customer tracking for Blue Dart',
    body: 'Hi, thanks for reaching out. We are actually exploring a refresh of our corporate tracking API and airway bill reconciliation. Can your team share a brief architecture brief and hop on a call this Thursday at 3 PM?',
    provider_message_id: 'rep_bluedart_101',
    classification: 'meeting_request',
    confidence_score: 0.98,
    summary: 'VP of Airway Logistics confirmed active project interest and requested technical call Thursday 3 PM.',
    action_taken: 'Lead promoted to Meeting Requested. Opportunity stage updated.',
    received_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
    contact: DEMO_CONTACTS[1],
  },
  {
    id: 'fa000000-0000-0000-0000-000000000002',
    outreach_message_id: 'da000000-0000-0000-0000-000000000001',
    contact_id: 'cb000000-0000-0000-0000-000000000001',
    from_email: 'r.sharma@delhivery.com',
    subject: 'Re: Modernizing cross-docking dispatch workflows at Delhivery',
    body: 'Interesting timing. Could you send over a brief PDF overview or scope of what your cross-docking platform entails? If it looks promising we can arrange a call with our IT operations manager.',
    provider_message_id: 'rep_delhivery_102',
    classification: 'interested',
    confidence_score: 0.94,
    summary: 'COO requested technical cross-docking platform overview to evaluate with IT team.',
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
    title: 'Meeting Requested by Sunil Kulkarni (Blue Dart)',
    description: 'VP of Airway Logistics requested technical exchange call regarding corporate tracking API.',
    metadata: { classification: 'meeting_request', lead_id: 'be000000-0000-0000-0000-000000000002' },
    created_by: 'system',
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 'act-02',
    activity_type: 'email_sent',
    title: 'Intro Outreach Sent to Delhivery COO',
    description: 'Delivered tailored logistics engineering intro to r.sharma@delhivery.com',
    metadata: { outreach_id: 'da000000-0000-0000-0000-000000000001' },
    created_by: 'system',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: 'act-03',
    activity_type: 'scored',
    title: 'Lead Qualified: Delhivery Supply Chain (Score: 92/100)',
    description: 'Categorized as High Priority enterprise with multi-hub cross-docking opportunity.',
    metadata: { score: 92, level: 'high_priority' },
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
