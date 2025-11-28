import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  ShoppingCart,
  PiggyBank,
  CreditCard,
  Gamepad2,
  Utensils,
  Search,
  Plus,
  X,
  Edit2
} from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

interface BudgetCategory {
  id: string
  name: string
  icon: typeof Home
  amount: number
  percentage: number
  isCustom?: boolean
}

const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
]

const defaultCategories: BudgetCategory[] = [
  { id: '1', name: 'Essentials', icon: ShoppingCart, amount: 0, percentage: 0 },
  { id: '2', name: 'Non-essentials', icon: CreditCard, amount: 0, percentage: 0 },
  { id: '3', name: 'Uncategorized', icon: CreditCard, amount: 0, percentage: 0 },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR')
  const [paycheckAmount, setPaycheckAmount] = useState<string>('')
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories)
  const [currencySearch, setCurrencySearch] = useState<string>('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingAmount, setEditingAmount] = useState<string>('')

  const totalSteps = 3
  const progress = ((currentStep + 1) / totalSteps) * 100

  const currency = currencies.find(c => c.code === selectedCurrency) || currencies[0]

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(curr => 
    curr.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  )

  // Auto-allocate when paycheck amount changes
  useEffect(() => {
    if (paycheckAmount && currentStep === 2) {
      const amount = parseFloat(paycheckAmount) || 0
      const defaultPercentages = [50, 20, 30] // Essentials: 50%, Non-essentials: 20%, Uncategorized: 30%
      
      setCategories(prevCategories => {
        const defaultCats = prevCategories.filter(cat => !cat.isCustom)
        const customCats = prevCategories.filter(cat => cat.isCustom)
        
        return [
          ...defaultCats.map((cat, index) => ({
            ...cat,
            percentage: defaultPercentages[index] || 0,
            amount: Math.round(amount * (defaultPercentages[index] || 0) / 100)
          })),
          ...customCats.map(cat => ({
            ...cat,
            amount: Math.round(amount * cat.percentage / 100)
          }))
        ]
      })
    }
  }, [paycheckAmount, currentStep])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save onboarding data
      const onboardingData = {
        completed: true,
        currency: selectedCurrency,
        paycheckAmount: parseFloat(paycheckAmount) || 0,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon.name || 'CreditCard',
          amount: cat.amount,
          percentage: cat.percentage,
          isCustom: cat.isCustom || false
        })),
        completedAt: new Date().toISOString()
      }
      localStorage.setItem('vaultx_onboarding', JSON.stringify(onboardingData))
      localStorage.setItem('vaultx_user_preferences', JSON.stringify({
        currency: selectedCurrency,
        language: 'en',
        notifications: {
          push: true,
          email: true,
          budgetAlerts: true,
          savingsGoals: true
        }
      }))
      
      // Clear old transactions when completing onboarding (fresh start)
      const oldCurrency = localStorage.getItem('vaultx_user_preferences')
      if (oldCurrency) {
        try {
          const oldPrefs = JSON.parse(oldCurrency)
          if (oldPrefs.currency !== selectedCurrency) {
            // Currency changed, clear all transactions
            localStorage.removeItem('vaultx_transactions')
          }
        } catch (e) {
          // If parsing fails, clear transactions to be safe
          localStorage.removeItem('vaultx_transactions')
        }
      }
      
      // Save financial data
      const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0)
      localStorage.setItem('vaultx_user_financial_data', JSON.stringify({
        balance: parseFloat(paycheckAmount) || 0,
        monthlySpending: 0,
        budgetRemaining: (parseFloat(paycheckAmount) || 0) - totalAllocated,
        paycheckAmount: parseFloat(paycheckAmount) || 0
      }))
      
      onComplete()
    }
  }

  const handleSkip = () => {
    // Save onboarding with default values
    const onboardingData = {
      completed: true,
      currency: selectedCurrency,
      paycheckAmount: 0,
      categories: defaultCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon.name || 'CreditCard',
        amount: 0,
        percentage: 0,
        isCustom: false
      })),
      completedAt: new Date().toISOString()
    }
    localStorage.setItem('vaultx_onboarding', JSON.stringify(onboardingData))
      localStorage.setItem('vaultx_user_preferences', JSON.stringify({
        currency: selectedCurrency,
        language: 'en',
        notifications: {
          push: true,
          email: true,
          budgetAlerts: true,
          savingsGoals: true
        }
      }))
      
      // Clear transactions when skipping (fresh start)
      localStorage.removeItem('vaultx_transactions')
      
      // Save financial data with defaults
      localStorage.setItem('vaultx_user_financial_data', JSON.stringify({
        balance: 0,
        monthlySpending: 0,
        budgetRemaining: 0,
        paycheckAmount: 0
      }))
      
      onComplete()
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        icon: CreditCard,
        amount: 0,
        percentage: 0,
        isCustom: true
      }
      setCategories([...categories, newCategory])
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  const handleEditAmount = (id: string, newAmount: number) => {
    updateCategoryAmount(id, newAmount)
    setEditingCategoryId(null)
    setEditingAmount('')
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateCategory = (id: string, percentage: number) => {
    const amount = parseFloat(paycheckAmount) || 0
    setCategories(categories.map(cat => 
      cat.id === id 
        ? { ...cat, percentage: Math.max(0, Math.min(100, percentage)), amount: Math.round(amount * Math.max(0, Math.min(100, percentage)) / 100) }
        : cat
    ))
  }

  const updateCategoryAmount = (id: string, newAmount: number) => {
    const amount = parseFloat(paycheckAmount) || 0
    if (amount > 0) {
      const newPercentage = (newAmount / amount) * 100
      updateCategory(id, newPercentage)
    } else {
      setCategories(categories.map(cat => 
        cat.id === id 
          ? { ...cat, amount: newAmount, percentage: 0 }
          : cat
      ))
    }
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.percentage, 0)
  const canProceed = 
    (currentStep === 0) || // Welcome step - always can proceed
    (currentStep === 1 && selectedCurrency) || // Currency step
    (currentStep === 2 && paycheckAmount && parseFloat(paycheckAmount) > 0 && totalAllocated <= 100) // Allocation step

  return (
    <div className="fixed inset-0 z-50 bg-bg-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-content-secondary">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-content-secondary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-bg-neutral rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-interactive-accent rounded-full"
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="card-elevated p-8 flex flex-col max-h-[85vh]">
          <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome Banner */}
            {currentStep === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-interactive-accent to-interactive-primary flex items-center justify-center"
                  >
                    <Wallet className="w-10 h-10 text-interactive-primary" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-content-primary">
                    Welcome to VaultX! 🎉
                  </h1>
                  <p className="text-lg text-content-secondary">
                    Take control of your finances from day one.
                  </p>
                </div>

                <div className="bg-bg-neutral rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-interactive-accent/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-interactive-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-content-primary mb-1">
                        Set your categories
                      </h3>
                      <p className="text-sm text-content-secondary">
                        Allocate your paycheck to Needs, Wants, and Savings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-interactive-accent/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-interactive-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-content-primary mb-1">
                        Automate your money
                      </h3>
                      <p className="text-sm text-content-secondary">
                        Let SmartPay+ split your income for you instantly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-interactive-accent/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-interactive-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-content-primary mb-1">
                        Track & grow
                      </h3>
                      <p className="text-sm text-content-secondary">
                        Watch your savings goals progress and get helpful spending insights.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-content-secondary">
                  Start your journey to smarter, stress-free budgeting today! 💚
                </p>
              </motion.div>
            )}

            {/* Step 2: Currency Selection */}
            {currentStep === 1 && (
              <motion.div
                key="currency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-content-primary">
                    Choose your currency
                  </h2>
                  <p className="text-content-secondary">
                    Select the currency you'll be using for your budget
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
                  <input
                    type="text"
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    placeholder="Search currency..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-border-neutral rounded-xl focus:outline-none focus:border-interactive-primary bg-bg-neutral text-content-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                  {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => setSelectedCurrency(curr.code)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedCurrency === curr.code
                            ? 'border-interactive-primary bg-interactive-accent/20'
                            : 'border-border-neutral hover:border-interactive-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-content-primary">{curr.code}</p>
                            <p className="text-sm text-content-secondary">{curr.name}</p>
                          </div>
                          <span className="text-2xl font-bold text-interactive-primary">
                            {curr.symbol}
                          </span>
                        </div>
                        {selectedCurrency === curr.code && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-2 flex items-center gap-2 text-interactive-primary"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Selected</span>
                          </motion.div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8 text-content-secondary">
                      No currencies found
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Money Allocation */}
            {currentStep === 2 && (
              <motion.div
                key="allocation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-content-primary">
                    Set up your budget
                  </h2>
                  <p className="text-content-secondary">
                    Enter your paycheck amount and allocate it to categories
                  </p>
                </div>

                {/* Paycheck Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-content-primary">
                    Monthly Paycheck Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-interactive-primary">
                      {currency.symbol}
                    </span>
                    <input
                      type="number"
                      value={paycheckAmount}
                      onChange={(e) => setPaycheckAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-border-neutral rounded-xl focus:outline-none focus:border-interactive-primary"
                    />
                  </div>
                </div>

                {/* Categories */}
                {paycheckAmount && parseFloat(paycheckAmount) > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-content-primary">Allocate your budget</h3>
                      {!showAddCategory && (
                        <button
                          onClick={() => setShowAddCategory(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-neutral hover:bg-interactive-accent/20 text-sm font-medium text-content-primary transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category
                        </button>
                      )}
                    </div>

                    {/* Add Category Form */}
                    {showAddCategory && (
                      <div className="p-4 border-2 border-border-neutral rounded-xl bg-bg-neutral space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-content-primary">New Category</h4>
                          <button
                            onClick={() => {
                              setShowAddCategory(false)
                              setNewCategoryName('')
                            }}
                            className="p-1 rounded hover:bg-bg-screen transition-colors"
                          >
                            <X className="w-4 h-4 text-content-tertiary" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Category name..."
                          className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-screen focus:outline-none focus:border-interactive-primary text-content-primary"
                          autoFocus
                        />
                        <button
                          onClick={handleAddCategory}
                          disabled={!newCategoryName.trim()}
                          className="w-full py-2 px-4 rounded-lg bg-interactive-accent hover:bg-interactive-primary text-interactive-primary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {categories.map((category) => {
                      const Icon = category.icon
                      const isEditing = editingCategoryId === category.id
                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-bg-neutral flex items-center justify-center">
                                <Icon className="w-5 h-5 text-interactive-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-content-primary">{category.name}</p>
                                  {category.isCustom && (
                                    <button
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="p-1 rounded hover:bg-bg-neutral transition-colors"
                                    >
                                      <X className="w-3 h-3 text-sentiment-negative" />
                                    </button>
                                  )}
                                </div>
                                {!isEditing ? (
                                  <p className="text-sm text-content-secondary">
                                    {currency.symbol}{category.amount.toLocaleString()} ({category.percentage.toFixed(1)}%)
                                  </p>
                                ) : (
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      type="number"
                                      value={editingAmount}
                                      onChange={(e) => setEditingAmount(e.target.value)}
                                      placeholder="Amount"
                                      className="w-24 px-2 py-1 rounded border border-border-neutral bg-bg-screen focus:outline-none focus:border-interactive-primary text-sm text-content-primary"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleEditAmount(category.id, parseFloat(editingAmount) || 0)
                                        } else if (e.key === 'Escape') {
                                          setEditingCategoryId(null)
                                          setEditingAmount('')
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleEditAmount(category.id, parseFloat(editingAmount) || 0)}
                                      className="p-1 rounded hover:bg-bg-neutral transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4 text-sentiment-positive" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingCategoryId(null)
                                        setEditingAmount('')
                                      }}
                                      className="p-1 rounded hover:bg-bg-neutral transition-colors"
                                    >
                                      <X className="w-4 h-4 text-content-tertiary" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingCategoryId(category.id)
                                  setEditingAmount(category.amount.toString())
                                }}
                                className="p-2 rounded-lg hover:bg-bg-neutral transition-colors"
                                title="Edit amount"
                              >
                                <Edit2 className="w-4 h-4 text-content-tertiary" />
                              </button>
                            )}
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={category.percentage}
                            onChange={(e) => updateCategory(category.id, Number(e.target.value))}
                            className="w-full h-2 bg-bg-neutral rounded-full appearance-none cursor-pointer
                              [&::-webkit-slider-thumb]:appearance-none
                              [&::-webkit-slider-thumb]:w-4
                              [&::-webkit-slider-thumb]:h-4
                              [&::-webkit-slider-thumb]:rounded-full
                              [&::-webkit-slider-thumb]:bg-interactive-accent
                              [&::-webkit-slider-thumb]:border-2
                              [&::-webkit-slider-thumb]:border-interactive-primary
                              [&::-webkit-slider-thumb]:cursor-pointer"
                          />
                        </div>
                      )
                    })}

                    <div className="pt-4 border-t border-border-neutral">
                      <div className="flex items-center justify-between">
                        <span className="text-content-secondary">Total allocated</span>
                        <span className={`font-semibold ${
                          totalAllocated === 100 
                            ? 'text-sentiment-positive' 
                            : totalAllocated > 100 
                            ? 'text-sentiment-negative' 
                            : 'text-content-primary'
                        }`}>
                          {totalAllocated}%
                        </span>
                      </div>
                      {totalAllocated < 100 && (
                        <p className="text-xs text-content-tertiary mt-1">
                          {currency.symbol}{(parseFloat(paycheckAmount) || 0) * (100 - totalAllocated) / 100} remaining unallocated
                        </p>
                      )}
                      {totalAllocated > 100 && (
                        <p className="text-xs text-sentiment-negative mt-1">
                          You've allocated more than 100%. Please adjust.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          {/* Navigation Buttons - Always visible */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-neutral flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-bg-neutral text-content-primary'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              {currentStep > 0 && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-content-tertiary hover:text-content-primary transition-colors px-2 py-1"
                  title="Skip and set up later"
                >
                  Set up later
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                canProceed
                  ? 'btn-primary'
                  : 'opacity-50 cursor-not-allowed bg-bg-neutral'
              }`}
            >
              {currentStep === totalSteps - 1 ? 'Complete Setup' : 'Continue'}
              {currentStep < totalSteps - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

