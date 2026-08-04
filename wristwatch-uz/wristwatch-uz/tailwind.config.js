/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FAF7F0',
        paper: '#F5F1E8',
        ink: '#0E0D0B',
        graphite: '#1C1A16',
        gold: {
          DEFAULT: '#B08D57',
          light: '#D4B483',
          dark: '#8A6D3F',
          bright: '#C9A365',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
