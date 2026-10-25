/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#FDF2F4',
          100: '#FBE4E8',
          200: '#F7C6CF',
          300: '#F099A9',
          400: '#E4617B',
          500: '#CF3354',
          600: '#B51E3E',
          700: '#9B1736',
          800: '#8F1538', // Prompt specific burgundy
          900: '#690F29',
          950: '#420718',
        },
        cherry: {
          50: '#FFF1F2',
          100: '#FFE1E4',
          200: '#FFC8CE',
          300: '#FFA0AC',
          400: '#F7687C',
          500: '#C62845', // Prompt specific cherry red
          600: '#B01E39',
          700: '#94162E',
          800: '#7D152A',
          900: '#681727',
        },
        rosepink: {
          50: '#FFF6F8',
          100: '#FDEEF1',
          200: '#FCDCE3',
          300: '#F4C2CC', // Prompt specific rose pink
          400: '#EE9BAE',
          500: '#E26D87',
        },
        blush: {
          DEFAULT: '#FFF0F2', // Prompt specific blush
          50: '#FFFFFF',
          100: '#FFF0F2',
          200: '#FFE0E5',
          300: '#FDC4CD',
        },
        cream: {
          DEFAULT: '#FFF9F5', // Prompt specific cream
          50: '#FFFFFF',
          100: '#FFF9F5',
          200: '#FFF1E8',
          300: '#FDE4D2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(143, 21, 56, 0.08), 0 2px 6px -1px rgba(143, 21, 56, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(143, 21, 56, 0.12), 0 4px 10px -2px rgba(143, 21, 56, 0.06)',
        'glow': '0 0 25px rgba(198, 40, 69, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
