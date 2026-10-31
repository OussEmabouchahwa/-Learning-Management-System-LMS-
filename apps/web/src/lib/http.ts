import { useAuthStore } from './auth-store';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1';

let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('refresh_failed');
      const json = await res.json() as { data: { accessToken: string } };
      const token: string = json.data.accessToken;
      useAuthStore.getState().setToken(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshToken();
      headers.set('Authorization', `Bearer ${newToken}`);
      return apiFetch<T>(path, { ...init, headers }, false);
    } catch {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      error: { code: 'UNKNOWN', message: 'Unknown error' },
    })) as { error?: { code: string; message: string; fields?: Record<string, string> } };
    throw err.error ?? { code: 'UNKNOWN', message: 'Unknown error' };
  }

  const json = await res.json() as { data: T };
  return json.data;
}

export const http = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
