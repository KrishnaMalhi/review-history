import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const API_ERROR_EVENT = 'reviewhistory:api-error';
export const SESSION_EXPIRED_EVENT = 'reviewhistory:session-expired';

const ACCESS_TOKEN_STORAGE_KEY = 'reviewhistory:web:access-token';

function readStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

let accessToken: string | null = readStoredAccessToken();

export type ApiClientError = Error & {
  status?: number;
  code?: string;
  details?: unknown;
  requestId?: string;
  isApiClientError: true;
  raw?: unknown;
};

type ApiEnvelopeError = {
  message?: string;
  code?: string;
  details?: unknown;
  requestId?: string;
};

type ApiEnvelope = {
  message?: string;
  error?: ApiEnvelopeError | string;
};

function extractErrorFromPayload(payload: unknown): ApiEnvelopeError {
  if (!payload || typeof payload !== 'object') return {};
  const env = payload as ApiEnvelope;
  if (typeof env.error === 'string') return { message: env.error };
  if (env.error && typeof env.error === 'object') return env.error;
  return { message: env.message };
}

function buildErrorMessage(status: number | undefined, extracted: ApiEnvelopeError): string {
  if (Array.isArray(extracted.details) && extracted.details.length > 0) {
    return String(extracted.details[0]);
  }
  if (extracted.message) return extracted.message;
  if (status === 401) return 'Session expired. Please log in again.';
  if (status === 403) return 'You are not authorized to perform this action.';
  if (status === 404) return 'Requested resource was not found.';
  if (status === 429) return 'Too many requests. Please try again shortly.';
  return 'Request failed. Please try again.';
}

function toApiClientError(error: unknown): ApiClientError {
  if ((error as ApiClientError)?.isApiClientError) {
    return error as ApiClientError;
  }
  if (!axios.isAxiosError(error)) {
    const fallback = new Error('Unexpected error occurred.') as ApiClientError;
    fallback.isApiClientError = true;
    fallback.raw = error;
    return fallback;
  }

  const status = error.response?.status;
  const extracted = extractErrorFromPayload(error.response?.data);
  const message = buildErrorMessage(status, extracted);
  const normalized = new Error(message) as ApiClientError;
  normalized.status = status;
  normalized.code = extracted.code;
  normalized.details = extracted.details;
  normalized.requestId = extracted.requestId;
  normalized.isApiClientError = true;
  normalized.raw = error;
  return normalized;
}

function emitWindowEvent(name: string, detail: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed.'): string {
  const normalized = toApiClientError(error);
  return normalized.message || fallback;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures and continue with in-memory token.
  }
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  setAccessToken(null);
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      originalRequest?.url &&
      !String(originalRequest.url).includes('/auth/refresh') &&
      !String(originalRequest.url).includes('/auth/login') &&
      !String(originalRequest.url).includes('/auth/register') &&
      !String(originalRequest.url).includes('/auth/verify-email-otp')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        const normalizedRefresh = toApiClientError(refreshError);
        processQueue(normalizedRefresh, null);
        clearAccessToken();
        emitWindowEvent(SESSION_EXPIRED_EVENT, { message: 'Your session has expired. Please log in again.' });
        return Promise.reject(normalizedRefresh);
      } finally {
        isRefreshing = false;
      }
    }

    const normalized = toApiClientError(error);
    emitWindowEvent(API_ERROR_EVENT, {
      message: normalized.message,
      status: normalized.status,
      code: normalized.code,
    });
    return Promise.reject(normalized);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get(url, { params });
  return data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.post(url, body);
  return data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await api.patch(url, body);
  return data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const { data } = await api.delete(url);
  return data.data;
}
