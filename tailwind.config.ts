import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        muted: 'hsl(var(--muted))',
        surface: 'hsl(var(--surface))',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.85', filter: 'blur(0px)' },
          '50%': { opacity: '1', filter: 'blur(1px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.8s ease-out both',
        float: 'float 6s ease-in-out infinite',
        slideUp: 'slideUp 0.6s ease-out both',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 32px 95px -40px rgba(10, 12, 30, 0.75)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'radial-spot':
          'radial-gradient(circle at 24% 18%, rgba(255, 204, 214, 0.22), transparent 50%), radial-gradient(circle at 78% 12%, rgba(140, 160, 220, 0.18), transparent 55%)',
      },
    },
  },
  plugins: [],
};

export default config;
