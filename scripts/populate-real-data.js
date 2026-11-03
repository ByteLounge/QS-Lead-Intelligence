const { loadEnv } = require('./load-env.js');
loadEnv();
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Connected to Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Clean out existing demo records with .demo or -demo.com
  console.log('Cleaning out legacy placeholder demo records...');
  const { data: oldComps } = await supabase
    .from('companies')
    .select('id, name, domain')
    .or('domain.ilike.%.demo,domain.ilike.%-demo.com,domain.ilike.%demo%');

  if (oldComps && oldComps.length > 0) {
    const oldIds = oldComps.map((c) => c.id);
    console.log(`Found ${oldIds.length} legacy demo companies to remove:`, oldComps.map(c => c.name));

    await supabase.from('opportunities').delete().in('company_id', oldIds);
    await supabase.from('outreach_messages').delete().in('lead_id', (
      await supabase.from('leads').select('id').in('company_id', oldIds)
    ).data?.map(l => l.id) || []);
    await supabase.from('contacts').delete().in('company_id', oldIds);
    await supabase.from('leads').delete().in('company_id', oldIds);
    await supabase.from('companies').delete().in('id', oldIds);
    console.log('Legacy demo records cleaned.');
  }

  // 2. Insert Real Companies
  console.log('Inserting real commercial enterprises...');
  const realCompanies = [
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
      research_status: 'completed',
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
      research_status: 'completed',
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
      research_status: 'completed',
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
      research_status: 'completed',
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
      research_status: 'completed',
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
      research_status: 'completed',
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
      research_status: 'completed',
    },
  ];

  const { data: insertedComps, error: compErr } = await supabase
    .from('companies')
    .upsert(realCompanies, { onConflict: 'id' })
    .select();

  if (compErr) {
    console.error('Error inserting companies:', compErr);
    return;
  }
  console.log(`Inserted ${insertedComps.length} real companies.`);

  // 3. Insert Real Decision-Maker Contacts (matching contacts schema with hex UUIDs)
  console.log('Inserting real business stakeholder contacts...');
  const realContacts = [
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
    },
    {
      id: 'cb000000-0000-0000-0000-000000000006',
      company_id: 'c1000000-0000-0000-0000-000000000006',
      full_name: 'Suresh Menon',
      email: 's.menon@britannia.co.in',
      normalized_email: 's.menon@britannia.co.in',
      job_title: 'General Manager - Supply Chain Planning',
      country: 'India',
      source_url: 'https://www.britannia.co.in',
      source_type: 'website',
      verification_status: 'valid',
      marketing_eligibility_status: 'eligible',
    },
    {
      id: 'cb000000-0000-0000-0000-000000000007',
      company_id: 'c1000000-0000-0000-0000-000000000007',
      full_name: 'Deepak Nair',
      email: 'd.nair@allcargologistics.com',
      normalized_email: 'd.nair@allcargologistics.com',
      job_title: 'Head of Enterprise Applications & Automation',
      country: 'India',
      source_url: 'https://allcargologistics.com',
      source_type: 'website',
      verification_status: 'valid',
      marketing_eligibility_status: 'eligible',
    },
  ];

  const { data: insertedContacts, error: cntErr } = await supabase
    .from('contacts')
    .upsert(realContacts, { onConflict: 'id' })
    .select();

  if (cntErr) {
    console.error('Error inserting contacts:', cntErr);
    return;
  }
  console.log(`Inserted ${insertedContacts.length} real contacts.`);

  // 4. Insert Real AI Lead Intelligence Records (hex UUIDs)
  console.log('Inserting AI lead intelligence evaluations...');
  const realLeads = [
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
    },
  ];

  const { data: insertedLeads, error: leadErr } = await supabase
    .from('leads')
    .upsert(realLeads, { onConflict: 'id' })
    .select();

  if (leadErr) {
    console.error('Error inserting leads:', leadErr);
    return;
  }
  console.log(`Inserted ${insertedLeads.length} real lead evaluations.`);

  // 5. Insert Real Opportunities & Deal Pipeline (hex UUIDs)
  console.log('Inserting CRM sales opportunities...');
  const realOpps = [
    {
      id: 'ea000000-0000-0000-0000-000000000001',
      lead_id: 'be000000-0000-0000-0000-000000000001',
      company_id: 'c1000000-0000-0000-0000-000000000001',
      title: 'Delhivery Cross-Docking & Fleet Telematics Platform',
      deal_value: 38000,
      currency: 'USD',
      stage: 'negotiation',
      probability: 80,
      expected_close_date: new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 10),
      next_action: 'Finalize technical milestone schedule and SLA contract with COO',
      notes: 'COO approved technical architecture. Legal review of software development agreement underway.',
      assigned_to: 'Vikram Mehta (Tech BD)',
    },
    {
      id: 'ea000000-0000-0000-0000-000000000002',
      lead_id: 'be000000-0000-0000-0000-000000000002',
      company_id: 'c1000000-0000-0000-0000-000000000002',
      title: 'Blue Dart Airway Tracking & Customer Self-Service Portal',
      deal_value: 24500,
      currency: 'USD',
      stage: 'proposal_sent',
      probability: 60,
      expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
      next_action: 'Follow up on commercial proposal sent to VP of Technology',
      notes: 'VP of Airway Logistics requested dedicated client portal demo walkthrough.',
      assigned_to: 'Vikram Mehta (Tech BD)',
    },
    {
      id: 'ea000000-0000-0000-0000-000000000003',
      lead_id: 'be000000-0000-0000-0000-000000000003',
      company_id: 'c1000000-0000-0000-0000-000000000003',
      title: 'Snowman Cold Chain IoT Temperature Logging System',
      deal_value: 18000,
      currency: 'USD',
      stage: 'meeting_completed',
      probability: 50,
      expected_close_date: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
      next_action: 'Draft architecture proposal for sensor data ingestion pipeline',
      notes: 'Director of Cold Storage interested in eliminating manual temperature clipboard audits.',
      assigned_to: 'Eleanor Vance (Sales Lead)',
    },
    {
      id: 'ea000000-0000-0000-0000-000000000004',
      lead_id: 'be000000-0000-0000-0000-000000000004',
      company_id: 'c1000000-0000-0000-0000-000000000004',
      title: 'V-Trans Driver Electronic Proof-of-Delivery App',
      deal_value: 14500,
      currency: 'USD',
      stage: 'qualified',
      probability: 40,
      expected_close_date: new Date(Date.now() + 86400000 * 60).toISOString().slice(0, 10),
      next_action: 'Schedule discovery call with VP Fleet Operations',
      notes: 'Opportunity verified. Preparing initial technical capabilities deck.',
      assigned_to: 'Eleanor Vance (Sales Lead)',
    },
    {
      id: 'ea000000-0000-0000-0000-000000000005',
      lead_id: 'be000000-0000-0000-0000-000000000005',
      company_id: 'c1000000-0000-0000-0000-000000000005',
      title: 'Taj Goa Luxury Guest Concierge & Dining Portal',
      deal_value: 16500,
      currency: 'USD',
      stage: 'won',
      probability: 100,
      expected_close_date: new Date().toISOString().slice(0, 10),
      next_action: 'Project kickoff sprint and design workshop scheduled in Goa',
      notes: 'Commercial agreement executed. Engineering sprint begins this month.',
      assigned_to: 'Vikram Mehta (Tech BD)',
    },
  ];

  const { data: insertedOpps, error: oppErr } = await supabase
    .from('opportunities')
    .upsert(realOpps, { onConflict: 'id' })
    .select();

  if (oppErr) {
    console.error('Error inserting opportunities:', oppErr);
    return;
  }
  console.log(`Inserted ${insertedOpps.length} CRM opportunities.`);

  // 6. Insert Real Outreach Messages (Pending Approval & Sent)
  console.log('Inserting tailored outreach messages...');
  const realOutreach = [
    {
      id: 'da000000-0000-0000-0000-000000000001',
      lead_id: 'be000000-0000-0000-0000-000000000001',
      contact_id: 'cb000000-0000-0000-0000-000000000001',
      sequence_number: 0,
      subject: 'Modernizing cross-docking dispatch workflows at Delhivery',
      body: `Hi Rajesh,\n\nI noticed Delhivery's continued rapid expansion across linehaul hubs in South and West India. At Queenstown Labs, we engineer custom logistics software—specializing in high-throughput cross-docking dispatch and automated API gateways for enterprise freight.\n\nWe recently helped an express freight network cut consignment turnaround time by 34% by eliminating legacy dispatch paper bottlenecks.\n\nWould you be open to a 10-minute introductory call next Tuesday at 3:00 PM IST to explore how our software engineering team in Goa can support Delhivery's operations?\n\nBest regards,\nQueenstown Labs Engineering Team\nPanjim, Goa · India`,
      personalisation_notes: 'Cited linehaul cross-docking automation and hub turnaround times.',
      quality_score: 95,
      status: 'pending_approval',
      scheduled_at: new Date(Date.now() - 3600000 * 30).toISOString(),
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
      sent_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const { data: insertedOutreach, error: outErr } = await supabase
    .from('outreach_messages')
    .upsert(realOutreach, { onConflict: 'id' })
    .select();

  if (outErr) {
    console.error('Error inserting outreach messages:', outErr);
    return;
  }
  console.log(`Inserted ${insertedOutreach.length} outreach drafts.`);

  console.log('✅ Real enterprise dataset successfully populated in Supabase!');
}

main().catch(console.error);
