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
  LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchSummary, createCategory, updateCategory, deleteCategory } from '../api'
import type { Alert as ApiAlert, Category, Summary } from '../types'

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

function BudgetCard({
  category,
  delay = 0,
  onDelete,
  onEdit,
  currency,
}: {
  category: UiCategory
  delay?: number
  onDelete: (id: string) => Promise<void>
  onEdit: (category: UiCategory) => Promise<void>
  currency: string
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editBudget, setEditBudget] = useState(
    category.type === 'percent' ? (category.percent ?? '').toString() : category.allocated.toString(),
  )

  const Icon = iconMap[category.icon] || CreditCard
  const denominator = category.allocated || 1
  const percentage = Math.min((category.spent / denominator) * 100, 100)
  const isOverBudget = category.spent > category.allocated
  const remaining = category.allocated - category.spent

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
    if (editName.trim() && editBudget) {
      setPending(true)
      await onEdit({
        ...category,
        name: editName.trim(),
        allocated: Number(editBudget),
        percent: category.type === 'percent' ? Number(editBudget) : category.percent,
      })
      setPending(false)
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(category.name)
    setEditBudget(category.type === 'percent' ? (category.percent ?? '').toString() : category.allocated.toString())
    setIsEditing(false)
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
        <div className="absolute inset-0 bg-white rounded-xl p-4 flex flex-col z-10">
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
              {category.type === 'percent' ? 'Budget (%)' : 'Budget (€)'}
            </label>
            <input
              type="number"
              value={editBudget}
              onChange={(e) => setEditBudget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral
                focus:border-interactive-primary focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleSaveEdit}
              disabled={pending}
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
        {isOverBudget && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-sentiment-negative/10 text-sentiment-negative">
            Over budget
          </span>
        )}
      </div>

      <h3 className="font-semibold text-content-primary mb-1">{category.name}</h3>

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
}: {
  delay?: number
  onAdd: (name: string, budget: number) => Promise<void>
  currency: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && budget) {
      setPending(true)
      await onAdd(name.trim(), Number(budget))
      setPending(false)
      setName('')
      setBudget('')
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setBudget('')
    setIsEditing(false)
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
          className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border-neutral 
            hover:border-interactive-primary rounded-xl py-8
            hover:bg-bg-neutral transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-xl bg-bg-neutral group-hover:bg-interactive-accent/20 flex items-center justify-center mb-4 transition-colors">
            <Plus className="w-6 h-6 text-content-tertiary group-hover:text-interactive-primary transition-colors" />
          </div>
          <span className="font-semibold text-content-tertiary group-hover:text-interactive-primary transition-colors">
            Add Category
          </span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="mb-4">
            <label className="block text-sm font-medium text-content-primary mb-2">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Subscriptions"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral
                focus:border-interactive-primary focus:outline-none
                text-content-primary placeholder:text-content-tertiary text-sm transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-content-primary mb-2">Monthly Budget ({currency})</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="100"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-border-neutral bg-bg-neutral
                focus:border-interactive-primary focus:outline-none
                text-content-primary placeholder:text-content-tertiary text-sm transition-all"
            />
          </div>

          <div className="flex flex-row gap-2 mt-4 pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !budget || pending}
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
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 2)
  const hasMoreAlerts = alerts.length > 2
  const currency = summary?.currency || 'USD'
  const alertCount = alerts.filter((a) => a.type === 'danger' || a.type === 'warning').length

  const topStats = useMemo(() => {
    if (!summary) return []
    const remaining = Math.max(summary.allocatedTotal - summary.spentTotal, 0)
    const balance = summary.paycheck?.amount || 0
    const updated = summary.paycheck?.updatedAt
      ? `Updated ${new Date(summary.paycheck.updatedAt).toLocaleDateString()}`
      : 'No paycheck saved'

    return [
      {
        label: 'Total Balance',
        value: formatCurrency(balance, currency),
        change: updated,
        changeType: 'neutral' as const,
        icon: Wallet,
      },
      {
        label: 'Monthly Spending',
        value: formatCurrency(summary.spentTotal, currency),
        change: `${formatCurrency(remaining, currency)} remaining`,
        changeType: 'neutral' as const,
        icon: TrendingUp,
      },
      {
        label: 'Budget Used',
        value: `${summary.budgetUsedPercent.toFixed(0)}%`,
        change: summary.budgetUsedPercent > 100 ? 'Over budget' : 'On track',
        changeType: summary.budgetUsedPercent > 100 ? ('negative' as const) : ('positive' as const),
        icon: Target,
      },
      {
        label: 'Alerts',
        value: alertCount.toString(),
        change: alertCount > 0 ? 'Needs attention' : 'All good',
        changeType: alertCount > 0 ? ('negative' as const) : ('positive' as const),
        icon: AlertTriangle,
      },
    ]
  }, [alertCount, currency, summary])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSummary()
      setSummary(data)
      setCategories(decorateCategories(data.categories))
      setAlerts(mapAlerts(data.alerts))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory(name: string, budget: number) {
    setError(null)
    try {
      await createCategory({ name, amount: budget })
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    }
  }

  async function handleDeleteCategory(id: string) {
    setError(null)
    try {
      await deleteCategory(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  async function handleEditCategory(updatedCategory: UiCategory) {
    setError(null)
    try {
      if (updatedCategory.type === 'percent') {
        await updateCategory(updatedCategory.id, {
          name: updatedCategory.name,
          percent: updatedCategory.percent ?? updatedCategory.allocated,
          type: 'percent',
        })
      } else {
        await updateCategory(updatedCategory.id, {
          name: updatedCategory.name,
          amount: updatedCategory.allocated,
          type: 'fixed',
        })
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
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
            <button className="p-2 rounded-full bg-bg-neutral hover:bg-interactive-accent/20 transition-colors" onClick={loadData}>
              <Bell className="w-5 h-5 text-interactive-primary" />
            </button>
            <div className="w-10 h-10 rounded-full bg-interactive-accent flex items-center justify-center text-interactive-primary font-bold">
              U
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
            {topStats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={stat.icon}
                delay={index * 0.1}
              />
            ))}
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <BudgetCard
                key={category.id}
                category={category}
                delay={index * 0.1}
                currency={currency}
                onDelete={handleDeleteCategory}
                onEdit={handleEditCategory}
              />
            ))}
            <AddCategoryCard delay={categories.length * 0.1} onAdd={handleAddCategory} currency={currency} />
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

      <footer className="border-t border-border-neutral py-8 mt-16">
        <p className="text-center text-sm text-content-tertiary">VaultX • Made for Wise Hackathon 2024</p>
      </footer>
    </div>
  )
}
