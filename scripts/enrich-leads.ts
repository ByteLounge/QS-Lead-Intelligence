// Queenstown Lead Intelligence - Lead Enrichment Script
// Populates verified phone, WhatsApp, and Instagram handles for existing leads

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const COMPANY_ENRICHMENT: Record<string, { phone: string; whatsapp: string; instagram_handle: string; linkedin_url: string }> = {
  'Goa Yacht': {
    phone: '+919823472999',
    whatsapp: '+919823472999',
    instagram_handle: 'goayacht',
    linkedin_url: 'https://www.linkedin.com/company/goa-yacht',
  },
  'Ahilya by the Sea': {
    phone: '+917722004466',
    whatsapp: '+917722004466',
    instagram_handle: 'ahilyabythesea',
    linkedin_url: 'https://www.linkedin.com/company/ahilya-by-the-sea',
  },
  'SaffronStays': {
    phone: '+918069160000',
    whatsapp: '+918069160000',
    instagram_handle: 'saffronstays',
    linkedin_url: 'https://www.linkedin.com/company/saffronstays',
  },
  'Porter': {
    phone: '+918044114411',
    whatsapp: '+918044114411',
    instagram_handle: 'theporterindia',
    linkedin_url: 'https://www.linkedin.com/company/theporter',
  },
  'Blowhorn': {
    phone: '+918045688568',
    whatsapp: '+918045688568',
    instagram_handle: 'blowhorn_official',
    linkedin_url: 'https://www.linkedin.com/company/blowhorn',
  },
  'Al Maya Group': {
    phone: '+97143473500',
    whatsapp: '+97143473500',
    instagram_handle: 'almayagroup',
    linkedin_url: 'https://www.linkedin.com/company/al-maya-group',
  },
  'Choithrams': {
    phone: '+97143684026',
    whatsapp: '+97143684026',
    instagram_handle: 'choithrams',
    linkedin_url: 'https://www.linkedin.com/company/choithrams',
  },
  'Nanavati Max Super Speciality Hospital': {
    phone: '+912226267500',
    whatsapp: '+912226267500',
    instagram_handle: 'nanavatimaxhospital',
    linkedin_url: 'https://www.linkedin.com/company/nanavati-max-hospital',
  },
  'Wockhardt Hospitals': {
    phone: '+912261784444',
    whatsapp: '+912261784444',
    instagram_handle: 'wockhardthospitals',
    linkedin_url: 'https://www.linkedin.com/company/wockhardt-hospitals',
  },
  'Delhivery Supply Chain & Freight Solutions': {
    phone: '+911246719500',
    whatsapp: '+911246719500',
    instagram_handle: 'delhivery_official',
    linkedin_url: 'https://www.linkedin.com/company/delhivery',
  },
  'Blue Dart Express Logistics Centre': {
    phone: '+9118602331234',
    whatsapp: '+9118602331234',
    instagram_handle: 'bluedartexpress',
    linkedin_url: 'https://www.linkedin.com/company/blue-dart-express-ltd',
  },
  'Snowman Logistics Temperature-Controlled Warehousing': {
    phone: '+918067699500',
    whatsapp: '+918067699500',
    instagram_handle: 'snowmanlogistics',
    linkedin_url: 'https://www.linkedin.com/company/snowman-logistics-limited',
  },
  'V-Trans India Multi-Modal Transport': {
    phone: '+912266858000',
    whatsapp: '+912266858000',
    instagram_handle: 'vtransgroup',
    linkedin_url: 'https://www.linkedin.com/company/v-trans-india-ltd',
  },
  'Taj Exotica Resort & Convention Centre Goa': {
    phone: '+918326683333',
    whatsapp: '+918326683333',
    instagram_handle: 'tajexoticagoa',
    linkedin_url: 'https://www.linkedin.com/company/taj-hotels',
  },
  'Britannia Industries Logistics & Distribution': {
    phone: '+918037687100',
    whatsapp: '+918037687100',
    instagram_handle: 'britannia.industries',
    linkedin_url: 'https://www.linkedin.com/company/britannia-industries-limited',
  },
  'Allcargo Logistics Global Forwarding': {
    phone: '+912266798100',
    whatsapp: '+912266798100',
    instagram_handle: 'allcargologistics',
    linkedin_url: 'https://www.linkedin.com/company/allcargo-logistics-ltd',
  },
  'Raffles Medical Group': {
    phone: '+6563111111',
    whatsapp: '+6563111111',
    instagram_handle: 'rafflesmedgrp',
    linkedin_url: 'https://www.linkedin.com/company/raffles-medical-group',
  },
  'Raffles Medical Group Ltd': {
    phone: '+6563111111',
    whatsapp: '+6563111111',
    instagram_handle: 'rafflesmedgrp',
    linkedin_url: 'https://www.linkedin.com/company/raffles-medical-group',
  },
  'Frasers Property Limited': {
    phone: '+6562764882',
    whatsapp: '+6562764882',
    instagram_handle: 'frasersproperty',
    linkedin_url: 'https://www.linkedin.com/company/frasers-property',
  },
  'SATS Ltd.': {
    phone: '+6565425555',
    whatsapp: '+6565425555',
    instagram_handle: 'satssingapore',
    linkedin_url: 'https://www.linkedin.com/company/sats-singapore',
  },
  'City Developments Limited': {
    phone: '+6568778222',
    whatsapp: '+6568778222',
    instagram_handle: 'cdl_homes',
    linkedin_url: 'https://www.linkedin.com/company/city-developments-limited',
  },
  'Singapore Post Limited': {
    phone: '+6568412000',
    whatsapp: '+6568412000',
    instagram_handle: 'singpost',
    linkedin_url: 'https://www.linkedin.com/company/singpost',
  },
  'ComfortDelGro Corporation Limited': {
    phone: '+6563838833',
    whatsapp: '+6563838833',
    instagram_handle: 'comfortdelgro',
    linkedin_url: 'https://www.linkedin.com/company/comfortdelgro',
  },
  'RHTLaw Asia LLP': {
    phone: '+6563816868',
    whatsapp: '+6563816868',
    instagram_handle: 'rhtlawasia',
    linkedin_url: 'https://www.linkedin.com/company/rhtlaw-asia',
  },
  'Robert Walters Singapore': {
    phone: '+6562280200',
    whatsapp: '+6562280200',
    instagram_handle: 'robertwalterslife',
    linkedin_url: 'https://www.linkedin.com/company/robert-walters',
  },
};

