import { motion } from 'framer-motion'
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
  Zap,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useState } from 'react'

// Stat Card Component
function StatCard({ label, value, change, changeType = 'neutral', icon: Icon, delay = 0 }: {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: typeof Wallet
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
function BudgetCard({ category, icon: Icon, allocated, spent, color, delay = 0 }: {
  category: string
  icon: typeof Wallet
  allocated: number
  spent: number
  color: string
  delay?: number
}) {
  const percentage = Math.min((spent / allocated) * 100, 100)
  const isOverBudget = spent > allocated
  const remaining = allocated - spent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {isOverBudget && (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-sentiment-negative/10 text-sentiment-negative">
            Over budget
          </span>
        )}
      </div>

      <h3 className="font-semibold text-content-primary mb-1">{category}</h3>
      
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-xl font-bold" style={{ color: isOverBudget ? '#A8200D' : color }}>
          €{spent.toLocaleString()}
        </span>
        <span className="text-content-tertiary text-sm">/ €{allocated.toLocaleString()}</span>
      </div>

      <div className="h-2 bg-bg-neutral rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2, duration: 0.8 }}
          className="h-full rounded-full"
          style={{ backgroundColor: isOverBudget ? '#A8200D' : color }}
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

// Paycheck Splitter Component
function PaycheckSplitter({ paycheckAmount }: { paycheckAmount: number }) {
  const [splits, setSplits] = useState([
    { id: '1', category: 'Rent', icon: Home, amount: 1200, percentage: 40 },
    { id: '2', category: 'Groceries', icon: ShoppingCart, amount: 450, percentage: 15 },
    { id: '3', category: 'Savings', icon: PiggyBank, amount: 600, percentage: 20 },
    { id: '4', category: 'Bills', icon: CreditCard, amount: 300, percentage: 10 },
    { id: '5', category: 'Entertainment', icon: Gamepad2, amount: 225, percentage: 7.5 },
    { id: '6', category: 'Dining', icon: Utensils, amount: 225, percentage: 7.5 },
  ])

  const totalAllocated = splits.reduce((sum, s) => sum + s.amount, 0)
  const remaining = paycheckAmount - totalAllocated

  const updateSplit = (id: string, newPercentage: number) => {
    setSplits(splits.map(s => 
      s.id === id 
        ? { ...s, percentage: newPercentage, amount: Math.round(paycheckAmount * newPercentage / 100) }
        : s
    ))
  }

  const removeSplit = (id: string) => {
    setSplits(splits.filter(s => s.id !== id))
  }

  const addSplit = () => {
    const newId = Date.now().toString()
    setSplits([...splits, { id: newId, category: 'Transport', icon: Car, amount: 0, percentage: 0 }])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-elevated p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-interactive-accent/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-interactive-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-content-primary">Paycheck Splitter</h3>
          <p className="text-sm text-content-secondary">Auto-allocate your €{paycheckAmount.toLocaleString()} paycheck</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {splits.map((split) => {
          const Icon = split.icon
          return (
            <div key={split.id} className="group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-bg-neutral flex items-center justify-center">
                  <Icon className="w-4 h-4 text-interactive-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-content-primary">{split.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-interactive-primary">
                        €{split.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-content-tertiary">
                        ({split.percentage}%)
                      </span>
                      <button 
                        onClick={() => removeSplit(split.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sentiment-negative/10 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-sentiment-negative" />
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={split.percentage}
                    onChange={(e) => updateSplit(split.id, Number(e.target.value))}
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
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={addSplit}
        className="w-full py-3 border-2 border-dashed border-border-neutral rounded-xl text-content-secondary 
          hover:border-interactive-primary hover:text-interactive-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>

      <div className="mt-6 pt-6 border-t border-border-neutral">
        <div className="flex items-center justify-between">
          <span className="text-content-secondary">Remaining unallocated</span>
          <span className={`font-semibold ${remaining >= 0 ? 'text-sentiment-positive' : 'text-sentiment-negative'}`}>
            €{remaining.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Alert Card Component
function AlertCard({ type, title, message, time }: {
  type: 'warning' | 'danger' | 'success' | 'info'
  title: string
  message: string
  time: string
}) {
  const config = {
    warning: { icon: AlertTriangle, color: '#0E0F0C', bgColor: 'rgba(237, 200, 67, 0.2)' },
    danger: { icon: XCircle, color: '#A8200D', bgColor: 'rgba(168, 32, 13, 0.1)' },
    success: { icon: CheckCircle, color: '#2F5711', bgColor: 'rgba(47, 87, 17, 0.1)' },
    info: { icon: TrendingUp, color: '#163300', bgColor: 'rgba(22, 51, 0, 0.08)' },
  }
  const { icon: Icon, color, bgColor } = config[type]

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
          <h4 className="font-semibold text-sm text-content-primary">{title}</h4>
          <span className="text-xs text-content-tertiary flex-shrink-0">{time}</span>
        </div>
        <p className="text-sm text-content-secondary mt-1">{message}</p>
      </div>
    </div>
  )
}

// Data
const budgetCategories = [
  { category: 'Groceries', icon: ShoppingCart, allocated: 450, spent: 380, color: '#2F5711' },
  { category: 'Rent', icon: Home, allocated: 1200, spent: 1200, color: '#163300' },
  { category: 'Transport', icon: Car, allocated: 200, spent: 245, color: '#A8200D' },
  { category: 'Dining Out', icon: Utensils, allocated: 150, spent: 89, color: '#163300' },
  { category: 'Entertainment', icon: Gamepad2, allocated: 100, spent: 45, color: '#163300' },
  { category: 'Savings', icon: PiggyBank, allocated: 500, spent: 500, color: '#2F5711' },
]

const alerts = [
  { type: 'danger' as const, title: 'Transport budget exceeded', message: 'You\'ve spent €45 more than your allocated transport budget.', time: '2h ago' },
  { type: 'success' as const, title: 'Savings goal reached', message: 'Your monthly savings target of €500 has been met!', time: '1d ago' },
  { type: 'info' as const, title: 'Paycheck received', message: 'Your salary of €3,000 has been split into your budget categories.', time: '3d ago' },
]

// Main Page
export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-neutral">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-interactive-accent flex items-center justify-center">
              <Wallet className="w-6 h-6 text-interactive-primary" />
            </div>
            <span className="font-semibold text-xl text-content-primary">VaultX</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-bg-neutral hover:bg-interactive-accent/20 transition-colors">
              <Bell className="w-5 h-5 text-interactive-primary" />
            </button>
            <div className="w-10 h-10 rounded-full bg-interactive-accent flex items-center justify-center text-interactive-primary font-bold">
              U
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
            <h1 className="text-3xl font-semibold text-content-primary mb-2">
              Good morning! 👋
            </h1>
            <p className="text-content-secondary">
              Here's your financial overview for November 2024
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Balance" value="€4,285" change="+12% from last month" changeType="positive" icon={Wallet} delay={0.1} />
            <StatCard label="Monthly Spending" value="€2,459" change="€541 remaining" changeType="neutral" icon={TrendingUp} delay={0.2} />
            <StatCard label="Budget Used" value="82%" change="On track" changeType="positive" icon={Target} delay={0.3} />
            <StatCard label="Alerts" value="1" change="Transport over budget" changeType="negative" icon={AlertTriangle} delay={0.4} />
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
            {budgetCategories.map((cat, index) => (
              <BudgetCard key={cat.category} {...cat} delay={index * 0.1} />
            ))}
          </div>
        </section>

        {/* Paycheck Splitter */}
        <section>
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-content-primary mb-6"
          >
            Configure Your Paycheck Split
          </motion.h2>
          <div className="max-w-2xl">
            <PaycheckSplitter paycheckAmount={3000} />
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
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AlertCard {...alert} />
              </motion.div>
            ))}
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

