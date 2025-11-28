// Budget category type
export interface BudgetCategory {
  id: string
  name: string
  icon: string
  allocated: number
  spent: number
  color: string
}

// Transaction type
export interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  date: Date
  type: 'income' | 'expense'
}

// Alert type
export interface Alert {
  id: string
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// Paycheck split configuration
export interface PaycheckSplit {
  id: string
  category: string
  percentage: number
  amount: number
}

// User preferences
export interface UserPreferences {
  currency: string
  language: string
  notifications: {
    push: boolean
    email: boolean
    budgetAlerts: boolean
    savingsGoals: boolean
  }
}

// API response types (for future backend integration)
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

