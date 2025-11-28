import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  delay?: number
}

export default function StatCard({ 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  delay = 0 
}: StatCardProps) {
  const changeColors = {
    positive: 'text-vault-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Background glow effect */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-vault-500/10 rounded-full blur-2xl group-hover:bg-vault-500/20 transition-colors" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400 text-sm font-medium">{label}</span>
          <div className="w-10 h-10 rounded-xl bg-vault-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-vault-400" />
          </div>
        </div>
        
        <p className="text-3xl font-display font-bold text-white mb-2">{value}</p>
        
        {change && (
          <p className={`text-sm ${changeColors[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </motion.div>
  )
}

