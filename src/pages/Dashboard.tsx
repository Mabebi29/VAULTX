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
  PiggyBank
} from 'lucide-react'
import StatCard from '../components/StatCard'
import BudgetCard from '../components/BudgetCard'
import AlertCard from '../components/AlertCard'

const budgetCategories = [
  { category: 'Groceries', icon: ShoppingCart, allocated: 450, spent: 380, color: '#00e68a' },
  { category: 'Rent', icon: Home, allocated: 1200, spent: 1200, color: '#3b82f6' },
  { category: 'Transport', icon: Car, allocated: 200, spent: 245, color: '#f59e0b' },
  { category: 'Dining Out', icon: Utensils, allocated: 150, spent: 89, color: '#ec4899' },
  { category: 'Entertainment', icon: Gamepad2, allocated: 100, spent: 45, color: '#8b5cf6' },
  { category: 'Savings', icon: PiggyBank, allocated: 500, spent: 500, color: '#06b6d4' },
]

const recentAlerts = [
  { type: 'warning' as const, title: 'Transport budget exceeded', message: 'You\'ve spent €45 more than your allocated transport budget.', time: '2h ago' },
  { type: 'success' as const, title: 'Savings goal reached', message: 'Your monthly savings target of €500 has been met!', time: '1d ago' },
  { type: 'info' as const, title: 'Paycheck received', message: 'Your salary of €3,000 has been split into your budget categories.', time: '3d ago' },
]

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
          Good morning! 👋
        </h1>
        <p className="text-gray-400">
          Here's your financial overview for November 2024
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Balance"
          value="€4,285"
          change="+12% from last month"
          changeType="positive"
          icon={Wallet}
          delay={0.1}
        />
        <StatCard
          label="Monthly Spending"
          value="€2,459"
          change="€541 remaining"
          changeType="neutral"
          icon={TrendingUp}
          delay={0.2}
        />
        <StatCard
          label="Budget Used"
          value="82%"
          change="On track"
          changeType="positive"
          icon={Target}
          delay={0.3}
        />
        <StatCard
          label="Alerts"
          value="1"
          change="Transport over budget"
          changeType="negative"
          icon={AlertTriangle}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Categories */}
        <div className="lg:col-span-2">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-xl font-semibold mb-4"
          >
            Budget Categories
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgetCategories.map((cat, index) => (
              <BudgetCard
                key={cat.category}
                {...cat}
                delay={0.5 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-xl font-semibold mb-4"
          >
            Recent Alerts
          </motion.h2>
          <div className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <AlertCard
                key={index}
                {...alert}
                delay={0.5 + index * 0.1}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 glass-card rounded-2xl p-5"
          >
            <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-3 px-4 bg-vault-500 hover:bg-vault-600 text-slate-950 font-semibold rounded-xl transition-colors">
                Add Manual Transaction
              </button>
              <button className="w-full py-3 px-4 bg-transparent border border-vault-500/30 hover:bg-vault-500/10 text-vault-400 font-semibold rounded-xl transition-colors">
                Adjust Budget
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

