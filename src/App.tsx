import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Onboarding from './components/Onboarding'
import { resetOnboarding, isDevMode } from './utils/storage'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingData = localStorage.getItem('vaultx_onboarding')
    if (!onboardingData) {
      setShowOnboarding(true)
    }
    setIsLoading(false)

    // Developer shortcut: Ctrl+Shift+R to reset onboarding
    if (isDevMode()) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
          e.preventDefault()
          resetOnboarding()
        }
      }
      window.addEventListener('keydown', handleKeyPress)
      return () => window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-screen flex items-center justify-center">
        <div className="text-content-secondary">Loading...</div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return <Home />
}

export default App
