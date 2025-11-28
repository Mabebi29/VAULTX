export type CategoryType = 'fixed' | 'percent'

export interface Category {
  id: string
  name: string
  type: CategoryType
  amount?: number
  percent?: number
  allocated: number
  spent: number
  remaining: number
}

export interface Alert {
  id: string
  kind: 'near_budget' | 'over_budget'
  severity: 'warning' | 'critical'
  currency: string
  categoryId: string
  categoryName: string
  allocated: number
  spent: number
  remaining: number
  percentUsed: number
  message: string
  updatedAt: string
}

export interface Paycheck {
  amount: number
  currency: string
  updatedAt: string
}

export interface Summary {
  currency: string
  paycheck: Paycheck | null
  allocatedTotal: number
  spentTotal: number
  budgetUsedPercent: number
  leftoverBudget: number
  unallocated: number
  alerts: Alert[]
  categories: Category[]
}
