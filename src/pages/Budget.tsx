import { motion } from 'framer-motion'
import { 
  DollarSign,
  Calendar,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import PaycheckSplitter from '../components/PaycheckSplitter'

const upcomingPaychecks = [
  { date: 'Nov 30, 2024', amount: 3000, status: 'scheduled' },
  { date: 'Dec 31, 2024', amount: 3000, status: 'pending' },
]

export default function Budget() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
          Budget Management
        </h1>
        <p className="text-gray-400">
          Configure how your paycheck gets split automatically
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paycheck Splitter */}
        <div className="lg:col-span-2">
          <PaycheckSplitter paycheckAmount={3000} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Paycheck Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-vault-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-vault-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Monthly Paycheck</h3>
                <p className="text-sm text-gray-400">From your employer</p>
              </div>
            </div>

            <div className="text-center py-6 border-y border-gray-800">
              <p className="text-4xl font-display font-bold text-gradient">€3,000</p>
              <p className="text-sm text-gray-400 mt-1">Net salary</p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Frequency</span>
                <span className="font-medium">Monthly</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next payment</span>
                <span className="font-medium">Nov 30, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Auto-split</span>
                <span className="text-vault-400 font-medium">Enabled</span>
              </div>
            </div>
          </motion.div>

          {/* Upcoming Paychecks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-display font-semibold">Upcoming</h3>
            </div>

            <div className="space-y-3">
              {upcomingPaychecks.map((paycheck, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <div>
                    <p className="font-medium text-sm">{paycheck.date}</p>
                    <p className="text-xs text-gray-400 capitalize">{paycheck.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-vault-400">€{paycheck.amount.toLocaleString()}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-vault-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sync Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Bank Sync</h3>
                  <p className="text-xs text-gray-400">Last synced 5 min ago</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

