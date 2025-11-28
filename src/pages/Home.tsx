import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  Target,
  AlertTriangle,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Gamepad2,
  PiggyBank,
  Bell,
  CreditCard,
  Plus,
  CheckCircle,
  XCircle,
  ChevronDown,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchSummary, createCategory, updateCategory, deleteCategory, updatePaycheck, addTransaction as addTransactionAPI } from '../api'
import type { Alert as ApiAlert, Category, Summary, SpendingCategory } from '../types'
import { SPENDING_CATEGORIES } from '../types'
import { 
  resetOnboarding, 
  isDevMode, 
  getCurrencySymbol,
  getCurrency,
  getOnboardingData,
  getOnboardingCategories,
  getSavedUserFinancialData,
  saveTransaction,
  deleteTransaction,
  calculateCategorySpending,
  calculateMonthlySpending,
  generateAlerts,
  getCurrentMonthTransactions
} from '../utils/storage'

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Gamepad2,
  PiggyBank,
  CreditCard,
  Wallet,
  Bell,
}

const palette = ['#163300', '#2F5711', '#0E0F0C', '#A8200D', '#0F5132', '#1D4ED8', '#92400E']

type UiAlert = {
  id: string
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  time: string
}

type UiCategory = Category & { icon: string; color: string }

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function pickIcon(name: string) {
  const key = Object.keys(iconMap).find((icon) => name.toLowerCase().includes(icon.replace(/[A-Z]/g, ' ').toLowerCase().trim()))
  return key || 'CreditCard'
}

function decorateCategories(categories: Category[]): UiCategory[] {
  return categories.map((cat, idx) => ({
    ...cat,
    icon: pickIcon(cat.name),
    color: palette[idx % palette.length],
  }))
}

function mapAlerts(alerts: ApiAlert[]): UiAlert[] {
  return alerts.map((alert) => ({
    id: alert.id,
    type: alert.severity === 'critical' ? 'danger' : 'warning',
    title: alert.kind === 'over_budget' ? `${alert.categoryName} over budget` : `${alert.categoryName} near limit`,
    message: alert.message,
    time: formatTime(alert.updatedAt),
  }))
}

function StatCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  delay = 0,
}: {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  delay?: number
}) {
  const changeColors = {
    positive: 'text-sentiment-positive',
    negative: 'text-sentiment-negative',
    neutral: 'text-content-secondary',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="card-elevated p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-content-secondary text-sm">{label}</span>
        <div className="w-10 h-10 rounded-xl bg-bg-neutral flex items-center justify-center">
          <Icon className="w-5 h-5 text-interactive-primary" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-content-primary mb-1">{value}</p>
      {change && <p className={`text-sm ${changeColors[changeType]}`}>{change}</p>}
    </motion.div>
  )
}

function EditableAllowanceCard({
  value,
  currency,
  onUpdate,
  delay = 0,
}: {
  value: number
  currency: string
  onUpdate: (amount: number) => Promise<void>
  delay?: number
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value.toString())
  const [pending, setPending] = useState(false)

  const handleSave = async () => {
    const amount = parseFloat(editValue)
    if (!isNaN(amount) && amount > 0) {
      setPending(true)
      await onUpdate(amount)
      setPending(false)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value.toString())
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="card-elevated p-6 relative"
    >
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-bg-neutral transition-colors group"
        >
          <Pencil className="w-4 h-4 text-content-tertiary group-hover:text-interactive-primary transition-colors" />
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-content-secondary text-sm">Monthly Allowance</span>
        <div className="w-10 h-10 rounded-xl bg-bg-neutral flex items-center justify-center">
          <Wallet className="w-5 h-5 text-interactive-primary" />
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-content-tertiary text-lg">{currency === 'USD' ? '$' : currency}</span>
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral
                focus:border-interactive-primary focus:outline-none text-xl font-semibold text-content-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={pending || !editValue || parseFloat(editValue) <= 0}
              className="flex-1 py-2 px-3 rounded-full font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: '#9FE870', color: '#163300' }}
            >
              {pending ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-3 rounded-full font-medium text-sm border border-border-neutral"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-semibold text-content-primary mb-1">
            {formatCurrency(value, currency)}
          </p>
          <p className="text-sm text-content-secondary">Your monthly budget</p>
        </>
      )}
    </motion.div>
  )
}

