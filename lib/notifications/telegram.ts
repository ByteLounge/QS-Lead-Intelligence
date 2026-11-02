// Queenstown Lead Intelligence - Telegram Notification Dispatcher

export interface TelegramAlertPayload {
  title: string;
  message: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}

export async function sendTelegramNotification(alert: TelegramAlertPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const prefix =
    alert.level === 'error'
      ? '🚨 [ERROR]'
      : alert.level === 'warning'
      ? '⚠️ [ALERT]'
      : alert.level === 'success'
      ? '✅ [SUCCESS]'
      : 'ℹ️ [INFO]';

  const formattedText = `*${prefix} ${alert.title}*\n\n${alert.message}`;

  if (!token || !chatId || token.includes('your-telegram')) {
    console.log(`[Telegram Notification Sim] ${alert.title}: ${alert.message}`);
    return true;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'Markdown',
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to dispatch Telegram message:', err);
    return false;
  }
}
