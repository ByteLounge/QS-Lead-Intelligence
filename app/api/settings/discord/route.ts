// Queenstown Lead Intelligence - Discord Webhook Configuration & Test API

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/client';
import { getDiscordWebhookUrl, sendDiscordNotification } from '@/lib/notifications/discord';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = await getDiscordWebhookUrl();
    const isConfigured = !!url && url.startsWith('https://discord.com/api/webhooks/');
    
    // Mask URL for security
    let maskedUrl = '';
    if (url && url.length > 20) {
      maskedUrl = url.substring(0, 38) + '...' + url.substring(url.length - 6);
    }

    return NextResponse.json({
      configured: isConfigured,
      maskedUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhook_url, test } = body;

    if (webhook_url && !webhook_url.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json(
        { error: 'Invalid Discord Webhook URL. It must begin with https://discord.com/api/webhooks/' },
        { status: 400 }
      );
    }

    // Save in Supabase system_settings if configured
    if (isSupabaseConfigured() && webhook_url) {
      await supabaseAdmin.from('system_settings').upsert({
        key: 'discord_settings',
        value: { webhook_url, updated_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      });
    }

    // If test flag requested, send a test embed to verify
    if (test) {
      const activeUrl = webhook_url || (await getDiscordWebhookUrl());
      if (!activeUrl) {
        return NextResponse.json({ error: 'No Discord webhook URL configured.' }, { status: 400 });
      }

      const success = await sendDiscordNotification({
        title: '🛰️ Queenstown Lead Bot: Webhook Verified',
        message: 'Your Discord channel is successfully linked to Queenstown Lead Intelligence! You will receive daily autonomous client acquisition alerts here.',
        level: 'success',
        fields: [
          { name: 'App & Website Discovery', value: 'Active (Daily 06:00 UTC)', inline: true },
          { name: 'Cold Outreach Pipeline', value: 'Active & Safeguarded', inline: true },
          { name: 'Executive Digest', value: 'Daily 18:00 UTC', inline: true },
          { name: 'Dashboard', value: '[queenstownlabslead.vercel.app](https://queenstownlabslead.vercel.app)', inline: false },
        ],
        webhookUrl: activeUrl,
      });

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to deliver message to Discord. Please ensure the webhook URL is valid and channel is active.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: test ? 'Discord test alert delivered successfully!' : 'Discord webhook configuration saved.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
