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
        telegram: {
          blue: '#0088cc',
          dark: '#17212b',
          light: '#242f3d',
        }
      }
    },
  },
  plugins: [],
}

