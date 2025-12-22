/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mine-blue': '#0066FF',
        'mine-orange': '#FF6600',
        'mine-green': '#00FF66',
      },
    },
  },
  plugins: [],
}
