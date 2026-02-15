/** @type {import('tailwindcss').Config} */
export default {
  // On utilise 'class' pour que Tailwind surveille la classe sur la balise <html>
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: '#E2725B',
        'dark-soft': '#2D2D2D',
        cream: '#FDFBF7',
      },
    },
  },
  plugins: [],
}