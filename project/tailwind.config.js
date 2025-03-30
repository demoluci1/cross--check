/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#8098fb',
          500: '#6172f3',
          600: '#4e53e6',
          700: '#4342cc',
          800: '#3939a5',
          900: '#333683',
          950: '#1f1f4d',
        },
        // Background and UI element colors
        background: {
          DEFAULT: '#f8f9fe',
          dark: '#0c0f1d',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#161a2c',
        },
        // Status colors
        status: {
          active: '#22c55e',
          completed: '#6b7280',
          upcoming: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 6px 16px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        card: '16px',
        button: '8px',
      },
    },
  },
  plugins: [],
};
