/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dahab: {
          teal: '#0d9488',
          gold: '#fbbf24',
          sand: '#fffbeb',
          blue: '#0ea5e9'
        }
      }
    },
  },
  plugins: [],
}
