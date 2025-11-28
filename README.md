# VaultX 🏦

**Smart Paycheck Splitting & Budget Alerts** — Built for Wise Hackathon

VaultX automatically splits your incoming paycheck into budget categories and alerts you when you're overspending. Take control of your finances effortlessly.

## ✨ Features

- **Auto Paycheck Splitting** — When you receive your salary, it automatically gets distributed to your budget categories (rent, groceries, savings, etc.)
- **Smart Budget Alerts** — Get notified when you exceed budgets or reach spending thresholds
- **Real-time Tracking** — Monitor your spending across all categories
- **Clean Dashboard** — Beautiful overview of your financial health

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠 Tech Stack

- **React 18** + **TypeScript** — Type-safe component development
- **Vite** — Lightning fast build tool
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Lucide Icons** — Beautiful icon set
- **React Router** — Client-side routing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── BudgetCard.tsx   # Budget category card
│   ├── AlertCard.tsx    # Alert/notification card
│   ├── StatCard.tsx     # Statistics display card
│   └── PaycheckSplitter.tsx  # Paycheck allocation UI
├── pages/               # Route pages
│   ├── Dashboard.tsx    # Main dashboard overview
│   ├── Budget.tsx       # Budget management page
│   ├── Alerts.tsx       # Alerts & notifications
│   └── Settings.tsx     # User settings
├── types/               # TypeScript type definitions
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles + Tailwind
```

## 🔗 Backend Integration

The frontend is designed to connect with a backend that handles:
- Bank account connections (via Wise API)
- Automatic transaction categorization
- Paycheck detection and splitting
- Alert rule processing

### API Endpoints (to be implemented)

```typescript
GET  /api/balance          // Get current balance
GET  /api/transactions     // Get transaction history
GET  /api/categories       // Get budget categories
POST /api/categories       // Update category allocation
GET  /api/alerts           // Get user alerts
POST /api/paycheck/split   // Configure paycheck splitting
```

## 🎨 Design System

- **Primary Color**: `#00e68a` (Vault Green)
- **Background**: Dark theme with glassmorphism effects
- **Typography**: Space Grotesk (headings) + DM Sans (body)

## 👥 Team

Built with ❤️ for Wise Hackathon 2024

---

**VaultX** — *Your money, automatically organized.*
