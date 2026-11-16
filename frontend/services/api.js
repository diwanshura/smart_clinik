// Centralised HTTP client for the Express backend (fetch based, no extra dependency).
// Every service in /services goes through `api` so auth headers, error shapes and
// session-expiry handling live in exactly one place.
import { API_URL } from '@/lib/config';

const TOKEN_KEY = 'clinic_token';
const USER_KEY = 'clinic_user';

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const tokenStore = {
  getToken() {
    try {
      return hasStorage() ? window.localStorage.getItem(TOKEN_KEY) : null;
    } catch {
      return null;
    }
  },
  getUser() {
    try {
      const raw = hasStorage() ? window.localStorage.getItem(USER_KEY) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save(token, user) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* storage unavailable (private mode) - session just won't persist */
    }
  },
  saveUser(user) {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// AuthContext registers a callback here so an expired/invalid token logs the user out.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

function buildUrl(path, query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return `${API_URL}/api${path}${qs ? `?${qs}` : ''}`;
}

function extractMessage(data, status) {
  if (data?.error) return data.error;
  if (Array.isArray(data?.errors) && data.errors[0]?.msg) return data.errors[0].msg;
  if (data?.message) return data.message;
  return `Request failed (${status})`;
}

async function request(method, path, { body, query, auth = true, signal } = {}) {
  if (!API_URL) {
    throw new ApiError('The API address is not configured. Set NEXT_PUBLIC_API_URL.');
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? tokenStore.getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Please check your connection and try again.');
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    // A 401 on an authenticated call means the token is missing/expired -> sign out.
    if (res.status === 401 && token && unauthorizedHandler) unauthorizedHandler();
    throw new ApiError(extractMessage(data, res.status), { status: res.status, data });
  }

  return data;
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body: body ?? {} }),
  put: (path, body, options) => request('PUT', path, { ...options, body: body ?? {} }),
  delete: (path, options) => request('DELETE', path, options),
};

/** Turn anything thrown into a short message that is safe to show to a person. */
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err instanceof ApiError && err.message) return err.message;
  return fallback;
}
