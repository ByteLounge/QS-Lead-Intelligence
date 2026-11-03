// Queenstown Lead Intelligence - Discord Webhook Notification Dispatcher
// Dispatches rich embeds for new lead discoveries, app/website gap assessments,
// outreach email dispatches, and daily executive pipeline briefings.

import { supabaseAdmin, isSupabaseConfigured } from '../supabase/client';

export interface DiscordAlertPayload {
  title: string;
  message: string;
  level?: 'info' | 'warning' | 'error' | 'success';
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  webhookUrl?: string;
}

const LEVEL_COLORS = {
  info: 0x3b82f6, // Blue
  success: 0x10b981, // Emerald Green
  warning: 0xf59e0b, // Amber
  error: 0xef4444, // Red
};

export async function getDiscordWebhookUrl(): Promise<string | null> {
  const envUrl = process.env.DISCORD_WEBHOOK_URL;
  if (envUrl && !envUrl.includes('placeholder') && envUrl.startsWith('https://discord.com/api/webhooks/')) {
    return envUrl;
  }

  // Check Supabase system_settings if available
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'discord_settings')
        .single();

      if (data?.value?.webhook_url && data.value.webhook_url.startsWith('https://discord.com/api/webhooks/')) {
        return data.value.webhook_url;
      }
    } catch {
      // Fallback
    }
  }

  return envUrl || null;
}

export async function sendDiscordNotification(alert: DiscordAlertPayload): Promise<boolean> {
  const webhookUrl = alert.webhookUrl || (await getDiscordWebhookUrl());

  if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.log(`[Discord Notification Sim] ${alert.title}: ${alert.message}`);
    return true;
  }

  try {
    const color = LEVEL_COLORS[alert.level || 'info'];
    const payload = {
      username: 'Queenstown Lead Bot',
      avatar_url: 'https://queenstownlabslead.vercel.app/favicon.ico',
      embeds: [
        {
          title: alert.title,
          description: alert.message,
          color,
          fields: alert.fields || [],
          footer: { text: 'Queenstown Labs • Autonomous Client Acquisition' },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`[Discord Webhook Warning] HTTP ${res.status}: ${res.statusText}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to dispatch Discord webhook alert:', err);
    return false;
  }
}
