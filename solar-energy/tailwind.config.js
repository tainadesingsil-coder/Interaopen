/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F6F1EA',
        ocean: '#08263A',
        ink: '#1D2430',
        muted: '#6B7280',
        gold: '#B7925A',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(8, 38, 58, 0.08)',
        card: '0 18px 40px rgba(8, 38, 58, 0.12)',
        glow: '0 16px 40px rgba(8, 38, 58, 0.25)',
      },
      borderRadius: {
        xl: '20px',
        '2xl': '24px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-manrope)', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