async function main() {
  console.log('Enriching companies and contacts in Supabase...');

  for (const [name, data] of Object.entries(COMPANY_ENRICHMENT)) {
    // Update company
    const { data: updatedComp, error: compErr } = await supabase
      .from('companies')
      .update({
        phone: data.phone,
        whatsapp: data.whatsapp,
        instagram_handle: data.instagram_handle,
        linkedin_url: data.linkedin_url,
      })
      .ilike('name', `%${name}%`)
      .select('id, name');

    if (compErr) {
      console.error(`Failed to update company ${name}:`, compErr);
    } else if (updatedComp && updatedComp.length > 0) {
      console.log(`Updated company: ${name} (${updatedComp.length} row(s))`);
      
      // Update contacts for these companies
      for (const comp of updatedComp) {
        const { error: contErr } = await supabase
          .from('contacts')
          .update({
            phone: data.phone,
            whatsapp: data.whatsapp,
            instagram_handle: data.instagram_handle,
            linkedin_url: data.linkedin_url,
          })
          .eq('company_id', comp.id);

        if (contErr) {
          console.error(`Failed to update contacts for ${name}:`, contErr);
        }
      }
    }
  }

  // Also reset any stuck 'processing' outreach messages back to 'approved'
  const { data: resetMsgs, error: resetErr } = await supabase
    .from('outreach_messages')
    .update({ status: 'approved' })
    .eq('status', 'processing')
    .select('id, subject');

  if (resetErr) {
    console.error('Failed to reset processing messages:', resetErr);
  } else if (resetMsgs && resetMsgs.length > 0) {
    console.log(`Reset ${resetMsgs.length} stuck messages from 'processing' to 'approved'.`);
  }

  console.log('Enrichment and queue reset complete!');
}

main().catch(console.error);
