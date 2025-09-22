
import type {Config} from 'tailwindcss';
const plugin = require('tailwindcss/plugin')

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['"DSEG7-Classic"', 'monospace'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in-up': {
          '0%': {
              opacity: '0',
              transform: 'translateY(20px)'
          },
          '100%': {
              opacity: '1',
              transform: 'translateY(0)'
          },
        },
        tilt: {
          '0%, 50%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(0.5deg)',
          },
          '75%': {
            transform: 'rotate(-0.5deg)',
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'zoom-pan': {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)' },
          '50%': { transform: 'scale(1.1) translate(2%, -2%)' },
        },
        'synthwave-scroll': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '0 -200%' },
        },
        'black-hole-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '10%': { transform: 'translate(-2px, 2px)' },
          '20%': { transform: 'translate(2px, -2px)' },
          '30%': { transform: 'translate(-2px, -2px)' },
          '40%': { transform: 'translate(2px, 2px)' },
          '50%': { transform: 'translate(0)' },
          '100%': { transform: 'translate(0)' },
        },
        'steampunk-rotate': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'lofi-rain': {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '20% 40%' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'tilt': 'tilt 10s infinite linear',
        'shimmer': 'shimmer 2s infinite',
        'zoom-pan': 'zoom-pan 30s ease-in-out infinite',
        'synthwave-scroll': 'synthwave-scroll 10s linear infinite',
        'black-hole-spin': 'black-hole-spin 50s linear infinite',
        'glitch': 'glitch 1.5s steps(2, jump-none) infinite',
        'steampunk-rotate': 'steampunk-rotate 10s linear infinite',
        'lofi-rain': 'lofi-rain 0.2s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function({ theme, addUtilities }: { theme: any, addUtilities: any }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 0 8px var(--tw-shadow-color, currentColor)',
        },
      }
      addUtilities(newUtilities)
    }),
  ],
} satisfies Config;

    