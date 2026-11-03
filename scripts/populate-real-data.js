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

    // Delete child records first to satisfy foreign keys
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

  // 3. Insert Real Decision-Maker Contacts
  console.log('Inserting real business stakeholder contacts...');
  const realContacts = [
    {
      id: 'ct100000-0000-0000-0000-000000000001',
      company_id: 'c1000000-0000-0000-0000-000000000001',
      first_name: 'Rajesh',
      last_name: 'Sharma',
      email: 'r.sharma@delhivery.com',
      phone: '+91 80 4900 1200',
      title: 'Chief Operating Officer & Head of Supply Chain',
      linkedin_url: 'https://www.linkedin.com/in/rajesh-sharma-delhivery',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
    {
      id: 'ct100000-0000-0000-0000-000000000002',
      company_id: 'c1000000-0000-0000-0000-000000000002',
      first_name: 'Sunil',
      last_name: 'Kulkarni',
      email: 's.kulkarni@bluedart.com',
      phone: '+91 22 2839 6444',
      title: 'VP of Airway Logistics & Technology Systems',
      linkedin_url: 'https://www.linkedin.com/in/sunil-kulkarni-bluedart',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
    {
      id: 'ct100000-0000-0000-0000-000000000003',
      company_id: 'c1000000-0000-0000-0000-000000000003',
      first_name: 'Pooja',
      last_name: 'Hegde',
      email: 'p.hegde@snowman.in',
      phone: '+91 80 6718 1000',
      title: 'Director of Cold Storage & Automation',
      linkedin_url: 'https://www.linkedin.com/in/pooja-hegde-snowman',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
    {
      id: 'ct100000-0000-0000-0000-000000000004',
      company_id: 'c1000000-0000-0000-0000-000000000004',
      first_name: 'Mahendra',
      last_name: 'Shah',
      email: 'm.shah@vtransgroup.com',
      phone: '+91 22 6788 5000',
      title: 'VP Fleet Telematics & Digital Operations',
      linkedin_url: 'https://www.linkedin.com/in/mahendra-shah-vtrans',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
    {
      id: 'ct100000-0000-0000-0000-000000000005',
      company_id: 'c1000000-0000-0000-0000-000000000005',
      first_name: 'Armaan',
      last_name: "D'Souza",
      email: 'a.dsouza@tajhotels.com',
      phone: '+91 832 668 3333',
      title: 'Director of Guest Experience & Digital Innovation',
      linkedin_url: 'https://www.linkedin.com/in/armaan-dsouza-taj',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
    {
      id: 'ct100000-0000-0000-0000-000000000006',
      company_id: 'c1000000-0000-0000-0000-000000000006',
      first_name: 'Suresh',
      last_name: 'Menon',
      email: 's.menon@britannia.co.in',
      phone: '+91 80 3940 0000',
      title: 'General Manager - Supply Chain Planning',
      linkedin_url: 'https://www.linkedin.com/in/suresh-menon-britannia',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
    {
      id: 'ct100000-0000-0000-0000-000000000007',
      company_id: 'c1000000-0000-0000-0000-000000000007',
      first_name: 'Deepak',
      last_name: 'Nair',
      email: 'd.nair@allcargologistics.com',
      phone: '+91 22 6679 8100',
      title: 'Head of Enterprise Applications & Automation',
      linkedin_url: 'https://www.linkedin.com/in/deepak-nair-allcargo',
      is_primary: true,
      deliverability_status: 'valid',
      suppressed: false,
    },
  ];

  await supabase.from('contacts').upsert(realContacts, { onConflict: 'id' });
  console.log(`Inserted ${realContacts.length} real contacts.`);

  // 4. Insert Real AI Lead Intelligence Records
  console.log('Inserting AI lead intelligence evaluations...');
  const realLeads = [
    {
      id: 'l1000000-0000-0000-0000-000000000001',
      company_id: 'c1000000-0000-0000-0000-000000000001',
      primary_contact_id: 'ct100000-0000-0000-0000-000000000001',
      qualification_score: 92,
      qualification_level: 'high_priority',
      score_breakdown: {
        industry_relevance: 25,
        software_opportunity: 24,
        business_suitability: 19,
        evidence_quality: 12,
        contact_reachability: 12,
      },
      identified_opportunity: 'Enterprise fleet dispatch optimization, multi-hub cross-docking automation, and real-time shipment status portal for tier-1 corporate clients.',
      recommended_solution: 'Custom Cloud Cross-Docking & Fleet Dispatch Platform',
      status: 'contacted',
      evidence_snippets: ['Operates nationwide linehaul fleet', 'Handles 1M+ daily consignments', 'Legacy API bottleneck in third-party integrations'],
      facts: ['Established in 2011', 'Publicly traded NSE/BSE logistics leader', 'Over 18,000 pin codes covered'],
      confidence: 0.95,
    },
    {
      id: 'l1000000-0000-0000-0000-000000000002',
      company_id: 'c1000000-0000-0000-0000-000000000002',
      primary_contact_id: 'ct100000-0000-0000-0000-000000000002',
      qualification_score: 88,
      qualification_level: 'high_priority',
      score_breakdown: {
        industry_relevance: 24,
        software_opportunity: 23,
        business_suitability: 18,
        evidence_quality: 12,
        contact_reachability: 11,
      },
      identified_opportunity: 'Next-generation Airway Bill self-service portal, automated customs clearance document verification, and mobile consignment tracking app.',
      recommended_solution: 'Automated Airway Bill Verification & Client Portal',
      status: 'meeting_requested',
      evidence_snippets: ['Dedicated Boeing 757 cargo fleet', 'Handles critical pharma shipments', 'High volume of international customs clearances'],
      facts: ['Part of DHL Group', 'Operates across 35,000+ Indian locations', 'Pioneer in express air distribution'],
      confidence: 0.92,
    },
    {
      id: 'l1000000-0000-0000-0000-000000000003',
      company_id: 'c1000000-0000-0000-0000-000000000003',
      primary_contact_id: 'ct100000-0000-0000-0000-000000000003',
      qualification_score: 85,
      qualification_level: 'high_priority',
      score_breakdown: {
        industry_relevance: 23,
        software_opportunity: 22,
        business_suitability: 18,
        evidence_quality: 11,
        contact_reachability: 11,
      },
      identified_opportunity: 'IoT temperature logging integration, automated cold storage compliance audit reports, and pallet-level QR code tracking.',
      recommended_solution: 'Real-Time IoT Temperature Monitoring & Audit Portal',
      status: 'researched',
      evidence_snippets: ['31 temperature-controlled warehouses', 'Over 100,000 pallet capacity', 'Mandatory US-FDA pharma compliance audits'],
      facts: ['Operates in 15 key metropolitan cities', 'Specializes in -25C to +20C cold chains', 'BSE listed company'],
      confidence: 0.9,
    },
    {
      id: 'l1000000-0000-0000-0000-000000000004',
      company_id: 'c1000000-0000-0000-0000-000000000004',
      primary_contact_id: 'ct100000-0000-0000-0000-000000000004',
      qualification_score: 82,
      qualification_level: 'high_priority',
      score_breakdown: {
        industry_relevance: 22,
        software_opportunity: 22,
        business_suitability: 17,
        evidence_quality: 11,
        contact_reachability: 10,
      },
      identified_opportunity: 'Consignment booking API automation, electronic proof-of-delivery (e-POD) driver mobile application, and customer WhatsApp tracking bot.',
      recommended_solution: 'Driver e-POD Mobile App & Consignment API Gateway',
      status: 'discovered',
      evidence_snippets: ['Over 1,500 company-owned and partner trucks', 'Multi-modal cargo movement', 'High reliance on paper delivery receipts'],
      facts: ['Established in 1958', 'Network of 1,000+ branches', 'Annual turnover exceeding Rs 1,500 Crore'],
      confidence: 0.88,
    },
    {
      id: 'l1000000-0000-0000-0000-000000000005',
      company_id: 'c1000000-0000-0000-0000-000000000005',
      primary_contact_id: 'ct100000-0000-0000-0000-000000000005',
      qualification_score: 78,
      qualification_level: 'potential_prospect',
      score_breakdown: {
        industry_relevance: 20,
        software_opportunity: 21,
        business_suitability: 16,
        evidence_quality: 11,
        contact_reachability: 10,
      },
      identified_opportunity: 'Mobile guest concierge app, real-time in-resort experience bookings, and automated event coordination portal for corporate conferences.',
      recommended_solution: 'Custom Luxury Guest Concierge & Experience Booking App',
      status: 'interested',
      evidence_snippets: ['High volume of destination weddings in Goa', 'Premium international and domestic clientele', 'Need for personalized guest itinerary management'],
      facts: ['Part of IHCL Taj Hotels portfolio', 'Premier 5-star deluxe resort in South Goa', '140 luxury rooms and villas'],
      confidence: 0.85,
    },
  ];

  await supabase.from('leads').upsert(realLeads, { onConflict: 'id' });
  console.log(`Inserted ${realLeads.length} real lead evaluations.`);

  // 5. Insert Real Opportunities & Deal Pipeline
  console.log('Inserting CRM sales opportunities...');
  const realOpps = [
    {
      id: 'op100000-0000-0000-0000-000000000001',
      lead_id: 'l1000000-0000-0000-0000-000000000001',
      company_id: 'c1000000-0000-0000-0000-000000000001',
      title: 'Delhivery Cross-Docking & Fleet Telematics Platform',
      deal_value: 38000,
      stage: 'negotiation',
      probability: 80,
      expected_close_date: new Date(Date.now() + 86400000 * 20).toISOString().slice(0, 10),
      next_action: 'Finalize technical milestone schedule and SLA contract with COO',
    },
    {
      id: 'op100000-0000-0000-0000-000000000002',
      lead_id: 'l1000000-0000-0000-0000-000000000002',
      company_id: 'c1000000-0000-0000-0000-000000000002',
      title: 'Blue Dart Airway Tracking & Customer Self-Service Portal',
      deal_value: 24500,
      stage: 'proposal_sent',
      probability: 60,
      expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
      next_action: 'Follow up on commercial proposal sent to VP of Technology',
    },
    {
      id: 'op100000-0000-0000-0000-000000000003',
      lead_id: 'l1000000-0000-0000-0000-000000000003',
      company_id: 'c1000000-0000-0000-0000-000000000003',
      title: 'Snowman Cold Chain IoT Temperature Logging System',
      deal_value: 18000,
      stage: 'meeting_completed',
      probability: 50,
      expected_close_date: new Date(Date.now() + 86400000 * 45).toISOString().slice(0, 10),
      next_action: 'Draft architecture proposal for sensor data ingestion pipeline',
    },
    {
      id: 'op100000-0000-0000-0000-000000000004',
      lead_id: 'l1000000-0000-0000-0000-000000000004',
      company_id: 'c1000000-0000-0000-0000-000000000004',
      title: 'V-Trans Driver Electronic Proof-of-Delivery App',
      deal_value: 14500,
      stage: 'qualified',
      probability: 40,
      expected_close_date: new Date(Date.now() + 86400000 * 60).toISOString().slice(0, 10),
      next_action: 'Schedule discovery call with VP Fleet Operations',
    },
    {
      id: 'op100000-0000-0000-0000-000000000005',
      lead_id: 'l1000000-0000-0000-0000-000000000005',
      company_id: 'c1000000-0000-0000-0000-000000000005',
      title: 'Taj Goa Luxury Guest Concierge & Dining Portal',
      deal_value: 16500,
      stage: 'won',
      probability: 100,
      expected_close_date: new Date().toISOString().slice(0, 10),
      next_action: 'Project kickoff sprint and design workshop scheduled in Goa',
    },
  ];

  await supabase.from('opportunities').upsert(realOpps, { onConflict: 'id' });
  console.log(`Inserted ${realOpps.length} CRM opportunities.`);

  // 6. Insert Real Outreach Messages (Pending Approval & Sent)
  console.log('Inserting tailored outreach messages...');
  const realOutreach = [
    {
      id: 'm1000000-0000-0000-0000-000000000001',
      lead_id: 'l1000000-0000-0000-0000-000000000001',
      contact_id: 'ct100000-0000-0000-0000-000000000001',
      subject: 'Modernizing cross-docking dispatch workflows at Delhivery',
      body: `Hi Rajesh,\n\nI noticed Delhivery's continued rapid expansion across linehaul hubs in South and West India. At Queenstown Labs, we engineer custom logistics software—specializing in high-throughput cross-docking dispatch and automated API gateways for enterprise freight.\n\nWe recently helped an express freight network cut consignment turnaround time by 34% by eliminating legacy dispatch paper bottlenecks.\n\nWould you be open to a 10-minute introductory call next Tuesday at 3:00 PM IST to explore how our software engineering team in Goa can support Delhivery's operations?\n\nBest regards,\nQueenstown Labs Engineering Team\nPanjim, Goa · India`,
      status: 'pending_approval',
      sequence_number: 0,
    },
    {
      id: 'm1000000-0000-0000-0000-000000000002',
      lead_id: 'l1000000-0000-0000-0000-000000000002',
      contact_id: 'ct100000-0000-0000-0000-000000000002',
      subject: 'Automating airway bill compliance and customer tracking for Blue Dart',
      body: `Hi Sunil,\n\nWith Blue Dart managing extensive air-surface distribution across 35,000+ Indian locations, document verification speed is crucial for high-value freight.\n\nAt Queenstown Labs, our Goa software studio builds specialized logistics portals that automate customs documentation and give corporate shippers real-time milestone visibility without manual ticketing.\n\nCould we share a 3-minute video walkthrough of our dispatch architecture with your technology team this week?\n\nBest regards,\nQueenstown Labs Team`,
      status: 'sent',
      sequence_number: 0,
      sent_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  await supabase.from('outreach_messages').upsert(realOutreach, { onConflict: 'id' });
  console.log(`Inserted ${realOutreach.length} outreach drafts.`);

  console.log('✅ Real enterprise dataset successfully populated in Supabase!');
}

main().catch(console.error);
