/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [
    require('../design-system/tailwind.config.cjs')
  ],
}
