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
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          DEFAULT: '#16a34a',
          bg: '#f0fdf4',
        },
        warning: {
          DEFAULT: '#d97706',
          bg: '#fffbeb',
        },
        error: {
          DEFAULT: '#dc2626',
          bg: '#fef2f2',
        },
        info: {
          DEFAULT: '#2563eb',
          bg: '#eff6ff',
        },
        emergency: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', '-apple-system', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'primary': '0 4px 14px rgba(13, 148, 136, 0.25)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
