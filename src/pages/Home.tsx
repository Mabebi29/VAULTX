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
  LucideIcon
} from 'lucide-react'
import { useState } from 'react'

// Import data from JSON
import data from '../data/categories.json'

// Icon mapping - maps string names to actual icon components
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

// Types
type AlertType = 'warning' | 'danger' | 'success' | 'info'

interface Category {
  id: string
  name: string
  icon: string
  allocated: number
  spent: number
  color: string
}

interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  time: string
}

// Stat Card Component
function StatCard({ label, value, change, changeType = 'neutral', icon: Icon, delay = 0 }: {
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

// Budget Card Component
function BudgetCard({ category, delay = 0, onDelete, onEdit }: {
  category: Category
  delay?: number
  onDelete: (id: string) => void
  onEdit: (category: Category) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editBudget, setEditBudget] = useState(category.allocated.toString())
  
  const Icon = iconMap[category.icon] || CreditCard
  const percentage = Math.min((category.spent / category.allocated) * 100, 100)
  const isOverBudget = category.spent > category.allocated
  const remaining = category.allocated - category.spent

  const handleDelete = () => {
    onDelete(category.id)
    setShowDeleteConfirm(false)
    setShowMenu(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = () => {
    if (editName.trim() && editBudget) {
      onEdit({
        ...category,
        name: editName.trim(),
        allocated: Number(editBudget)
      })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditName(category.name)
    setEditBudget(category.allocated.toString())
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
      {/* Pencil button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-bg-neutral transition-colors group"
      >
        <Pencil className="w-4 h-4 text-content-tertiary group-hover:text-interactive-primary transition-colors" />
      </button>

      {/* Dropdown menu */}
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

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white rounded-xl p-5 flex flex-col items-center justify-center z-10">
          <p className="text-content-primary font-medium text-center mb-4">
            Are you sure?
          </p>
          <p className="text-content-secondary text-sm text-center mb-4">
            Delete "{category.name}" category
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={handleDelete}
              className="flex-1 py-2 px-3 rounded-full font-semibold text-sm transition-colors"
              style={{ backgroundColor: '#A8200D', color: '#FFFFFF' }}
            >
              Delete
            </button>
            <button
              onClick={() => { setShowDeleteConfirm(false); setShowMenu(false); }}
              className="flex-1 py-2 px-3 rounded-full font-medium text-sm transition-colors"
              style={{ backgroundColor: '#9FE870', color: '#163300' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit overlay */}
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
            <label className="block text-xs font-medium text-content-primary mb-1">Budget (€)</label>
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
              className="flex-1 py-2 px-3 rounded-full font-semibold text-sm"
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
          €{category.spent.toLocaleString()}
        </span>
        <span className="text-content-tertiary text-sm">/ €{category.allocated.toLocaleString()}</span>
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
          <span className="text-sentiment-negative font-medium">€{Math.abs(remaining).toLocaleString()} over</span>
        ) : (
          <>€{remaining.toLocaleString()} remaining</>
        )}
      </p>
    </motion.div>
  )
}

// Add Category Card Component - with inline form
function AddCategoryCard({ delay = 0, onAdd }: { delay?: number; onAdd: (name: string, budget: number) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && budget) {
      onAdd(name.trim(), Number(budget))
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
        // Add button state
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
        // Form state
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          {/* Category Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-content-primary mb-2">
              Category Name
            </label>
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

          {/* Monthly Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-content-primary mb-2">
              Monthly Budget (€)
            </label>
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

          {/* Buttons */}
          <div className="flex flex-row gap-2 mt-4 pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !budget}
              className="flex-1 py-2.5 px-4 rounded-full font-semibold text-sm transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#9FE870', color: '#163300' }}
            >
              Add
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

// Alert Card Component
function AlertCard({ alert }: { alert: Alert }) {
  const config = {
    warning: { icon: AlertTriangle, color: '#0E0F0C', bgColor: 'rgba(237, 200, 67, 0.2)' },
    danger: { icon: XCircle, color: '#A8200D', bgColor: 'rgba(168, 32, 13, 0.1)' },
    success: { icon: CheckCircle, color: '#2F5711', bgColor: 'rgba(47, 87, 17, 0.1)' },
    info: { icon: TrendingUp, color: '#163300', bgColor: 'rgba(22, 51, 0, 0.08)' },
  }
  const { icon: Icon, color, bgColor } = config[alert.type]

  return (
    <div className="card p-4 flex gap-4">
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
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

// Main Page
export default function HomePage() {
  // Load data from JSON and manage categories state
  const [categories, setCategories] = useState<Category[]>(data.categories as Category[])
  const alerts = data.alerts as Alert[]
  const user = data.user

  // Alerts state - show only 2 initially
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 2)
  const hasMoreAlerts = alerts.length > 2

  // Handle adding a new category
  const handleAddCategory = (name: string, budget: number) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      icon: 'CreditCard',
      allocated: budget,
      spent: 0,
      color: '#163300'
    }
    setCategories([...categories, newCategory])
  }

  // Handle deleting a category
  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  // Handle editing a category
  const handleEditCategory = (updatedCategory: Category) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ))
  }

  // Calculate stats from data
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const budgetUsedPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  const alertCount = alerts.filter(a => a.type === 'danger' || a.type === 'warning').length

  return (
    <div className="min-h-screen bg-bg-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-neutral">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Wise Logo */}
            <img 
              src="/wise-logo.svg" 
              alt="Wise" 
              className="h-5"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-bg-neutral hover:bg-interactive-accent/20 transition-colors">
              <Bell className="w-5 h-5 text-interactive-primary" />
            </button>
            <div className="w-10 h-10 rounded-full bg-interactive-accent flex items-center justify-center text-interactive-primary font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-16">
        
        {/* Hero / Welcome Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-semibold mb-2 text-[#163300]">
              Good morning! 👋
            </h1>
            <p className="text-content-secondary">
              Here's your financial overview for November 2024
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Balance" 
              value={`€${user.balance.toLocaleString()}`} 
              change="+12% from last month" 
              changeType="positive" 
              icon={Wallet} 
              delay={0.1} 
            />
            <StatCard 
              label="Monthly Spending" 
              value={`€${user.monthlySpending.toLocaleString()}`} 
              change={`€${user.budgetRemaining} remaining`} 
              changeType="neutral" 
              icon={TrendingUp} 
              delay={0.2} 
            />
            <StatCard 
              label="Budget Used" 
              value={`${budgetUsedPercent}%`} 
              change="On track" 
              changeType="positive" 
              icon={Target} 
              delay={0.3} 
            />
            <StatCard 
              label="Alerts" 
              value={alertCount.toString()} 
              change={alertCount > 0 ? "Needs attention" : "All good"} 
              changeType={alertCount > 0 ? "negative" : "positive"} 
              icon={AlertTriangle} 
              delay={0.4} 
            />
          </div>
        </section>

        {/* Budget Categories */}
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
                onDelete={handleDeleteCategory}
                onEdit={handleEditCategory}
              />
            ))}
            <AddCategoryCard delay={categories.length * 0.1} onAdd={handleAddCategory} />
          </div>
        </section>

        {/* Alerts */}
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
            
            {/* See More Button */}
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

      {/* Footer */}
      <footer className="border-t border-border-neutral py-8 mt-16">
        <p className="text-center text-sm text-content-tertiary">
          VaultX • Made for Wise Hackathon 2024
        </p>
      </footer>
    </div>
  )
}
