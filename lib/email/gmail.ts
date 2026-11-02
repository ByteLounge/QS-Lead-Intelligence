// Queenstown Lead Intelligence - Gmail OAuth2 & Email Dispatch Engine

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
  threadId?: string;
  inReplyTo?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  providerMessageId?: string;
  threadId?: string;
  error?: string;
}

export async function sendEmailViaGmail(payload: SendEmailPayload): Promise<EmailDispatchResult> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  // Check if real OAuth2 credentials are configured
  if (!clientId || !clientSecret || !refreshToken || clientId.includes('your-gmail')) {
    // Graceful simulated transport for development/demo environment
    console.log(`[Gmail Transport Sim] Dispatched email to: ${payload.to} | Subject: ${payload.subject}`);
    return {
      success: true,
      providerMessageId: `msg_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      threadId: payload.threadId || `thread_sim_${Date.now()}`,
    };
  }

  try {
    // 1. Refresh OAuth2 access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`OAuth token refresh failed with status ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Format RFC 2822 email message
    const utf8Subject = `=?utf-8?B?${Buffer.from(payload.subject).toString('base64')}?=`;
    const messageParts = [
      `From: "${payload.fromName || 'Queenstown Labs'}" <${payload.fromEmail || 'solutions@queenstownlabs.com'}>`,
      `To: ${payload.to}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      payload.body,
    ];

    if (payload.inReplyTo) {
      messageParts.splice(3, 0, `In-Reply-To: ${payload.inReplyTo}`);
      messageParts.splice(4, 0, `References: ${payload.inReplyTo}`);
    }

    const rawMessage = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 3. Dispatch via Gmail REST API
    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
        threadId: payload.threadId,
      }),
    });

    if (!sendRes.ok) {
      const errBody = await sendRes.text();
      throw new Error(`Gmail API send failed: ${sendRes.status} - ${errBody}`);
    }

    const sendData = await sendRes.json();
    return {
      success: true,
      providerMessageId: sendData.id,
      threadId: sendData.threadId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Gmail transmission error:', message);
    return {
      success: false,
      error: message,
    };
  }
}
