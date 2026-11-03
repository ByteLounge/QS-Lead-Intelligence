// Queenstown Lead Intelligence - Discord Webhook Notification Dispatcher

export interface DiscordAlertPayload {
  title: string;
  message: string;
  level?: 'info' | 'warning' | 'error' | 'success';
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

const LEVEL_COLORS = {
  info: 0x3b82f6, // Blue
  success: 0x10b981, // Emerald Green
  warning: 0xf59e0b, // Amber
  error: 0xef4444, // Red
};

export async function sendDiscordNotification(alert: DiscordAlertPayload): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
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

    return res.status === 204 || res.ok;
  } catch (err) {
    console.error('Failed to dispatch Discord webhook alert:', err);
    return false;
  }
}
