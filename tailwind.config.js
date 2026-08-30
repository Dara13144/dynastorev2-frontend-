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
        background: {
          DEFAULT: '#090a0f',
          card: '#10131d',
          surface: '#151928',
          hover: '#1c2237',
        },
        brand: {
          cyan: '#00f0ff',
          purple: '#8b5cf6',
          violet: '#6366f1',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
        aba: {
          blue: '#005f83',
          red: '#ee2e24',
          dark: '#003a52',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Kantumruy Pro', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Kantumruy Pro', 'sans-serif'],
        khmer: ['Kantumruy Pro', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.35)',
        'neon-purple': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15), transparent 70%)',
      }
    },
  },
  plugins: [],
};
