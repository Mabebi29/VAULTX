import { Alert, Summary } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || res.statusText || 'Request failed';
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function getSummary(): Promise<Summary> {
  return request<Summary>('/summary');
}

export function getAlerts(): Promise<{ alerts: Alert[] }> {
  return request<{ alerts: Alert[] }>('/alerts');
}

export function updatePaycheck(payload: { amount: number; currency?: string }) {
  return request('/paycheck', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function addTransaction(payload: { categoryId: string; amount: number; note?: string }) {
  return request('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
