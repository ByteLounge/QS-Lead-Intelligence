# Queenstown Lead Intelligence

> AI-Powered B2B Client Acquisition & Sales Engineering Platform for **Queenstown Labs**

![Queenstown Labs](https://img.shields.io/badge/Queenstown-Lead%20Intelligence-000000?style=for-the-badge&logo=codeforces&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![n8n](https://img.shields.io/badge/n8n-Community-FF6D5A?style=for-the-badge&logo=n8n)
![Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google)

---

## 1. Executive Summary

**Queenstown Lead Intelligence** is an automated, modular, production-grade client acquisition platform designed for **Queenstown Labs**—a software engineering startup specializing in custom web/mobile applications, inventory management systems, distributor portals, ERP/CRM, and operational automation.

Built to run economically on free tiers and open-source stacks, it automates the full client acquisition lifecycle:
1. **Multi-Source Discovery**: Search companies via Google Places API, CSV file imports, and manual entry with provider deduplication.
2. **AI Intelligence Researcher**: Scrapes public pages safely, sandboxes untrusted input, and generates verified business facts vs. architectural opportunity hypotheses.
3. **100-Point Lead Scoring**: Objective 5-dimensional qualification scoring (Industry 25, Software Opportunity 25, Suitability 20, Evidence 15, Reachability 15).
4. **Tailored Outreach Writer**: Generates grounded 80–130 word B2B introduction emails referencing real operational workflows.
5. **Human Approval & Safeguards**: Mandatory review queue, global sending kill switch, and strict 5-email/day limits.
6. **Follow-Up Sequence Automation**: Configurable 3-touch sequence (Day 0, Day 4, Day 9) with auto-cancellation on response.
7. **Intent Classifier & Reply Processing**: Gemini AI intent detection coupled with deterministic unsubscribe & bounce suppression.
8. **13-Stage CRM Pipeline & Kanban**: Track deals from initial discovery to Won/Lost with deal values, close dates, and proposal generation.
9. **Interactive Proposal Generator**: Generate structured commercial PDF proposals on demand.
10. **Telegram Alerts & n8n Workflows**: 6 production-ready n8n workflows with Docker Compose and real-time alerts.

---

## 2. Technology Architecture

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Hook Form, Zod.
- **Backend & Database**: Next.js Server Route Handlers, Supabase PostgreSQL, Row Level Security, Concurrency-Safe Stored Functions (`FOR UPDATE SKIP LOCKED`).
- **Automation**: n8n Community Edition, Docker Compose, 6 production workflow exports in `n8n/workflows/`.
- **Artificial Intelligence**: Google Gemini API (`gemini-1.5-flash`), structured JSON outputs with Zod validation.
- **Integrations**: Google Places API, Gmail OAuth2 API, Telegram Bot API, jsPDF proposal rendering.

---

## 3. Getting Started & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- Docker & Docker Compose (for n8n & local Postgres)
- Supabase account (or local Supabase CLI)

### Installation
```bash
# Clone repository
git clone https://github.com/queenstown-labs/queenstown-lead-intelligence.git
cd queenstown-lead-intelligence

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Database Migration
Apply the migrations in `database/migrations/` to your Supabase project in order:
1. `database/migrations/001_initial_schema.sql` (Creates all 14 tables, constraints, indexes)
2. `database/migrations/002_functions_and_triggers.sql` (Stored procedures, updated_at triggers, concurrency message claiming)
3. `database/migrations/003_rls_policies.sql` (Row Level Security policies)
4. `database/seed.sql` (Default compliance configuration and system settings)

### Launch Next.js Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Launch n8n Automation Engine
```bash
cd n8n
docker compose up -d
```
Access n8n at [http://localhost:5678](http://localhost:5678) and import the workflows from `n8n/workflows/`.

---

## 4. Documentation Index

- [Architecture Guide](file:///D:/Projects/QS-Lead-Intelligence/docs/ARCHITECTURE.md)
- [Database Schema & Stored Functions](file:///D:/Projects/QS-Lead-Intelligence/docs/DATABASE.md)
- [n8n Automation Setup & Workflows](file:///D:/Projects/QS-Lead-Intelligence/docs/N8N_SETUP.md)
- [External Integrations (Gemini, Places, Gmail, Telegram)](file:///D:/Projects/QS-Lead-Intelligence/docs/INTEGRATIONS.md)
- [Compliance & Sending Safeguards](file:///D:/Projects/QS-Lead-Intelligence/docs/COMPLIANCE.md)

---

## 5. Security & Sending Guardrails

Queenstown Lead Intelligence ships with the **Global Sending Switch DISABLED by default**. Outbound marketing emails cannot be sent until an administrator explicitly:
1. Verifies country-specific marketing compliance policies.
2. Configures approved sender credentials.
3. Toggles `sending_enabled: true` in `/settings/compliance`.

Opt-out requests, bounces, and unsubscribe statements immediately add contacts to the permanent `suppression_list` and abort scheduled follow-up sequences.

---

## 6. License
Proprietary software for Queenstown Labs. All rights reserved.
