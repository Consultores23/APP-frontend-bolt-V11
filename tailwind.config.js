/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js', // Add this line
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          DEFAULT: '#2ba6ff',
          50: '#f0f8ff',
          100: '#e0f1ff',
          200: '#bae2ff',
          300: '#82caff',
          400: '#42acff',
          500: '#2ba6ff',
          600: '#0073ea',
          700: '#0057b3',
          800: '#084a94',
          900: '#0d3e7b',
          950: '#0a275a',
        },
        dark: {
          100: '#d5d5d5',
          200: '#aaaaaa',
          300: '#808080',
          400: '#555555',
          500: '#2b2b2b',
          600: '#222222',
          700: '#1a1a1a',
          800: '#111111',
          900: '#080808',
          950: '#040404',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        input: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'input-focus': '0 0 0 2px rgba(43, 166, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
