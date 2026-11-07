-- Migration 003: Add Phone, WhatsApp, and Social Handles for Free Omni-channel Outreach
-- Enables WhatsApp 1-Click (`wa.me`) and Instagram DMs (`ig.me`) at zero cost.

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE public.outreach_messages
ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'email';
