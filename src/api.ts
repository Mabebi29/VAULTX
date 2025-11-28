import type { Category, Summary } from './types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = (body as { error?: string }).error || res.statusText
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export function fetchSummary() {
  return request<Summary>('/summary')
}

export function createCategory(payload: { name: string; amount: number }) {
  return request<{ category: Category }>('/categories', {
    method: 'POST',
    body: JSON.stringify({ ...payload, type: 'fixed' }),
  })
}

export function updateCategory(id: string, payload: { name: string; amount?: number; percent?: number; type: 'fixed' | 'percent' }) {
  return request<{ category: Category }>('/categories/' + id, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(id: string) {
  return request<void>('/categories/' + id, { method: 'DELETE' })
}
