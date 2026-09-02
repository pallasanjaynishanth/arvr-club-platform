/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f7',
          100: '#d6ddec',
          200: '#adbbd9',
          300: '#8399c6',
          400: '#5a77b3',
          500: '#3d5a94',
          600: '#2c4574',
          700: '#1f3357',
          800: '#16233d',
          900: '#0e1728',
        },
        gold: {
          400: '#c9a659',
          500: '#b08d3f',
          600: '#8f7130',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