function BudgetCard({
  category,
  delay = 0,
  onDelete,
  onEdit,
  currency,
  totalUsedPercent,
  monthlyAllowance,
  usedSpendingCategories,
}: {
  category: UiCategory
  delay?: number
  onDelete: (id: string) => Promise<void>
  onEdit: (category: UiCategory) => Promise<void>
  currency: string
  totalUsedPercent: number
  monthlyAllowance: number
  usedSpendingCategories: Set<SpendingCategory>
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editPercent, setEditPercent] = useState((category.percent ?? 0).toString())
  const [editSpendingCategories, setEditSpendingCategories] = useState<SpendingCategory[]>(
    category.spendingCategories || []
  )

  const Icon = iconMap[category.icon] || CreditCard
  const denominator = category.allocated || 1
  const percentage = Math.min((category.spent / denominator) * 100, 100)
  const isOverBudget = category.spent > category.allocated
  const remaining = category.allocated - category.spent
  
  // Calculate available percent (excluding current category's percent)
  const availablePercent = 100 - totalUsedPercent + (category.percent ?? 0)
  const currentEditPercent = parseFloat(editPercent) || 0
  const isPercentValid = currentEditPercent > 0 && currentEditPercent <= availablePercent

  const handleDelete = async () => {
    setPending(true)
    await onDelete(category.id)
    setPending(false)
    setShowDeleteConfirm(false)
    setShowMenu(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = async () => {
    if (editName.trim() && isPercentValid) {
      setPending(true)
      await onEdit({
        ...category,
        name: editName.trim(),
        percent: currentEditPercent,
        spendingCategories: editSpendingCategories,
      })
      setPending(false)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(category.name)
    setEditPercent((category.percent ?? 0).toString())
    setEditSpendingCategories(category.spendingCategories || [])
    setIsEditing(false)
  }

  const toggleSpendingCategory = (cat: SpendingCategory) => {
    // Can always deselect, but can only select if not used by another category
    if (editSpendingCategories.includes(cat)) {
      setEditSpendingCategories(prev => prev.filter(c => c !== cat))
    } else if (!usedSpendingCategories.has(cat)) {
      setEditSpendingCategories(prev => [...prev, cat])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5 relative"
    >
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-bg-neutral transition-colors group"
      >
        <Pencil className="w-4 h-4 text-content-tertiary group-hover:text-interactive-primary transition-colors" />
      </button>

      {showMenu && !showDeleteConfirm && !isEditing && (
        <div className="absolute top-10 right-3 bg-white rounded-xl shadow-lg border border-border-neutral z-20 overflow-hidden">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-content-primary hover:bg-bg-neutral flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-sentiment-negative hover:bg-sentiment-negative/10 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white rounded-xl p-5 flex flex-col items-center justify-center z-10">
          <p className="text-content-primary font-medium text-center mb-4">Are you sure?</p>
          <p className="text-content-secondary text-sm text-center mb-4">Delete "{category.name}" category</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 py-2 px-3 rounded-full font-semibold text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#A8200D', color: '#FFFFFF' }}
            >
              Delete
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false)
                setShowMenu(false)
              }}
              className="flex-1 py-2 px-3 rounded-full font-medium text-sm transition-colors"
              style={{ backgroundColor: '#9FE870', color: '#163300' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="absolute inset-0 bg-white rounded-xl p-4 flex flex-col z-10 overflow-y-auto">
          <div className="mb-3">
            <label className="block text-xs font-medium text-content-primary mb-1">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral
                focus:border-interactive-primary focus:outline-none text-sm"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-content-primary mb-1">
              Cap (% of allowance) — {availablePercent.toFixed(0)}% available
            </label>
            <input
              type="number"
              value={editPercent}
              onChange={(e) => setEditPercent(e.target.value)}
              min="1"
              max={availablePercent}
              className={`w-full px-3 py-2 rounded-lg border bg-bg-neutral
                focus:outline-none text-sm ${!isPercentValid && editPercent ? 'border-sentiment-negative' : 'border-border-neutral focus:border-interactive-primary'}`}
            />
            {!isPercentValid && editPercent && (
              <p className="text-xs text-sentiment-negative mt-1">
                {currentEditPercent > availablePercent ? `Max ${availablePercent.toFixed(0)}%` : 'Enter a valid percentage'}
              </p>
            )}
            {monthlyAllowance > 0 && isPercentValid && (
              <p className="text-xs text-content-tertiary mt-1">
                ≈ {formatCurrency((currentEditPercent / 100) * monthlyAllowance, currency)}
              </p>
            )}
          </div>
          <div className="mb-3 flex-1">
            <label className="block text-xs font-medium text-content-primary mb-2">Spending Categories</label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {SPENDING_CATEGORIES.map((cat) => {
                const isSelected = editSpendingCategories.includes(cat.value)
                const isDisabled = !isSelected && usedSpendingCategories.has(cat.value)
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleSpendingCategory(cat.value)}
                    disabled={isDisabled}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-interactive-primary text-white'
                        : isDisabled
                        ? 'bg-bg-neutral text-content-tertiary opacity-50 cursor-not-allowed'
                        : 'bg-bg-neutral text-content-secondary hover:bg-interactive-accent/20'
                    }`}
                    title={isDisabled ? 'Already assigned to another budget category' : ''}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex gap-2 mt-auto pt-2">
            <button
              onClick={handleSaveEdit}
              disabled={pending || !isPercentValid || !editName.trim()}
              className="flex-1 py-2 px-3 rounded-full font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: '#9FE870', color: '#163300' }}
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 py-2 px-3 rounded-full font-medium text-sm border border-border-neutral"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4 pr-6">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${category.color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: category.color }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-bg-neutral text-content-secondary">
            {category.percent ?? 0}%
          </span>
          {isOverBudget && (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-sentiment-negative/10 text-sentiment-negative">
              Over budget
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-content-primary mb-1">{category.name}</h3>
      
      {category.spendingCategories && category.spendingCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {category.spendingCategories.slice(0, 3).map((cat) => (
            <span key={cat} className="px-2 py-0.5 rounded text-xs bg-bg-neutral text-content-tertiary">
              {SPENDING_CATEGORIES.find(c => c.value === cat)?.label || cat}
            </span>
          ))}
          {category.spendingCategories.length > 3 && (
            <span className="px-2 py-0.5 rounded text-xs bg-bg-neutral text-content-tertiary">
              +{category.spendingCategories.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-xl font-bold" style={{ color: isOverBudget ? '#A8200D' : category.color }}>
          {formatCurrency(category.spent, currency)}
        </span>
        <span className="text-content-tertiary text-sm">
          / {formatCurrency(category.allocated, currency)}
        </span>
      </div>

      <div className="h-2 bg-bg-neutral rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2, duration: 0.8 }}
          className="h-full rounded-full"
          style={{ backgroundColor: isOverBudget ? '#A8200D' : category.color }}
        />
      </div>

      <p className="mt-3 text-sm text-content-secondary">
        {isOverBudget ? (
          <span className="text-sentiment-negative font-medium">{formatCurrency(Math.abs(remaining), currency)} over</span>
        ) : (
          <>{formatCurrency(remaining, currency)} remaining</>
        )}
      </p>
    </motion.div>
  )
}

function AddCategoryCard({
  delay = 0,
  onAdd,
  currency,
  availablePercent,
  monthlyAllowance,
  usedSpendingCategories,
}: {
  delay?: number
  onAdd: (name: string, percent: number, spendingCategories: SpendingCategory[]) => Promise<void>
  currency: string
  availablePercent: number
  monthlyAllowance: number
  usedSpendingCategories: Set<SpendingCategory>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [percent, setPercent] = useState('')
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([])
  const [pending, setPending] = useState(false)

  const currentPercent = parseFloat(percent) || 0
  const isPercentValid = currentPercent > 0 && currentPercent <= availablePercent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && isPercentValid) {
      setPending(true)
      await onAdd(name.trim(), currentPercent, spendingCategories)
      setPending(false)
      setName('')
      setPercent('')
      setSpendingCategories([])
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setPercent('')
    setSpendingCategories([])
    setIsEditing(false)
  }

  const toggleSpendingCategory = (cat: SpendingCategory) => {
    // Can always deselect, but can only select if not used by another category
    if (spendingCategories.includes(cat)) {
      setSpendingCategories(prev => prev.filter(c => c !== cat))
    } else if (!usedSpendingCategories.has(cat)) {
      setSpendingCategories(prev => [...prev, cat])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5 min-h-[200px]"
    >
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          disabled={availablePercent <= 0}
          className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border-neutral 
            hover:border-interactive-primary rounded-xl py-8
            hover:bg-bg-neutral transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-xl bg-bg-neutral group-hover:bg-interactive-accent/20 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-6 h-6 text-content-tertiary group-hover:text-interactive-primary transition-colors" />
          </div>
          <span className="font-semibold text-content-tertiary group-hover:text-interactive-primary transition-colors">
            Add Category
          </span>
          {availablePercent > 0 ? (
            <span className="text-xs text-content-tertiary mt-1">{availablePercent.toFixed(0)}% available</span>
          ) : (
            <span className="text-xs text-sentiment-negative mt-1">100% allocated</span>
          )}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="mb-3">
            <label className="block text-sm font-medium text-content-primary mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Savings"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral
                focus:border-interactive-primary focus:outline-none
                text-content-primary placeholder:text-content-tertiary text-sm transition-all"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-content-primary mb-2">
              Cap (% of allowance) — {availablePercent.toFixed(0)}% for savings
            </label>
            <input
              type="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              placeholder="e.g., 20"
              min="1"
              max={availablePercent}
              className={`w-full px-3 py-2 rounded-lg border bg-bg-neutral
                focus:outline-none text-sm ${!isPercentValid && percent ? 'border-sentiment-negative' : 'border-border-neutral focus:border-interactive-primary'}`}
            />
            {!isPercentValid && percent && (
              <p className="text-xs text-sentiment-negative mt-1">
                {currentPercent > availablePercent ? `Max ${availablePercent.toFixed(0)}%` : 'Enter a valid percentage'}
              </p>
            )}
            {monthlyAllowance > 0 && isPercentValid && (
              <p className="text-xs text-content-tertiary mt-1">
                ≈ {formatCurrency((currentPercent / 100) * monthlyAllowance, currency)}
              </p>
            )}
          </div>

          <div className="mb-3 flex-1">
            <label className="block text-sm font-medium text-content-primary mb-2">Spending Categories</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {SPENDING_CATEGORIES.map((cat) => {
                const isSelected = spendingCategories.includes(cat.value)
                const isDisabled = !isSelected && usedSpendingCategories.has(cat.value)
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleSpendingCategory(cat.value)}
                    disabled={isDisabled}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-interactive-primary text-white'
                        : isDisabled
                        ? 'bg-bg-neutral text-content-tertiary opacity-50 cursor-not-allowed'
                        : 'bg-bg-neutral text-content-secondary hover:bg-interactive-accent/20'
                    }`}
                    title={isDisabled ? 'Already assigned to another budget category' : ''}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-row gap-2 mt-auto pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !isPercentValid || pending}
              className="flex-1 py-2.5 px-4 rounded-full font-semibold text-sm transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#9FE870', color: '#163300' }}
            >
              {pending ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 px-4 rounded-full border border-border-neutral 
                text-content-primary font-medium text-sm hover:bg-bg-neutral transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </motion.div>
  )
}

// Dev Tools Modal Component
function DevToolsModal({ 
  categories, 
  currencySymbol, 
  onAddTransaction, 
  onClose,
  onDeleteTransaction
}: { 
  categories: Category[]
  currencySymbol: string
  onAddTransaction: (categoryId: string, amount: number, description: string) => void
  onClose: () => void
  onDeleteTransaction: (transactionId: string) => void
}) {
  const [selectedSpendingCategory, setSelectedSpendingCategory] = useState<SpendingCategory>(SPENDING_CATEGORIES[0]?.value || 'general')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const transactions = getCurrentMonthTransactions()

  // Find the budget category that contains the selected spending category
  const findBudgetCategoryForSpendingCategory = (spendingCat: SpendingCategory): string | null => {
    const budgetCategory = categories.find(cat => 
      cat.spendingCategories && cat.spendingCategories.includes(spendingCat)
    )
    return budgetCategory?.id || null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSpendingCategory && amount && parseFloat(amount) > 0) {
      const budgetCategoryId = findBudgetCategoryForSpendingCategory(selectedSpendingCategory)
      if (budgetCategoryId) {
        onAddTransaction(budgetCategoryId, parseFloat(amount), description || SPENDING_CATEGORIES.find(c => c.value === selectedSpendingCategory)?.label || 'Transaction')
        setAmount('')
        setDescription('')
      } else {
        alert(`No budget category found for "${SPENDING_CATEGORIES.find(c => c.value === selectedSpendingCategory)?.label}". Please assign this spending category to a budget category first.`)
      }
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-content-primary">Dev Tools - Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-neutral transition-colors"
          >
            <X className="w-5 h-5 text-content-tertiary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              Spending Category
            </label>
            <select
              value={selectedSpendingCategory}
              onChange={(e) => setSelectedSpendingCategory(e.target.value as SpendingCategory)}
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral focus:border-interactive-primary focus:outline-none text-content-primary"
            >
              {SPENDING_CATEGORIES.map(cat => {
                const budgetCategory = categories.find(c => 
                  c.spendingCategories && c.spendingCategories.includes(cat.value)
                )
                return (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} {budgetCategory ? `(${budgetCategory.name})` : '(Not assigned)'}
                  </option>
                )
              })}
            </select>
            {!findBudgetCategoryForSpendingCategory(selectedSpendingCategory) && (
              <p className="text-xs text-sentiment-negative mt-1">
                This spending category is not assigned to any budget category. Please assign it first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              Amount ({currencySymbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral focus:border-interactive-primary focus:outline-none text-content-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transaction description"
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral focus:border-interactive-primary focus:outline-none text-content-primary"
            />
          </div>

          <button
            type="submit"
            disabled={!findBudgetCategoryForSpendingCategory(selectedSpendingCategory) || !amount || parseFloat(amount) <= 0}
            className="w-full py-2 px-4 rounded-lg bg-interactive-accent hover:bg-interactive-primary text-interactive-primary font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Transaction
          </button>
        </form>

        <div className="border-t border-border-neutral pt-4">
          <h3 className="font-semibold text-content-primary mb-3">Recent Transactions</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-sm text-content-tertiary text-center py-4">No transactions yet</p>
            ) : (
              transactions.slice().reverse().map(t => {
                const category = categories.find(c => c.id === t.category)
                // Try to find the spending category from description or use category name
                const spendingCategoryLabel = SPENDING_CATEGORIES.find(sc => 
                  sc.label === t.description || 
                  (category?.spendingCategories && category.spendingCategories.includes(sc.value))
                )?.label || t.description || category?.name || 'Unknown'
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-bg-neutral rounded-lg">
                    <div>
                      <p className="font-medium text-content-primary">{spendingCategoryLabel}</p>
                      {category && (
                        <p className="text-xs text-content-tertiary">{category.name}</p>
                      )}
                      <p className="text-xs text-content-tertiary">{formatTimeAgo(t.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-content-primary">{currencySymbol}{t.amount.toLocaleString()}</p>
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-xs text-sentiment-negative hover:underline mt-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function AlertCard({ alert }: { alert: UiAlert }) {
  const config = {
    warning: { icon: AlertTriangle, color: '#0E0F0C', bgColor: 'rgba(237, 200, 67, 0.2)' },
    danger: { icon: XCircle, color: '#A8200D', bgColor: 'rgba(168, 32, 13, 0.1)' },
    success: { icon: CheckCircle, color: '#2F5711', bgColor: 'rgba(47, 87, 17, 0.1)' },
    info: { icon: TrendingUp, color: '#163300', bgColor: 'rgba(22, 51, 0, 0.08)' },
  }
  const { icon: Icon, color, bgColor } = config[alert.type]

  return (
    <div className="card p-4 flex gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bgColor }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-content-primary">{alert.title}</h4>
          <span className="text-xs text-content-tertiary flex-shrink-0">{alert.time}</span>
        </div>
        <p className="text-sm text-content-secondary mt-1">{alert.message}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [categories, setCategories] = useState<UiCategory[]>([])
  const [alerts, setAlerts] = useState<UiAlert[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const summaryRef = useRef<Summary | null>(null)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [showDevTools, setShowDevTools] = useState(false)
  
  // Onboarding/localStorage support
  const currencySymbol = getCurrencySymbol()
  const financialData = getSavedUserFinancialData()
  const [userData, setUserData] = useState({
    name: 'User',
    balance: financialData.balance,
    monthlySpending: financialData.monthlySpending,
    budgetRemaining: financialData.budgetRemaining,
    paycheckAmount: financialData.paycheckAmount
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 2)
  const hasMoreAlerts = alerts.length > 2
  
  // Get currency from summary (API) or onboarding
  const onboardingData = getOnboardingData()
  const onboardingCurrency = onboardingData?.currency || getCurrency()
  const currency = summary?.currency || onboardingCurrency
  
  const alertCount = alerts.filter((a) => a.type === 'danger' || a.type === 'warning').length

  // Get monthly allowance from summary (API) or onboarding
  const monthlyAllowanceFromOnboarding = onboardingData?.paycheckAmount || userData.paycheckAmount || 0
  const monthlyAllowance = summary?.paycheck?.amount || monthlyAllowanceFromOnboarding
  
  // Calculate spent from categories or summary
  const totalSpentFromCategories = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const allowanceSpent = summary?.spentTotal || totalSpentFromCategories
  const allowanceLeft = Math.max(monthlyAllowance - allowanceSpent, 0)
  
  // Calculate total used percentage across all categories
  // If using onboarding, calculate percent from allocated amounts
  const totalUsedPercent = categories.length > 0
    ? categories.reduce((sum, cat) => {
        if (cat.percent !== undefined && cat.percent !== null) {
          return sum + cat.percent
        }
        // Calculate percent from allocated amount if percent not set
        if (monthlyAllowance > 0) {
          return sum + Math.round((cat.allocated / monthlyAllowance) * 100)
        }
        return sum
      }, 0)
    : 0
  const availablePercent = Math.max(100 - totalUsedPercent, 0)
  
  // Get all spending categories used by other budget categories
  const getUsedSpendingCategories = (excludeCategoryId?: string): Set<SpendingCategory> => {
    const used = new Set<SpendingCategory>()
    categories.forEach(cat => {
      if (cat.id !== excludeCategoryId && cat.spendingCategories) {
        cat.spendingCategories.forEach(sc => used.add(sc))
      }
    })
    return used
  }

  const topStats = useMemo(() => {
    // Show stats whether using API or onboarding data
    return [
      {
        label: 'Alerts',
        value: alertCount.toString(),
        change: alertCount > 0 ? 'Needs attention' : 'All good',
        changeType: alertCount > 0 ? ('negative' as const) : ('positive' as const),
        icon: AlertTriangle,
      },
      {
        label: 'Allowance Left',
        value: formatCurrency(allowanceLeft, currency),
        change: allowanceSpent > monthlyAllowance ? 'Over budget' : monthlyAllowance > 0 ? `${((allowanceLeft / monthlyAllowance) * 100).toFixed(0)}% remaining` : '100% remaining',
        changeType: allowanceSpent > monthlyAllowance ? ('negative' as const) : ('positive' as const),
        icon: Target,
      },
      {
        label: 'Allowance Spent',
        value: formatCurrency(allowanceSpent, currency),
        change: monthlyAllowance > 0 ? `${((allowanceSpent / monthlyAllowance) * 100).toFixed(0)}% of allowance` : '0% of allowance',
        changeType: monthlyAllowance > 0 && (allowanceSpent / monthlyAllowance) > 0.85 ? ('negative' as const) : ('neutral' as const),
        icon: TrendingUp,
      },
    ]
  }, [alertCount, allowanceLeft, allowanceSpent, monthlyAllowance, currency])

  async function handleUpdateAllowance(amount: number) {
    setError(null)
    try {
      if (summary) {
        // Using API
        await updatePaycheck(amount, currency)
        await loadData()
      } else {
        // Using onboarding data - update localStorage
        const onboarding = getOnboardingData()
        if (onboarding) {
          const updatedCategories = onboarding.categories.map(cat => ({
            ...cat,
            amount: ((cat.percentage ?? 0) / 100) * amount
          }))
          const updatedOnboarding = {
            ...onboarding,
            paycheckAmount: amount,
            categories: updatedCategories
          }
          localStorage.setItem('vaultx_onboarding', JSON.stringify(updatedOnboarding))
          
          // Update financial data
          const totalAllocated = updatedCategories.reduce((sum, cat) => sum + cat.amount, 0)
          const monthlySpending = calculateMonthlySpending()
          localStorage.setItem('vaultx_user_financial_data', JSON.stringify({
            balance: amount,
            monthlySpending,
            budgetRemaining: amount - totalAllocated,
            paycheckAmount: amount
          }))
          
          loadOnboardingData()
          window.dispatchEvent(new Event('vaultx-storage-change'))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update allowance')
    }
  }

  useEffect(() => {
    summaryRef.current = summary
  }, [summary])

  useEffect(() => {
    loadData()
    
    // Listen for storage changes (when transactions are added/deleted or onboarding is reset)
    const handleStorageChange = () => {
      // Reload data when storage changes
      if (!summaryRef.current) {
        // If using onboarding data, reload it
        loadOnboardingData()
      } else {
        loadData()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom storage events (same-tab updates)
    window.addEventListener('vaultx-storage-change', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('vaultx-storage-change', handleStorageChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper function to load onboarding data
  function loadOnboardingData() {
    const onboarding = getOnboardingData()
    if (onboarding && onboarding.completed) {
      // Convert onboarding categories to Category format
      const onboardingCats = getOnboardingCategories()
      if (onboardingCats && onboardingCats.length > 0) {
        const convertedCategories: Category[] = onboardingCats.map((cat) => {
          // Find the original category data to get percentage
          const originalCat = onboarding.categories.find(c => c.id === cat.id)
          const percent = originalCat?.percentage ?? (onboarding.paycheckAmount > 0 
            ? Math.round((cat.allocated / onboarding.paycheckAmount) * 100)
            : 0)
          const allocated = onboarding.paycheckAmount > 0 && typeof percent === 'number'
            ? Math.round((percent / 100) * onboarding.paycheckAmount)
            : cat.allocated
          
          return {
            id: cat.id,
            name: cat.name,
            type: 'percent' as const,
            allocated,
            spent: cat.spent,
            remaining: allocated - cat.spent,
            percent: percent,
            spendingCategories: cat.spendingCategories || []
          }
        })
        
        const decoratedCats = decorateCategories(convertedCategories)
        setCategories(decoratedCats)
        
        // Generate alerts from onboarding categories
        const generatedAlerts = generateAlerts(convertedCategories, currencySymbol)
        setAlerts(generatedAlerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          time: alert.time
        })))
        
        // Update user data
        const totalBudget = convertedCategories.reduce((sum, cat) => sum + cat.allocated, 0)
        const totalSpent = convertedCategories.reduce((sum, cat) => sum + cat.spent, 0)
        const monthlySpending = calculateMonthlySpending()
        
        setUserData(prev => ({
          ...prev,
          balance: onboarding.paycheckAmount,
          monthlySpending: monthlySpending,
          budgetRemaining: totalBudget - totalSpent,
          paycheckAmount: onboarding.paycheckAmount
        }))
        
        // Set summary to null to indicate we're using onboarding data
        setSummary(null)
        return true
      }
    }
    return false
  }

  // Load data from API or fallback to onboarding
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      // Try to load from API first
      const data = await fetchSummary()
      setSummary(data)
      setCategories(decorateCategories(data.categories))
      setAlerts(mapAlerts(data.alerts))
    } catch (err) {
      // API failed, try to load from onboarding data
      const loaded = loadOnboardingData()
      if (!loaded) {
        setError(err instanceof Error ? err.message : 'Failed to load data. Please complete onboarding.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory(name: string, percent: number, spendingCategories: SpendingCategory[]) {
    setError(null)
    try {
      if (summary) {
        // Using API
        await createCategory({ name, percent, spendingCategories })
        await loadData()
      } else {
        // Using onboarding data - update localStorage
        const onboarding = getOnboardingData()
        if (onboarding) {
          const newCategoryId = Date.now().toString()
          const allowance = onboarding.paycheckAmount || monthlyAllowance || 0
          const newCategoryAmount = (percent / 100) * allowance
          
          const updatedCategories = [
            ...onboarding.categories,
            {
              id: newCategoryId,
              name,
              icon: 'CreditCard',
              amount: newCategoryAmount,
              percentage: percent,
              isCustom: true
            }
          ]
          
          const updatedOnboarding = {
            ...onboarding,
            categories: updatedCategories
          }
          
          localStorage.setItem('vaultx_onboarding', JSON.stringify(updatedOnboarding))
          loadOnboardingData()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    }
  }

  async function handleDeleteCategory(id: string) {
    setError(null)
    try {
      if (summary) {
        // Using API
        await deleteCategory(id)
        await loadData()
      } else {
        // Using onboarding data - update localStorage
        const onboarding = getOnboardingData()
        if (onboarding) {
          const updatedCategories = onboarding.categories.filter(cat => cat.id !== id)
          const updatedOnboarding = {
            ...onboarding,
            categories: updatedCategories
          }
          localStorage.setItem('vaultx_onboarding', JSON.stringify(updatedOnboarding))
          loadOnboardingData()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  async function handleEditCategory(updatedCategory: UiCategory) {
    setError(null)
    try {
      if (summary) {
        // Using API
        await updateCategory(updatedCategory.id, {
          name: updatedCategory.name,
          percent: updatedCategory.percent ?? 0,
          spendingCategories: updatedCategory.spendingCategories,
        })
        await loadData()
      } else {
        // Using onboarding data - update localStorage
        const onboarding = getOnboardingData()
        if (onboarding) {
          const allowance = onboarding.paycheckAmount || monthlyAllowance || 0
          const updatedCategories = onboarding.categories.map(cat => 
            cat.id === updatedCategory.id
              ? {
                  ...cat,
                  name: updatedCategory.name,
                  percentage: updatedCategory.percent ?? 0,
                  amount: ((updatedCategory.percent ?? 0) / 100) * allowance
                }
              : cat
          )
          const updatedOnboarding = {
            ...onboarding,
            categories: updatedCategories
          }
          localStorage.setItem('vaultx_onboarding', JSON.stringify(updatedOnboarding))
          loadOnboardingData()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    }
  }

  // Handle adding transaction (dev only)
  const handleAddTransaction = async (categoryId: string, amount: number, description: string) => {
    if (summary) {
      // Using API - call the API endpoint
      try {
        await addTransactionAPI({
          categoryId,
          amount,
          note: description,
          currency: currency
        })
        // Reload data from API to get updated categories
        await loadData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add transaction')
      }
    } else {
      // Using onboarding data - save to localStorage
      saveTransaction({
        category: categoryId,
        amount,
        description,
        type: 'expense'
      })
      
      // Recalculate all spending from transactions
      const updatedCategories = categories.map(cat => {
        const spent = calculateCategorySpending(cat.id)
        return {
          ...cat,
          spent,
          remaining: cat.allocated - spent
        }
      })
      setCategories(updatedCategories)
      
      const monthlySpending = calculateMonthlySpending()
      const totalBudget = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0)
      const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0)
      
      setUserData(prev => ({
        ...prev,
        monthlySpending,
        budgetRemaining: totalBudget - totalSpent
      }))
      
      // Regenerate alerts
      const generatedAlerts = generateAlerts(updatedCategories, currencySymbol)
      setAlerts(generatedAlerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        time: alert.time
      })))
      
      // Trigger a custom event to update the UI
      window.dispatchEvent(new Event('vaultx-storage-change'))
    }
  }

  return (
    <div className="min-h-screen bg-bg-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-neutral">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/wise-logo.svg" alt="Wise" className="h-5" />
          </div>
          <div className="flex items-center gap-3">
            {/* Dev Mode: Dev Tools */}
            {isDevMode() && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDevTools(!showDevTools)}
                  className="px-3 py-2 rounded-lg bg-interactive-accent/20 hover:bg-interactive-accent/30 text-interactive-primary text-sm font-medium flex items-center gap-2 transition-colors"
                  title="Dev Tools"
                >
                  <Plus className="w-4 h-4" />
                  Dev Tools
                </button>
                <button
                  onClick={resetOnboarding}
                  className="px-3 py-2 rounded-lg bg-sentiment-warning/20 hover:bg-sentiment-warning/30 text-sentiment-warning text-sm font-medium flex items-center gap-2 transition-colors"
                  title="Reset Onboarding (Dev Mode)"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            )}
            <button 
              className="p-2 rounded-full bg-bg-neutral hover:bg-interactive-accent/20 transition-colors" 
              onClick={() => {
                if (summary) {
                  loadData()
                } else {
                  loadOnboardingData()
                }
              }}
            >
              <Bell className="w-5 h-5 text-interactive-primary" />
            </button>
            <div className="w-10 h-10 rounded-full bg-interactive-accent flex items-center justify-center text-interactive-primary font-bold">
              {userData.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-16">
        <section>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-semibold mb-2 text-[#163300]">Good morning! 👋</h1>
            <p className="text-content-secondary">Here&apos;s your financial overview for this month.</p>
          </motion.div>

          {error && (
            <div className="card p-4 border border-sentiment-negative/30 bg-sentiment-negative/5 text-sentiment-negative mb-4">
              {error}
            </div>
          )}

          {loading && <div className="text-content-secondary mb-4">Loading...</div>}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <EditableAllowanceCard
              value={monthlyAllowance}
              currency={currency}
              onUpdate={handleUpdateAllowance}
              delay={0}
            />
            {summary ? (
              <>
                {topStats.map((stat, index) => (
                  <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    change={stat.change}
                    changeType={stat.changeType}
                    icon={stat.icon}
                    delay={(index + 1) * 0.1}
                  />
                ))}
              </>
            ) : (
              <>
                <StatCard 
                  label="Monthly Spending" 
                  value={formatCurrency(allowanceSpent, currency)} 
                  change={formatCurrency(allowanceLeft, currency) + " remaining"} 
                  changeType="neutral" 
                  icon={TrendingUp} 
                  delay={0.1} 
                />
                <StatCard 
                  label="Budget Used" 
                  value={monthlyAllowance > 0 ? `${Math.round((allowanceSpent / monthlyAllowance) * 100)}%` : '0%'} 
                  change={allowanceSpent > monthlyAllowance ? "Over budget" : "On track"} 
                  changeType={allowanceSpent > monthlyAllowance ? "negative" : "positive"} 
                  icon={Target} 
                  delay={0.2} 
                />
                <StatCard 
                  label="Alerts" 
                  value={alertCount.toString()} 
                  change={alertCount > 0 ? "Needs attention" : "All good"} 
                  changeType={alertCount > 0 ? "negative" : "positive"} 
                  icon={AlertTriangle} 
                  delay={0.3} 
                />
              </>
            )}
          </div>
        </section>

        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-content-primary mb-6"
          >
            Budget Categories
          </motion.h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-sm text-content-secondary">Total allocated: {totalUsedPercent.toFixed(0)}%</span>
              <span className="text-sm text-content-secondary">{availablePercent.toFixed(0)}% go to savings</span>
            </div>
            {categories.map((category, index) => (
              <BudgetCard
                key={category.id}
                category={category}
                delay={index * 0.1}
                currency={currency}
                onDelete={handleDeleteCategory}
                onEdit={handleEditCategory}
                totalUsedPercent={totalUsedPercent}
                monthlyAllowance={monthlyAllowance}
                usedSpendingCategories={getUsedSpendingCategories(category.id)}
              />
            ))}
            <AddCategoryCard 
              delay={categories.length * 0.1} 
              onAdd={handleAddCategory} 
              currency={currency}
              availablePercent={availablePercent}
              monthlyAllowance={monthlyAllowance}
              usedSpendingCategories={getUsedSpendingCategories()}
            />
          </div>
        </section>

        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-content-primary mb-6"
          >
            Recent Alerts
          </motion.h2>
          <div className="space-y-3 max-w-2xl">
            <AnimatePresence>
              {visibleAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AlertCard alert={alert} />
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMoreAlerts && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="w-full py-3 px-4 rounded-xl border border-border-neutral 
                  hover:bg-bg-neutral hover:border-interactive-primary
                  text-content-secondary hover:text-interactive-primary
                  font-medium text-sm transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                <span>{showAllAlerts ? 'Show Less' : `See More (${alerts.length - 2})`}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAllAlerts ? 'rotate-180' : ''}`} />
              </motion.button>
            )}
          </div>
        </section>
      </main>

      {/* Dev Tools Modal */}
      {isDevMode() && showDevTools && (
        <DevToolsModal
          categories={categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            allocated: cat.allocated,
            spent: cat.spent,
            remaining: cat.remaining,
            percent: cat.percent,
            spendingCategories: cat.spendingCategories
          }))}
          currencySymbol={currencySymbol}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={(id) => {
            deleteTransaction(id)
            // Recalculate after deletion
            const updatedCategories = categories.map(cat => ({
              ...cat,
              spent: calculateCategorySpending(cat.id),
              remaining: cat.allocated - calculateCategorySpending(cat.id)
            }))
            setCategories(updatedCategories)
            
            const monthlySpending = calculateMonthlySpending()
            const totalBudget = updatedCategories.reduce((sum, cat) => sum + cat.allocated, 0)
            const totalSpent = updatedCategories.reduce((sum, cat) => sum + cat.spent, 0)
            
            setUserData(prev => ({
              ...prev,
              monthlySpending,
              budgetRemaining: totalBudget - totalSpent
            }))
            
            const generatedAlerts = generateAlerts(updatedCategories, currencySymbol)
            setAlerts(generatedAlerts.map(alert => ({
              id: alert.id,
              type: alert.type,
              title: alert.title,
              message: alert.message,
              time: alert.time
            })))
            
            // Trigger update event
            window.dispatchEvent(new Event('vaultx-storage-change'))
          }}
          onClose={() => setShowDevTools(false)}
        />
      )}

      <footer className="border-t border-border-neutral py-8 mt-16">
        <p className="text-center text-sm text-content-tertiary">VaultX • Made for Wise Hackathon 2025</p>
      </footer>
    </div>
  )
}
