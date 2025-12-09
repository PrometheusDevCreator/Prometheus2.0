/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prometheus: {
          dark: '#0d0d0d',
          panel: '#1a1a1a',
          input: '#252525',
        },
        accent: {
          green: '#22c55e',
          orange: '#f97316',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
