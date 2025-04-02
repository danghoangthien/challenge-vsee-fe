/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vsee-green': 'var(--vsee-green)',
        'vsee-blue': 'var(--vsee-blue)',
        'vsee-light-gray': 'var(--vsee-light-gray)',
        'vsee-dark': 'var(--vsee-dark)',
      },
    },
  },
  plugins: [],
} 