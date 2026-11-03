# Queenstown Labs — Lead Intelligence Platform

> Autonomous B2B Client Acquisition, Gemini AI Qualification & Outbound Sales Engine for **Queenstown Labs**

![Queenstown Labs](https://img.shields.io/badge/Queenstown-Lead%20Intelligence-000000?style=for-the-badge&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel Autopilot](https://img.shields.io/badge/Vercel-Cloud%20Autopilot-black?style=for-the-badge&logo=vercel)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google)

---

## 1. Executive Summary

**Queenstown Lead Intelligence** is the automated, cloud-native client acquisition and market intelligence engine of **[Queenstown Labs](https://queenstown-labs-web.vercel.app/)**—a software studio based in Goa, India, designing and engineering digital products, SaaS platforms, and operational AI systems.

The dashboard interface has been custom-crafted to mirror the exact Swiss minimalist aesthetic, typography (`Inter` / `Inter Tight`), hairline borders, and glassmorphism of Queenstown Labs' official startup website.

The platform executes the full client acquisition lifecycle autonomously 24/7 on Vercel Serverless & Supabase without requiring local servers:
1. **Multi-Source Discovery**: Search companies via Google Places API, CSV ingestion, and manual registration with domain deduplication.
2. **AI Intelligence Researcher**: Scrapes public landing pages, sandboxes untrusted input, and extracts verified business facts vs. digital modernization opportunities.
3. **100-Point Lead Scoring**: Objective 5-dimensional qualification scoring (Industry Relevance 25, Software Opportunity 25, Business Suitability 20, Evidence Quality 15, Contact Reachability 15).
4. **Tailored Outreach Writer**: Generates concise, grounded 80–130 word B2B introduction emails referencing real operational workflows.
5. **Human Approval & Safeguards**: Mandatory review queue, global sending kill switch, and strict daily volume limits.
6. **Follow-Up Sequence Automation**: 3-touch sequence with automatic cancellation upon response.
7. **Intent Classifier & Reply Processing**: Gemini AI intent detection coupled with deterministic unsubscribe & bounce suppression.
8. **13-Stage CRM Pipeline & Kanban**: Track deals from initial discovery to Won/Lost with deal values, close dates, and proposal generation.
9. **Interactive Proposal Generator**: Generate structured commercial PDF proposals on demand.
10. **24/7 Cloud Autopilot**: Serverless cron routes running on Vercel & cron-job.org with Discord and Telegram dispatchers.

---

## 2. Technology Architecture

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Queenstown Studio Design System, Lucide Icons, Recharts, React Hook Form, Zod.
- **Backend & Database**: Next.js Serverless Route Handlers, Supabase PostgreSQL, Row-Level Security, Concurrency-Safe Stored Functions (`FOR UPDATE SKIP LOCKED`).
- **Autonomous Autopilot**:
  - `GET /api/cron/discovery`: Automated Google Places discovery & Gemini qualification (Every 6h).
  - `GET /api/cron/dispatch`: Autonomous high-priority outreach dispatch (Every 15m).
  - `GET /api/cron/digest`: Daily executive briefing & channel broadcast (Daily 09:00 UTC).
- **Artificial Intelligence**: Google Gemini API (`gemini-2.5-flash`), structured JSON outputs with Zod validation.
- **Integrations**: Google Places API, Gmail OAuth2 API, Telegram Bot API, Discord Webhook, jsPDF.

---

## 3. Getting Started & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- Supabase PostgreSQL project

### Installation
```bash
# Clone repository
git clone https://github.com/ByteLounge/QS-Lead-Intelligence.git
cd QS-Lead-Intelligence

# Install dependencies
npm install

# Run database migrations
npm run migrate # or apply database/migrations/ via Supabase SQL Editor

# Start local Next.js dev server
npm run dev
```

Visit `http://localhost:3000` to access the studio dashboard.

---

## 4. Verification & Testing

```bash
# Type check
npm run typecheck

# Unit & integration test suite
npm test

# Production build
npm run build
```

---

## 5. Production Deployment

The platform is deployed live on Vercel:
- **Production Dashboard**: `https://queenstownlabslead.vercel.app/`
- **Main Startup Website**: `https://queenstown-labs-web.vercel.app/`
- **GitHub Repository**: `https://github.com/ByteLounge/QS-Lead-Intelligence`
