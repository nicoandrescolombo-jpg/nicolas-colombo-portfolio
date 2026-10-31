import type { Config } from 'tailwindcss'

/**
 * Paleta "proyección": monocroma, como una copia en blanco y negro.
 * - ink: negro real (fondo y franjas del letterbox)
 * - graphite: panel cálido apenas más claro que el negro
 * - paper: hueso / pergamino (texto principal y estados interactivos)
 * - lead: gris cálido (texto secundario)
 * El único color de la página es el de las animaciones.
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        graphite: '#121110',
        rule: '#2A2825',
        paper: '#E8E2D6',
        lead: '#9A948A',
        signal: '#E5484D',
        // Tokens heredados (los usa el panel admin)
        bg: {
          primary: '#000000',
          secondary: '#0F0E0D',
          surface: '#161514',
          elevated: '#1F1D1B',
        },
        text: {
          primary: '#E8E2D6',
          secondary: '#9A948A',
          tertiary: '#6A655E',
        },
        accent: {
          DEFAULT: '#E8E2D6',
          hover: '#FFFFFF',
          muted: '#BDB6A9',
        },
        border: {
          subtle: '#1F1D1B',
          DEFAULT: '#2E2B27',
        },
        state: {
          error: '#FF5A5F',
          success: '#4ADE80',
          warning: '#FBBF24',
        },
      },
      fontFamily: {
        display: ['var(--font-alegreya)', 'Georgia', 'serif'],
        sans: ['var(--font-alegreya)', 'Georgia', 'serif'],
        body: ['var(--font-alegreya)', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1', letterSpacing: '-0.015em' }],
        'display-xl': ['clamp(2.75rem, 6.5vw, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.012em' }],
        'display-lg': ['clamp(2.5rem, 5vw, 4.25rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.6rem, 3vw, 2.4rem)', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        site: '90rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.4s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      aspectRatio: {
        video: '16 / 9',
        cinema: '21 / 9',
        portrait: '9 / 16',
        square: '1 / 1',
        'card-wide': '4 / 3',
        'card-tall': '3 / 4',
      },
    },
  },
  plugins: [],
}

export default config
