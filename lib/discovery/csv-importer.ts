// Queenstown Lead Intelligence - CSV Import & Normalization Engine

import Papa from 'papaparse';
import { z } from 'zod';
import { DiscoveredCompanyInput, extractDomainFromUrl } from './provider';

export const CsvRowSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export interface CsvParseResult {
  validCompanies: DiscoveredCompanyInput[];
  errors: string[];
  totalParsed: number;
}

export function parseCompaniesCsv(csvContent: string): CsvParseResult {
  const parseResult = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/[\s_-]+/g, '_'),
  });

  const validCompanies: DiscoveredCompanyInput[] = [];
  const errors: string[] = [];

  parseResult.data.forEach((row, index) => {
    // Map flexible column variations
    const name = row.company_name || row.company || row.name || row.business_name;
    const website = row.website || row.url || row.company_website || row.domain;
    const industry = row.industry || row.sector || row.category || 'Logistics and Warehousing';
    const country = row.country || row.location_country || 'India';
    const city = row.city || row.location_city || null;
    const address = row.address || row.location || row.street || null;
    const description = row.description || row.about || row.notes || null;

    if (!name || name.trim().length === 0) {
      errors.push(`Row ${index + 2}: Missing required company name.`);
      return;
    }

    const domain = extractDomainFromUrl(website);

    validCompanies.push({
      name: name.trim(),
      website: website ? website.trim() : null,
      domain,
      industry: industry ? industry.trim() : null,
      country: country.trim(),
      city: city ? city.trim() : null,
      address: address ? address.trim() : null,
      description: description ? description.trim() : null,
      discovery_source: 'csv_import',
      source_url: null,
      external_provider_id: `csv_${Date.now()}_${index}`,
    });
  });

  return {
    validCompanies,
    errors,
    totalParsed: parseResult.data.length,
  };
}
