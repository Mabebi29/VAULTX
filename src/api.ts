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

export function addTransaction(payload: { categoryId: string; amount: number; note?: string; currency?: string }) {
  return request<{ transaction: { id: string; categoryId: string; amount: number; currency: string; note?: string; occurredAt: string }; category: Category }>('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchOnboardingStatus() {
  return request<{ onboarding: { completed: boolean; updatedAt: string } }>('/onboarding')
}

export function setOnboardingCompleted(completed: boolean) {
  return request<{ onboarding: { completed: boolean; updatedAt: string } }>('/onboarding', {
    method: 'PUT',
    body: JSON.stringify({ completed }),
  })
}

type AllocationCategoryPayload = {
  id?: string
  name: string
  type: 'percent' | 'fixed'
  amount?: number
  percent?: number
  spendingCategories?: SpendingCategory[]
}

export function saveAllocation(payload: { amount: number; currency?: string; categories: AllocationCategoryPayload[]; save?: boolean }) {
  return request<unknown>('/allocate', {
    method: 'POST',
    body: JSON.stringify({ ...payload, save: payload.save ?? true }),
  })
}
