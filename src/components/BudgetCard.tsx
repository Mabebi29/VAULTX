import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface BudgetCardProps {
  category: string
  icon: LucideIcon
  allocated: number
  spent: number
  color: string
  delay?: number
}

export default function BudgetCard({ 
  category, 
  icon: Icon, 
  allocated, 
  spent, 
  color,
  delay = 0 
}: BudgetCardProps) {
  const percentage = Math.min((spent / allocated) * 100, 100)
  const isOverBudget = spent > allocated
  const remaining = allocated - spent

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 hover:border-vault-500/30 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {isOverBudget && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            Over budget
          </span>
        )}
      </div>

      <h3 className="font-display font-semibold text-lg mb-1">{category}</h3>
      
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold" style={{ color: isOverBudget ? '#ef4444' : color }}>
          €{spent.toLocaleString()}
        </span>
        <span className="text-gray-400 text-sm">/ €{allocated.toLocaleString()}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ 
            backgroundColor: isOverBudget ? '#ef4444' : color,
            boxShadow: `0 0 20px ${isOverBudget ? 'rgba(239, 68, 68, 0.5)' : `${color}50`}`
          }}
        />
      </div>

      <p className="mt-3 text-sm text-gray-400">
        {isOverBudget ? (
          <span className="text-red-400">€{Math.abs(remaining).toLocaleString()} over</span>
        ) : (
          <>€{remaining.toLocaleString()} remaining</>
        )}
      </p>
    </motion.div>
  )
}

