import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  ShoppingCart, 
  Home, 
  Car, 
  Utensils, 
  Gamepad2,
  PiggyBank,
  CreditCard,
  Plus,
  Trash2
} from 'lucide-react'

const categoryIcons = {
  'Groceries': ShoppingCart,
  'Rent': Home,
  'Transport': Car,
  'Dining': Utensils,
  'Entertainment': Gamepad2,
  'Savings': PiggyBank,
  'Bills': CreditCard,
}

interface Split {
  id: string
  category: string
  amount: number
  percentage: number
}

interface PaycheckSplitterProps {
  paycheckAmount: number
}

export default function PaycheckSplitter({ paycheckAmount }: PaycheckSplitterProps) {
  const [splits, setSplits] = useState<Split[]>([
    { id: '1', category: 'Rent', amount: 1200, percentage: 40 },
    { id: '2', category: 'Groceries', amount: 450, percentage: 15 },
    { id: '3', category: 'Savings', amount: 600, percentage: 20 },
    { id: '4', category: 'Bills', amount: 300, percentage: 10 },
    { id: '5', category: 'Entertainment', amount: 225, percentage: 7.5 },
    { id: '6', category: 'Dining', amount: 225, percentage: 7.5 },
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
    setSplits([...splits, { id: newId, category: 'Transport', amount: 0, percentage: 0 }])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-vault-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-vault-400" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">Paycheck Splitter</h3>
          <p className="text-sm text-gray-400">Auto-allocate your €{paycheckAmount.toLocaleString()} paycheck</p>
        </div>
      </div>

      {/* Allocation bars */}
      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {splits.map((split, index) => {
            const Icon = categoryIcons[split.category as keyof typeof categoryIcons] || CreditCard
            return (
              <motion.div
                key={split.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-vault-500/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-vault-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{split.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-vault-400 font-semibold">
                          €{split.amount.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({split.percentage}%)
                        </span>
                        <button 
                          onClick={() => removeSplit(split.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={split.percentage}
                      onChange={(e) => updateSplit(split.id, Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-vault-500
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-125"
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Add new category */}
      <button
        onClick={addSplit}
        className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 
          hover:border-vault-500 hover:text-vault-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Remaining unallocated</span>
          <span className={`font-semibold ${remaining >= 0 ? 'text-vault-400' : 'text-red-400'}`}>
            €{remaining.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

