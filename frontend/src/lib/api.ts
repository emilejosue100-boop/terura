const TOKEN_KEY = 'terura_token';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const { body, auth = true, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as T;

  if (response.status === 401 && auth) {
    clearToken();
  }

  return { ok: response.ok, status: response.status, data };
}

export async function apiGet<T = unknown>(path: string, auth = true) {
  return api<T>(path, { method: 'GET', auth });
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
  auth = true
) {
  return api<T>(path, { method: 'POST', body, auth });
}
