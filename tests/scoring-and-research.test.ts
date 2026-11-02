import { describe, it, expect } from 'vitest';
import {
  ScoreComponentsSchema,
  ResearchAnalysisSchema,
  OutreachEmailSchema,
  analyzeCompanyIntelligence,
} from '@/lib/ai/gemini';

describe('AI Intelligence & 100-Point Lead Scoring', () => {
  it('should validate score components matching the 100-point rubric', () => {
    const validScores = {
      industry_relevance: 25,
      software_opportunity: 25,
      business_suitability: 20,
      evidence_quality: 15,
      contact_reachability: 15,
    };

    const parsed = ScoreComponentsSchema.parse(validScores);
    expect(parsed.industry_relevance).toBe(25);
    expect(parsed.software_opportunity).toBe(25);
    expect(parsed.business_suitability).toBe(20);
    expect(parsed.evidence_quality).toBe(15);
    expect(parsed.contact_reachability).toBe(15);

    const sum =
      parsed.industry_relevance +
      parsed.software_opportunity +
      parsed.business_suitability +
      parsed.evidence_quality +
      parsed.contact_reachability;
    expect(sum).toBe(100);
  });

  it('should reject score components exceeding dimension limits', () => {
    const invalidScores = {
      industry_relevance: 30, // Max 25
      software_opportunity: 25,
      business_suitability: 20,
      evidence_quality: 15,
      contact_reachability: 15,
    };

    expect(() => ScoreComponentsSchema.parse(invalidScores)).toThrow();
  });

  it('should analyze company intelligence and produce schema-valid results', async () => {
    const analysis = await analyzeCompanyIntelligence({
      companyName: 'Apex Cold Chain Logistics',
      industry: 'Logistics and Warehousing',
      country: 'India',
      city: 'Bengaluru',
      scrapedContent:
        'Apex Cold Chain operates 20 temperature controlled vehicles and 3 regional cold store hubs.',
    });

    expect(analysis.total_score).toBeGreaterThanOrEqual(0);
    expect(analysis.total_score).toBeLessThanOrEqual(100);
    expect(analysis.verified_facts.length).toBeGreaterThan(0);
    expect(analysis.recommended_solution).toBeDefined();
    expect(analysis.research_status).toBe('completed');
  });

  it('should correctly format personalized outreach within word length constraints', () => {
    const validOutreach = {
      subject: 'Apex Logistics - Cold Chain Fleet Software Architecture',
      body: 'Hi Rajesh,\n\nI noticed Apex Cold Chain operations across Karnataka. Queenstown Labs builds bespoke inventory tracking and driver dispatch portals.\n\nWe recently helped an analogous regional distributor eliminate manual manifests and reduce dispatch latency by 40%.\n\nWould you be open to a brief 10-minute technical exchange next Tuesday?\n\nBest regards,\nEngineering Team\nQueenstown Labs',
      personalisation_rationale: 'Focuses on regional cold chain and dispatch bottleneck.',
      quality_score: 92,
      word_count: 58,
    };

    const parsed = OutreachEmailSchema.parse(validOutreach);
    expect(parsed.quality_score).toBe(92);
    expect(parsed.subject).toBe(validOutreach.subject);
  });
});
