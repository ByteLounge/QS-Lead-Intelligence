# Queenstown Lead Intelligence - n8n Automation Setup

## 1. Quickstart with Docker Compose

An isolated n8n Community Edition deployment is bundled in the repository:

```bash
cd n8n
docker compose up -d
```

Access the n8n UI at: `http://localhost:5678`

## 2. Environment Variables Configuration

Copy `.env.example` in root or specify environment variables in `n8n/docker-compose.yml`:

```env
N8N_ENCRYPTION_KEY=queenstown_secure_key_1234567890abcdef
GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Importing Workflows

All workflows are located in `n8n/workflows/`:

1. In n8n UI, navigate to **Workflows** -> **Import from File**.
2. Import the workflows in numerical sequence:
   - `WF-01_Lead_Discovery_Engine.json`: Discovers businesses via Google Places API and deduplicates into Supabase.
   - `WF-02_Business_Intelligence_Agent.json`: Scrapes websites, calls Gemini 1.5 Flash for grounded architecture research, and computes 100-pt lead scores.
   - `WF-03_Contact_Qualification_Outreach.json`: Discovers contact points, writes tailored 80-130 word intro emails, and queues drafts for human approval.
   - `WF-04_Email_Delivery_Followups.json`: Atomically claims approved messages via `claim_eligible_outbound_messages()`, enforces daily limits, dispatches via Gmail API, and schedules sequence follow-ups.
   - `WF-05_Reply_Conversation_Manager.json`: Processes incoming replies, applies deterministic opt-out filters, classifies intent with Gemini, auto-cancels follow-ups, and promotes leads.
   - `WF-06_CRM_Reporting.json`: Aggregates daily KPI metrics and posts an executive briefing to Telegram.

## 4. Configuring Credentials in n8n

Inside n8n:
1. **Postgres Credential**:
   - Host: Your Supabase host (e.g. `db.your-project.supabase.co`) or Direct Supabase Connection
   - Port: `5432` or `6543` (transaction pooler)
   - User: `postgres`
   - Database: `postgres`
   - SSL: Require
2. **Telegram Credential**:
   - Access Token: `${TELEGRAM_BOT_TOKEN}`
3. **HTTP Header Auth** (for Supabase REST API fallback):
   - Header: `apikey` = `${SUPABASE_SERVICE_ROLE_KEY}`
