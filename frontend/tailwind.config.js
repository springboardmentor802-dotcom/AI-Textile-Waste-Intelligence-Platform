/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#fcfbf7',
          100: '#f6f4e8',
          200: '#ebe6c5',
          300: '#dcd39b',
          400: '#cbba70',
          500: '#b9a04c',
          600: '#9d833c',
          700: '#7c6430',
          800: '#604d27',
          900: '#48391f',
          950: '#261e0f',
        },
        forest: {
          50: '#f2f8f4',
          100: '#e1ede5',
          200: '#c5dacd',
          300: '#9cbca9',
          400: '#6c977f',
          500: '#4d7c64',
          600: '#3a624e',
          700: '#2f4f40',
          800: '#274034',
          900: '#21352c',
          950: '#111e19',
        },
        accent: {
          light: '#f5efe6',
          dark: '#e3d5ca',
          sand: '#d5bdaf',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
