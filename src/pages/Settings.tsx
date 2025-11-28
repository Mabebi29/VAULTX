import { motion } from 'framer-motion'
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Mail
} from 'lucide-react'

const settingsGroups = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Profile', description: 'Manage your personal information' },
      { icon: CreditCard, label: 'Connected Banks', description: '2 banks connected via Wise' },
      { icon: Smartphone, label: 'Devices', description: '3 devices logged in' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Push, email, and SMS settings' },
      { icon: Palette, label: 'Appearance', description: 'Dark mode enabled' },
      { icon: Globe, label: 'Language & Region', description: 'English, EUR (€)' },
    ]
  },
  {
    title: 'Security',
    items: [
      { icon: Shield, label: 'Security', description: '2FA enabled, last login 2h ago' },
      { icon: Mail, label: 'Email Preferences', description: 'Weekly summary enabled' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', description: 'FAQs, contact us' },
    ]
  },
]

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
          Settings
        </h1>
        <p className="text-gray-400">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vault-400 to-vault-600 flex items-center justify-center text-2xl font-bold text-slate-950">
            JD
          </div>
          <div className="flex-1">
            <h2 className="font-display font-semibold text-xl">John Doe</h2>
            <p className="text-gray-400">john.doe@example.com</p>
          </div>
          <button className="px-4 py-2 bg-vault-500/20 hover:bg-vault-500/30 text-vault-400 rounded-xl font-medium transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient">8</p>
            <p className="text-xs text-gray-400">Months Active</p>
          </div>
          <div className="text-center border-x border-gray-800">
            <p className="text-2xl font-bold text-gradient">€4,500</p>
            <p className="text-xs text-gray-400">Total Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gradient">94%</p>
            <p className="text-xs text-gray-400">Budget Score</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + groupIndex * 0.1 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 px-1">
            {group.title}
          </h3>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-800">
            {group.items.map((item, itemIndex) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-vault-500/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-vault-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-vault-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button className="w-full flex items-center justify-center gap-3 p-4 glass-card rounded-2xl text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-sm text-gray-500 mt-8">
        VaultX v0.1.0 • Made for Wise Hackathon
      </p>
    </div>
  )
}

