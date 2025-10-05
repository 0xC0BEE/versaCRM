/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Clay-Elevated Harmony Color System
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
        },
        success: {
          DEFAULT: 'var(--success)',
          hover: 'var(--success-hover)',
        },
        error: {
          DEFAULT: 'var(--error)',
          hover: 'var(--error-hover)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          hover: 'var(--warning-hover)',
        },
        info: {
          DEFAULT: 'var(--info)',
          hover: 'var(--info-hover)',
        },
        // Text Colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-inverse': 'var(--text-inverse)',
        // Backgrounds
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'card-bg': 'var(--card-bg)',
        // Borders
        'border-subtle': 'var(--border-subtle)',
        'border-medium': 'var(--border-medium)',
        'border-strong': 'var(--border-strong)',
        // Interactive
        'hover-bg': 'var(--hover-bg)',
        'active-bg': 'var(--active-bg)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'inner': 'var(--shadow-inner)',
        'glow-primary': '0 0 12px var(--primary-glow)',
        'glow-success': '0 0 12px var(--success-glow)',
        'glow-error': '0 0 12px var(--error-glow)',
        'glow-warning': '0 0 12px var(--warning-glow)',
      },
      borderRadius: {
        'micro': 'var(--radius-micro)',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      spacing: {
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'pulse-ai': 'pulse 1s infinite',
        'glow': 'glow 2s infinite',
        'shake': 'shake 0.82s cubic-bezier(.36,.07,.19,.97)',
        'ripple': 'ripple 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(8px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulse: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.02)',
            opacity: '0.9',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 8px var(--primary-glow)',
          },
          '50%': {
            boxShadow: '0 0 16px var(--primary-glow)',
          },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        ripple: {
          'to': {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'modal-backdrop': '1030',
        'modal': '1040',
        'toast': '1050',
        'tooltip': '1060',
      },
      fontSize: {
        // Clay-Elevated Harmony Typography Scale
        'xs': ['11px', { lineHeight: '1.3' }],
        'sm': ['13px', { lineHeight: '1.4' }],
        'base': ['15px', { lineHeight: '1.5' }],
        'lg': ['17px', { lineHeight: '1.5' }],
        'xl': ['22px', { lineHeight: '1.4' }],
        '2xl': ['28px', { lineHeight: '1.3' }],
        'h1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h3': ['22px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
} satisfies Config;
