import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, CheckCircle, XCircle, LucideIcon } from 'lucide-react'

type AlertType = 'warning' | 'danger' | 'success' | 'info'

interface AlertCardProps {
  type: AlertType
  title: string
  message: string
  time: string
  delay?: number
}

const alertConfig: Record<AlertType, { icon: LucideIcon; color: string; bgColor: string }> = {
  warning: { icon: AlertTriangle, color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.1)' },
  danger: { icon: XCircle, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  success: { icon: CheckCircle, color: '#00e68a', bgColor: 'rgba(0, 230, 138, 0.1)' },
  info: { icon: TrendingUp, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
}

export default function AlertCard({ type, title, message, time, delay = 0 }: AlertCardProps) {
  const { icon: Icon, color, bgColor } = alertConfig[type]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-xl p-4 flex gap-4 hover:border-l-4 transition-all duration-300"
      style={{ borderLeftColor: color }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{message}</p>
      </div>
    </motion.div>
  )
}

