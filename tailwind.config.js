/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f9f0',
          100: '#d1f3e1',
          200: '#a3e7c3',
          300: '#75dba5',
          400: '#47cf87',
          500: '#25D366', // WhatsApp Green
          600: '#1ea952',
          700: '#167f3e',
          800: '#0f542a',
          900: '#072a15',
        },
        secondary: {
          50: '#e6f2f1',
          100: '#cce5e3',
          200: '#99cbc7',
          300: '#66b1ab',
          400: '#33978f',
          500: '#075E54', // WhatsApp Dark Green
          600: '#064b43',
          700: '#043832',
          800: '#032522',
          900: '#011311',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
