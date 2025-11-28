import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Onboarding from './components/Onboarding'
import { resetOnboarding, isDevMode } from './utils/storage'
import { fetchOnboardingStatus } from './api'

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const checkOnboarding = async () => {
      try {
        const { onboarding } = await fetchOnboardingStatus()
        if (cancelled) return
        if (!onboarding?.completed) {
          setShowOnboarding(true)
        }
      } catch (e) {
        // Fallback to local storage when API not reachable
        const onboardingData = localStorage.getItem('vaultx_onboarding')
        if (!onboardingData) {
          setShowOnboarding(true)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    checkOnboarding()

    // Developer shortcut: Ctrl+Shift+R to reset onboarding
    let handleKeyPress: ((e: KeyboardEvent) => void) | null = null
    if (isDevMode()) {
      handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
          e.preventDefault()
          resetOnboarding()
        }
      }
      window.addEventListener('keydown', handleKeyPress)
    }
    return () => {
      cancelled = true
      if (handleKeyPress) {
        window.removeEventListener('keydown', handleKeyPress)
      }
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
