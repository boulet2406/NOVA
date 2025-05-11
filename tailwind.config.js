/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',      // on active le mode sombre via la classe `dark`
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
