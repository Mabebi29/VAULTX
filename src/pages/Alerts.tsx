import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  BellRing,
  Filter,
  Check,
  Trash2,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react'
import AlertCard from '../components/AlertCard'

type AlertType = 'warning' | 'danger' | 'success' | 'info'
type FilterType = 'all' | AlertType

interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  time: string
  read: boolean
}

const initialAlerts: Alert[] = [
  { id: '1', type: 'danger', title: 'Transport budget exceeded!', message: 'You\'ve spent €245 on transport this month, exceeding your €200 budget by €45.', time: '2 hours ago', read: false },
  { id: '2', type: 'warning', title: 'Groceries budget at 85%', message: 'You\'ve used €382.50 of your €450 groceries budget. €67.50 remaining for 8 days.', time: '5 hours ago', read: false },
  { id: '3', type: 'success', title: 'Monthly savings achieved!', message: 'Congratulations! You\'ve successfully saved €500 this month, reaching your savings goal.', time: '1 day ago', read: true },
  { id: '4', type: 'info', title: 'Paycheck received', message: 'Your November salary of €3,000 has been received and automatically split into your budget categories.', time: '3 days ago', read: true },
  { id: '5', type: 'success', title: 'Budget rule created', message: 'New spending limit for Dining Out category has been set to €150/month.', time: '5 days ago', read: true },
  { id: '6', type: 'warning', title: 'Unusual spending detected', message: 'You\'ve made 3 transactions at restaurants today totaling €78. This is higher than your usual daily dining spend.', time: '1 week ago', read: true },
]

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.type === filter)

  const unreadCount = alerts.filter(a => !a.read).length

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, read: true })))
  }

  const clearAll = () => {
    setAlerts([])
  }

  const filterOptions: { value: FilterType; label: string; icon: typeof Bell }[] = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'danger', label: 'Critical', icon: XCircle },
    { value: 'warning', label: 'Warnings', icon: AlertTriangle },
    { value: 'success', label: 'Success', icon: CheckCircle },
    { value: 'info', label: 'Info', icon: TrendingUp },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
              Alerts & Notifications
            </h1>
            <p className="text-gray-400">
              Stay on top of your spending with smart alerts
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-vault-500/20 rounded-full">
              <BellRing className="w-5 h-5 text-vault-400" />
              <span className="font-semibold text-vault-400">{unreadCount} new</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filter & Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${filter === option.value 
                  ? 'bg-vault-500 text-slate-950' 
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <div key={alert.id} className="relative">
              {!alert.read && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-vault-500 animate-pulse" />
              )}
              <AlertCard
                type={alert.type}
                title={alert.title}
                message={alert.message}
                time={alert.time}
                delay={0.1 + index * 0.05}
              />
            </div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-vault-500/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-vault-400" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">All caught up!</h3>
            <p className="text-gray-400">No alerts to show. Your finances are looking good!</p>
          </motion.div>
        )}
      </div>

      {/* Alert Settings Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-card rounded-2xl p-6"
      >
        <h3 className="font-display font-semibold text-lg mb-4">Alert Rules</h3>
        <div className="space-y-4">
          {[
            { label: 'Budget exceeded', description: 'Alert when spending exceeds category budget', enabled: true },
            { label: 'Budget warning', description: 'Alert when reaching 80% of budget', enabled: true },
            { label: 'Unusual spending', description: 'Alert on unusual transaction patterns', enabled: true },
            { label: 'Savings goals', description: 'Celebrate when you hit savings targets', enabled: true },
            { label: 'Low balance', description: 'Alert when balance falls below €500', enabled: false },
          ].map((rule, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <div>
                <p className="font-medium text-sm">{rule.label}</p>
                <p className="text-xs text-gray-400">{rule.description}</p>
              </div>
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                  rule.enabled ? 'bg-vault-500' : 'bg-slate-700'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

