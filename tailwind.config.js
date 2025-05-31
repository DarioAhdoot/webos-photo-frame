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
        dark: {
          bg: '#222222',
          card: '#2a2a2a',
          border: '#404040',
          text: '#e5e5e5',
          muted: '#a0a0a0',
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-left': 'slideLeft 1s ease-in-out',
        'slide-right': 'slideRight 1s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}