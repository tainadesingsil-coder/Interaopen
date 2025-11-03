/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        neon: '#9eff00',
        softWhite: '#f2f2f2',
        softGray: '#b8b8b8',
        chrome: '#d1d5db',
      },
      fontFamily: {
        sans: [
          'Poppins',
          'Sora',
          'Manrope',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
        display: [
          'Poppins',
          'Sora',
          'Manrope',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          md: '1.25rem',
          lg: '1.5rem',
          xl: '2rem',
        },
      },
      boxShadow: {
        neon: '0 0 18px rgba(158,255,0,0.35), 0 0 3px rgba(158,255,0,0.6) inset',
        soft: '0 10px 30px rgba(0,0,0,0.35)',
        neonGreenCyan: '0 0 22px rgba(158,255,0,0.28), 0 0 26px rgba(0,200,255,0.18)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '0.35', filter: 'blur(12px)' },
          '50%': { opacity: '0.6', filter: 'blur(16px)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(158,255,0,0.25), 0 0 14px rgba(0,200,255,0.15)' },
          '50%': { boxShadow: '0 0 16px rgba(158,255,0,0.38), 0 0 22px rgba(0,200,255,0.25)' },
        },
        circuit: {
          '0%': { backgroundPosition: '0 0, 0 0' },
          '100%': { backgroundPosition: '200px 0, -200px 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGreen: 'pulseGreen 2.6s ease-in-out infinite',
        neonPulse: 'neonPulse 2.2s ease-in-out infinite',
        circuit: 'circuit 16s linear infinite',
        fadeUp: 'fadeUp 0.8s ease-out both',
      },
      backgroundImage: {
        'metal-sheen':
          'linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.35) 16%, rgba(255,255,255,0.08) 32%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.08) 64%)',
        'neon-diagonal': 'linear-gradient(135deg, rgba(158,255,0,0.22), rgba(0,200,255,0.18))',
        'neon-linear': 'linear-gradient(90deg, #9eff00, #00c8ff)',
        'radial-soft': 'radial-gradient(circle at center, rgba(255,255,255,0.06), transparent 60%)',
      },
    },
  },
  plugins: [],
}

