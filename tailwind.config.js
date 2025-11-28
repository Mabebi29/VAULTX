/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Content Colors
        'content': {
          'primary': '#0E0F0C',
          'secondary': '#454745',
          'tertiary': '#6A6C6A',
          'link': '#163300',
        },
        // Interactive Colors
        'interactive': {
          'primary': '#163300',    // Forest Green
          'accent': '#9FE870',     // Bright Green
          'secondary': '#868685',
          'control': '#163300',
          'contrast': '#9FE870',
        },
        // Background Colors
        'bg': {
          'screen': '#FFFFFF',
          'elevated': '#FFFFFF',
          'neutral': 'rgba(22, 51, 0, 0.08)',
          'overlay': 'rgba(22, 51, 0, 0.08)',
        },
        // Border Colors
        'border': {
          'neutral': 'rgba(14, 15, 12, 0.12)',
          'overlay': 'rgba(14, 15, 12, 0.12)',
        },
        // Sentiment Colors
        'sentiment': {
          'negative': '#A8200D',
          'positive': '#2F5711',
          'warning': '#EDC843',
        },
        // Base Colors
        'base': {
          'contrast': '#FFFFFF',
          'light': '#FFFFFF',
          'dark': '#121511',
        },
        // Brand Colors (for accents)
        'wise': {
          'bright-green': '#9FE870',
          'forest': '#163300',
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['64px', { lineHeight: '0.85', letterSpacing: '0.015em', fontWeight: '700' }],
        'display-md': ['40px', { lineHeight: '0.85', letterSpacing: '0.015em', fontWeight: '700' }],
        'display-sm': ['30px', { lineHeight: '34px', letterSpacing: '-0.025em', fontWeight: '600' }],
        'title-screen': ['26px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-section': ['22px', { lineHeight: '28px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-subsection': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-body': ['14px', { lineHeight: '20px', letterSpacing: '0.015em', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body-lg-bold': ['16px', { lineHeight: '24px', letterSpacing: '0.005em', fontWeight: '600' }],
        'body-default': ['14px', { lineHeight: '22px', letterSpacing: '0.01em', fontWeight: '400' }],
        'body-default-bold': ['14px', { lineHeight: '22px', letterSpacing: '0.0125em', fontWeight: '600' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
