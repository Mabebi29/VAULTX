import { UserPreferences, Transaction } from '../types'

export interface OnboardingData {
  completed: boolean
  currency: string
  paycheckAmount: number
  categories: Array<{
    id: string
    name: string
    icon?: string
    amount: number
    percentage: number
    isCustom?: boolean
  }>
  completedAt: string
}

export const getOnboardingData = (): OnboardingData | null => {
  const data = localStorage.getItem('vaultx_onboarding')
  return data ? JSON.parse(data) : null
}

export const getUserPreferences = (): UserPreferences | null => {
  const data = localStorage.getItem('vaultx_user_preferences')
  return data ? JSON.parse(data) : null
}

export const getCurrency = (): string => {
  const prefs = getUserPreferences()
  const currency = prefs?.currency || 'EUR'
  
  // Check if currency changed - if so, clear transactions
  const lastCurrency = localStorage.getItem('vaultx_last_currency')
  if (lastCurrency && lastCurrency !== currency) {
    // Currency changed, clear all transactions and financial data
    localStorage.removeItem('vaultx_transactions')
    localStorage.removeItem('vaultx_user_financial_data')
  }
  localStorage.setItem('vaultx_last_currency', currency)
  
  return currency
}

export const getCurrencySymbol = (): string => {
  const currency = getCurrency()
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'Fr',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RUB: '₽',
    BRL: 'R$',
    MXN: '$',
    ZAR: 'R',
    SGD: 'S$',
    HKD: 'HK$',
    KRW: '₩',
    NZD: 'NZ$',
    TRY: '₺',
    AED: 'د.إ',
    SAR: '﷼',
  }
  return symbols[currency] || '€'
}

// Developer helper: Reset onboarding
export const resetOnboarding = (): void => {
  localStorage.removeItem('vaultx_onboarding')
  localStorage.removeItem('vaultx_user_preferences')
  localStorage.removeItem('vaultx_user_financial_data')
  localStorage.removeItem('vaultx_transactions')
  // Reload the page to show onboarding again
  window.location.reload()
}

// Get categories from onboarding
export const getOnboardingCategories = (): Array<{
  id: string
  name: string
  icon: string
  allocated: number
  spent: number
  color: string
}> | null => {
  const onboarding = getOnboardingData()
  if (!onboarding || !onboarding.categories) return null
  
  // Get current currency to ensure consistency
  const currentCurrency = getCurrency()
  const onboardingCurrency = onboarding.currency || 'EUR'
  
  // If currency changed, reset transactions and spending
  if (currentCurrency !== onboardingCurrency) {
    // Clear transactions when currency changes
    localStorage.removeItem('vaultx_transactions')
    localStorage.removeItem('vaultx_user_financial_data')
  }
  
  // Calculate spent from transactions (only if currency matches)
  const transactions = currentCurrency === onboardingCurrency ? getCurrentMonthTransactions() : []
  
  return onboarding.categories.map(cat => {
    const spent = currentCurrency === onboardingCurrency 
      ? transactions
          .filter(t => t.category === cat.id && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      : 0
    
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon || 'CreditCard',
      allocated: cat.amount,
      spent: spent,
      color: '#163300' // Default color
    }
  })
}

// User financial data interface
export interface UserFinancialData {
  balance: number
  monthlySpending: number
  budgetRemaining: number
  paycheckAmount: number
}

// Get user financial data from onboarding or return defaults
export const getUserFinancialData = (): UserFinancialData => {
  const onboarding = getOnboardingData()
  if (onboarding) {
    const totalAllocated = onboarding.categories.reduce((sum, cat) => sum + cat.amount, 0)
    return {
      balance: onboarding.paycheckAmount || 0,
      monthlySpending: 0, // Start with 0 spending
      budgetRemaining: onboarding.paycheckAmount - totalAllocated,
      paycheckAmount: onboarding.paycheckAmount
    }
  }
  
  // Return defaults if no onboarding data
  return {
    balance: 0,
    monthlySpending: 0,
    budgetRemaining: 0,
    paycheckAmount: 0
  }
}

// Save user financial data
export const saveUserFinancialData = (data: Partial<UserFinancialData>): void => {
  const currentData = getUserFinancialData()
  const updatedData = { ...currentData, ...data }
  localStorage.setItem('vaultx_user_financial_data', JSON.stringify(updatedData))
}

