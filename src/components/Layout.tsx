import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  PieChart, 
  Bell, 
  Settings,
  Wallet
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/budget', icon: PieChart, label: 'Budget' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed left-0 top-0 h-full w-20 lg:w-64 glass flex flex-col py-6 z-50"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 lg:px-6 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vault-500 to-vault-400 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-slate-950" />
          </div>
          <span className="hidden lg:block font-display font-bold text-xl text-gradient">
            VaultX
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 lg:px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-vault-500/20 text-vault-400' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-vault-400' : 'group-hover:text-vault-400'}`} />
                      <span className="hidden lg:block font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 w-1 h-8 bg-vault-500 rounded-r-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="px-3 lg:px-4 mt-auto">
          <div className="glass-card rounded-xl p-3 lg:p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vault-400 to-vault-600 flex items-center justify-center text-slate-950 font-bold">
                U
              </div>
              <div className="hidden lg:block">
                <p className="font-medium text-sm">User Name</p>
                <p className="text-xs text-gray-400">Connected</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 ml-20 lg:ml-64 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

