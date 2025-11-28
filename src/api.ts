import type { Category, SpendingCategory, Summary } from './types'

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

  // Handle 204 No Content responses
  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export function fetchSummary() {
  return request<Summary>('/summary')
}

export function createCategory(payload: { name: string; percent: number; spendingCategories?: SpendingCategory[] }) {
  return request<{ category: Category }>('/categories', {
    method: 'POST',
    body: JSON.stringify({ ...payload, type: 'percent' }),
  })
}

export function updateCategory(id: string, payload: { name: string; percent: number; spendingCategories?: SpendingCategory[] }) {
  return request<{ category: Category }>('/categories/' + id, {
    method: 'PUT',
    body: JSON.stringify({ ...payload, type: 'percent' }),
  })
}

export function deleteCategory(id: string) {
  return request<void>('/categories/' + id, { method: 'DELETE' })
}

export function updatePaycheck(amount: number, currency?: string) {
  return request<{ paycheck: { amount: number; currency: string; updatedAt: string } }>('/paycheck', {
    method: 'PUT',
    body: JSON.stringify({ amount, currency }),
  })
}
