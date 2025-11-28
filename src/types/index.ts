export type CategoryType = 'fixed' | 'percent'

export type SpendingCategory = 
  | 'bills'
  | 'eating_out'
  | 'education'
  | 'entertainment'
  | 'expenses'
  | 'family_and_friends'
  | 'general'
  | 'groceries'
  | 'health'
  | 'holiday'
  | 'income'
  | 'pets'
  | 'shopping'
  | 'subscriptions'
  | 'transport'

export const SPENDING_CATEGORIES: { value: SpendingCategory; label: string }[] = [
  { value: 'bills', label: 'Bills' },
  { value: 'eating_out', label: 'Eating Out' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'family_and_friends', label: 'Family & Friends' },
  { value: 'general', label: 'General' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'health', label: 'Health' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'income', label: 'Income' },
  { value: 'pets', label: 'Pets' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'transport', label: 'Transport' },
]

export interface Category {
  id: string
  name: string
  type: CategoryType
  amount?: number
  percent?: number
  allocated: number
  spent: number
  remaining: number
  spendingCategories?: SpendingCategory[]
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
