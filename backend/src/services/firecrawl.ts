import { Firecrawl } from 'firecrawl';
import { FIRECRAWL_SEARCH_QUERY, RWANDA_FINANCE_SOURCES } from '../config/rwandaSources.js';

const MAX_CONTEXT_CHARS = 8000;

export interface ScrapedSourceChunk {
  url: string;
  label: string;
  markdown: string;
}

function truncateContext(chunks: ScrapedSourceChunk[]): string {
  const parts: string[] = [];
  let total = 0;

  for (const chunk of chunks) {
    const header = `\n\n--- Source: ${chunk.label} (${chunk.url}) ---\n`;
    const body = chunk.markdown.slice(0, 2000);
    const segment = header + body;

    if (total + segment.length > MAX_CONTEXT_CHARS) {
      const remaining = MAX_CONTEXT_CHARS - total;
      if (remaining > 200) {
        parts.push(segment.slice(0, remaining));
      }
      break;
    }

    parts.push(segment);
    total += segment.length;
  }

  return parts.join('').trim();
}

function extractMarkdown(result: unknown): string {
  if (!result || typeof result !== 'object') return '';

  const record = result as Record<string, unknown>;
  if (typeof record.markdown === 'string' && record.markdown.trim()) {
    return record.markdown.trim();
  }

  const nested = record.data;
  if (nested && typeof nested === 'object') {
    const data = nested as Record<string, unknown>;
    if (typeof data.markdown === 'string' && data.markdown.trim()) {
      return data.markdown.trim();
    }
  }

  return '';
}

async function scrapeUrl(
  client: Firecrawl,
  url: string,
  label: string
): Promise<ScrapedSourceChunk | null> {
  try {
    const result = await client.scrape(url, { formats: ['markdown'] });
    const markdown = extractMarkdown(result);

    if (!markdown) {
      console.warn(`Firecrawl scrape returned no markdown for ${url}`);
      return null;
    }

    return { url, label, markdown };
  } catch (error) {
    console.warn(`Firecrawl scrape failed for ${url}:`, error);
    return null;
  }
}

async function searchFallback(client: Firecrawl): Promise<ScrapedSourceChunk[]> {
  try {
    const searchResult = await client.search(FIRECRAWL_SEARCH_QUERY, {
      limit: 5,
      scrapeOptions: { formats: ['markdown'] },
    });

    const raw = searchResult as {
      data?: Array<{ url?: string; title?: string; markdown?: string; description?: string }>;
      web?: Array<{ url?: string; title?: string; markdown?: string; description?: string }>;
    };
    const items = raw.data || raw.web || [];

    return items
      .filter((item) => item.url)
      .map((item) => ({
        url: item.url!,
        label: item.title || item.url!,
        markdown: (item.markdown || item.description || '').trim(),
      }))
      .filter((item) => item.markdown.length > 50);
  } catch (error) {
    console.warn('Firecrawl search fallback failed:', error);
    return [];
  }
}

export async function scrapeRwandaFinanceSources(): Promise<{
  context: string;
  sourceCount: number;
  configured: boolean;
}> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

  if (!apiKey || apiKey === 'your-firecrawl-api-key') {
    console.warn('FIRECRAWL_API_KEY not configured — skipping web scrape');
    return { context: '', sourceCount: 0, configured: false };
  }

  const client = new Firecrawl({ apiKey });

  const scrapeResults = await Promise.all(
    RWANDA_FINANCE_SOURCES.map((source) => scrapeUrl(client, source.url, source.label))
  );

  let chunks = scrapeResults.filter((c): c is ScrapedSourceChunk => c !== null);

  if (chunks.length === 0) {
    console.warn('No scrape results — trying Firecrawl search fallback');
    chunks = await searchFallback(client);
  }

  if (chunks.length === 0) {
    return { context: '', sourceCount: 0, configured: true };
  }

  return {
    context: truncateContext(chunks),
    sourceCount: chunks.length,
    configured: true,
  };
}