// Get saved user financial data or calculate from onboarding
export const getSavedUserFinancialData = (): UserFinancialData => {
  const saved = localStorage.getItem('vaultx_user_financial_data')
  if (saved) {
    return JSON.parse(saved)
  }
  return getUserFinancialData()
}

// Transaction management
export const getTransactions = (): Transaction[] => {
  const saved = localStorage.getItem('vaultx_transactions')
  if (saved) {
    const transactions = JSON.parse(saved)
    return transactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }))
  }
  return []
}

export const saveTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): Transaction => {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    date: new Date()
  }
  const updated = [...transactions, newTransaction]
  localStorage.setItem('vaultx_transactions', JSON.stringify(updated))
  return newTransaction
}

export const deleteTransaction = (id: string): void => {
  const transactions = getTransactions()
  const updated = transactions.filter(t => t.id !== id)
  localStorage.setItem('vaultx_transactions', JSON.stringify(updated))
}

// Get current month transactions
export const getCurrentMonthTransactions = (): Transaction[] => {
  const transactions = getTransactions()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  return transactions.filter(t => {
    const tDate = new Date(t.date)
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear
  })
}

// Calculate spending by category from transactions
export const calculateCategorySpending = (categoryId: string): number => {
  const transactions = getCurrentMonthTransactions()
  return transactions
    .filter(t => t.category === categoryId && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

// Calculate total monthly spending
export const calculateMonthlySpending = (): number => {
  const transactions = getCurrentMonthTransactions()
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

// Generate alerts based on current state
export const generateAlerts = (categories: Array<{ id: string; name: string; allocated: number; spent: number }>, currencySymbol: string): Array<{
  id: string
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  time: string
}> => {
  const alerts: Array<{
    id: string
    type: 'warning' | 'danger' | 'success' | 'info'
    title: string
    message: string
    time: string
  }> = []
  
  // Check for overspending
  categories.forEach(cat => {
    if (cat.spent > cat.allocated) {
      const over = cat.spent - cat.allocated
      alerts.push({
        id: `overspend-${cat.id}`,
        type: 'danger',
        title: `${cat.name} budget exceeded`,
        message: `You've spent ${currencySymbol}${over.toLocaleString()} more than your allocated ${cat.name} budget.`,
        time: 'Just now'
      })
    } else if (cat.allocated > 0 && cat.spent >= cat.allocated * 0.9) {
      // Warning at 90% of budget
      const remaining = cat.allocated - cat.spent
      alerts.push({
        id: `warning-${cat.id}`,
        type: 'warning',
        title: `${cat.name} budget warning`,
        message: `You're at ${Math.round((cat.spent / cat.allocated) * 100)}% of your ${cat.name} budget. ${currencySymbol}${remaining.toLocaleString()} remaining.`,
        time: 'Just now'
      })
    }
  })
  
  // Check for savings goals
  const savingsCategory = categories.find(cat => cat.name.toLowerCase().includes('saving'))
  if (savingsCategory && savingsCategory.allocated > 0 && savingsCategory.spent >= savingsCategory.allocated) {
    alerts.push({
      id: 'savings-goal',
      type: 'success',
      title: 'Savings goal reached',
      message: `Your monthly savings target of ${currencySymbol}${savingsCategory.allocated.toLocaleString()} has been met!`,
      time: 'Just now'
    })
  }
  
  // Sort by priority: danger > warning > success > info
  const priority = { danger: 0, warning: 1, success: 2, info: 3 }
  alerts.sort((a, b) => priority[a.type] - priority[b.type])
  
  return alerts
}

// Check if we're in development mode
export const isDevMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
}

// Expose reset function to window for console access (dev only)
if (typeof window !== 'undefined' && isDevMode()) {
  (window as any).resetVaultXOnboarding = resetOnboarding
  console.log('%c🔧 VaultX Dev Tools', 'color: #9FE870; font-weight: bold; font-size: 14px;')
  console.log('%cReset onboarding: resetVaultXOnboarding()', 'color: #868685; font-size: 12px;')
  console.log('%cOr use keyboard shortcut: Ctrl+Shift+R', 'color: #868685; font-size: 12px;')
}

