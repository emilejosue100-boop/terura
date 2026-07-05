import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
].filter((model): model is string => !!model?.trim());

let aiClient: GoogleGenAI | null = null;

export type GeminiFailureCode =
  | 'missing_key'
  | 'invalid_key'
  | 'quota_exceeded'
  | 'api_error'
  | 'invalid_response';

export class GeminiServiceError extends Error {
  constructor(
    message: string,
    readonly code: GeminiFailureCode,
    readonly status = 503
  ) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

export function getGeminiApiKey(): string | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your-gemini-api-key') {
    return null;
  }
  return apiKey;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiServiceError(
      'GEMINI_API_KEY is not configured in backend/.env',
      'missing_key'
    );
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function isAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;
  return (
    status === 401 ||
    status === 403 ||
    /401|403|UNAUTHENTICATED|invalid authentication|ACCESS_TOKEN_TYPE_UNSUPPORTED|API key not valid|API_KEY_INVALID/i.test(
      message
    )
  );
}

function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;
  return status === 429 || /429|RESOURCE_EXHAUSTED|quota exceeded/i.test(message);
}

function classifyGeminiError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) return error;
  if (isAuthError(error)) {
    return new GeminiServiceError(
      'GEMINI_API_KEY is invalid. Create a Gemini API key at https://aistudio.google.com/apikey (it should start with AIza...) and paste it into backend/.env, then restart the server.',
      'invalid_key',
      401
    );
  }
  if (isQuotaError(error)) {
    return new GeminiServiceError(
      'Gemini API quota exceeded for this project. Wait a minute and retry, or enable billing / use a different API key at https://aistudio.google.com/apikey',
      'quota_exceeded',
      429
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return new GeminiServiceError(
    `Gemini API error: ${message}`,
    'api_error'
  );
}

export async function generateGeminiJson<T>(
  prompt: string,
  label: string
): Promise<T> {
  const client = getGeminiClient();
  let lastError: GeminiServiceError | null = null;

  for (const model of DEFAULT_MODELS) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text || '';
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      if (!cleanText) {
        throw new GeminiServiceError(
          'Gemini returned an empty response',
          'invalid_response'
        );
      }

      return JSON.parse(cleanText) as T;
    } catch (error) {
      const classified = classifyGeminiError(error);
      lastError = classified;
      console.warn(`Gemini ${label} failed on model ${model}:`, classified.message);

      if (classified.code === 'quota_exceeded') {
        continue;
      }
      throw classified;
    }
  }

  throw (
    lastError ??
    new GeminiServiceError('Gemini request failed on all configured models', 'api_error')
  );
}

export async function probeGeminiConnection(): Promise<{
  configured: boolean;
  ok: boolean;
  code?: GeminiFailureCode;
  message?: string;
  model?: string;
}> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      configured: false,
      ok: false,
      code: 'missing_key',
      message: 'GEMINI_API_KEY is not set in backend/.env',
    };
  }

  const client = new GoogleGenAI({ apiKey });

  for (const model of DEFAULT_MODELS) {
    try {
      await client.models.generateContent({
        model,
        contents: 'Reply with exactly: ok',
      });
      return { configured: true, ok: true, model };
    } catch (error) {
      const classified = classifyGeminiError(error);
      if (classified.code === 'quota_exceeded') {
        continue;
      }
      return {
        configured: true,
        ok: false,
        code: classified.code,
        message: classified.message,
        model,
      };
    }
  }

  return {
    configured: true,
    ok: false,
    code: 'quota_exceeded',
    message:
      'Gemini key is valid but free-tier quota is exhausted for all tried models. Wait and retry, or create a new API key with billing enabled.',
  };
}
