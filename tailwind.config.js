/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Monkeytype-inspired color palette
      colors: {
        // Dark theme (primary)
        'bg-primary': '#323437',
        'bg-secondary': '#2c2e31',
        'text-primary': '#d1d0c5',
        'text-secondary': '#646669',
        'accent': '#e2b714',
        'error': '#ca4754',
        'success': '#47ca4b',
        
        // Light theme
        'bg-light-primary': '#e5e5e5',
        'bg-light-secondary': '#d5d5d5',
        'text-light-primary': '#323437',
        'text-light-secondary': '#646669',
      },
      fontFamily: {
        'mono': ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}