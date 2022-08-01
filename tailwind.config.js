/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['fot-tsukuardgothic-std', 'sans-serif']
    },
    extend: {
      colors: {
        transparent: 'transparent'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
