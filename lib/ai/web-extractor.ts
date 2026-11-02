// Queenstown Lead Intelligence - Safe Web Content Extractor
// Enforces request timeouts, domain restrictions, SSRF prevention, and content-size limits

export interface ScrapedPageResult {
  url: string;
  title: string;
  metaDescription: string;
  content: string;
  error?: string;
}

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./, // AWS / GCP metadata
  /^metadata\.google\.internal$/i,
  /^::1$/,
];

export function isSafePublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    const hostname = parsed.hostname;
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function fetchAndExtractWebContent(
  targetUrl: string,
  timeoutMs: number = 10000,
  maxSizeBytes: number = 512 * 1024
): Promise<ScrapedPageResult> {
  if (!isSafePublicUrl(targetUrl)) {
    return {
      url: targetUrl,
      title: '',
      metaDescription: '',
      content: '',
      error: 'Invalid or restricted private network address blocked by security policy.',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 QueenstownBot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timer);

    if (!response.ok) {
      return {
        url: targetUrl,
        title: '',
        metaDescription: '',
        content: '',
        error: `HTTP Error ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return {
        url: targetUrl,
        title: '',
        metaDescription: '',
        content: '',
        error: `Unsupported content-type: ${contentType}`,
      };
    }

    // Read response with size cap
    const arrayBuffer = await response.arrayBuffer();
    const limitedBuffer = arrayBuffer.slice(0, maxSizeBytes);
    const decoder = new TextDecoder('utf-8');
    const rawHtml = decoder.decode(limitedBuffer);

    // Extract title
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta description
    const descMatch =
      rawHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      rawHtml.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : '';

    // Strip scripts, styles, iframes, svgs, html comments
    let sanitized = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to 4,000 characters for token conservation and safety
    sanitized = sanitized.substring(0, 4000);

    return {
      url: targetUrl,
      title,
      metaDescription,
      content: sanitized,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : String(err);
    return {
      url: targetUrl,
      title: '',
      metaDescription: '',
      content: '',
      error: `Network/Extraction exception: ${message}`,
    };
  }
}
