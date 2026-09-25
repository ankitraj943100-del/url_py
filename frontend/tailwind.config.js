/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F14',
        card: '#111820',
        hover: '#1A232E',
        border: '#202833',
        subdued: '#161F2A',
        primaryText: '#F8FAFC',
        mutedText: '#94A3B8',
        accentBlue: '#3B82F6',
        statusGreen: '#22C55E',
        statusAmber: '#F59E0B',
        statusRed: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
