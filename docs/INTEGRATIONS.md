# Queenstown Lead Intelligence - External Integrations Guide

## 1. Google Gemini API (AI Intelligence & Writing)

- **Provider**: Google AI Studio / Gemini API
- **Model**: Default `gemini-1.5-flash` (configurable via `GEMINI_MODEL`)
- **Key Capabilities**:
  - Structured JSON outputs conforming to Zod validation schemas.
  - Safe prompt injection mitigation (untrusted scraped text sandboxing).
  - Multi-criteria lead scoring (100-point breakdown).
  - Grounded B2B outreach generation (80-130 words).
  - Inbound reply intent classification.
- **Environment Variable**: `GEMINI_API_KEY`

## 2. Google Places API (Lead Discovery)

- **Provider**: Google Cloud Console
- **Key Capabilities**:
  - High-density query discovery by target industry, country, and city.
  - Returns verified business names, formatted addresses, place IDs, and category tags.
  - Provider deduplication using `(discovery_source, external_provider_id)` constraint.
- **Environment Variable**: `GOOGLE_PLACES_API_KEY`

## 3. Gmail API & OAuth2 (Email Dispatch & Tracking)

- **Provider**: Google Cloud Console (Gmail API enabled)
- **Scopes Required**:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.modify`
- **Environment Variables**:
  - `GMAIL_CLIENT_ID`
  - `GMAIL_CLIENT_SECRET`
  - `GMAIL_REDIRECT_URI`
  - `GMAIL_REFRESH_TOKEN`
- **Sending Safeguards**:
  - Emails are created in `draft` or `pending_approval` state.
  - Sending requires manual human approval when `human_approval_required` is true.
  - Sending is completely halted when the global `sending_enabled` switch is false.

## 4. Telegram Bot API (Operational Alerts)

- **Provider**: Telegram BotFather
- **Alert Types**:
  - High-priority leads qualified (Score >= 80).
  - New outreach drafts queued for human approval.
  - Meeting requests received from prospects.
  - Unsubscribe / opt-out detections.
  - System or delivery errors.
  - Daily performance briefings.
- **Environment Variables**:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
