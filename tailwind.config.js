/** @type {import('tailwindcss').Config} */
export default {
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

        ochre: '#B45309', 
      },
    },
  },
  plugins: [],
}