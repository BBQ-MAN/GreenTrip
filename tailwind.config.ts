import type { Config } from 'tailwindcss';
import { tokens } from './src/styles/tokens';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // shadcn/ui 컨벤션 — CSS 변수 기반 (globals.css 참조)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // GreenTrip 시그니처 토큰 (직접 hex)
        brand: {
          DEFAULT: tokens.color.brand.primary.light,
          hover: tokens.color.brand.primaryHover.light,
          surface: tokens.color.brand.primarySurface.light,
          dark: tokens.color.brand.primary.dark,
        },
        carbon: {
          'low-bg': tokens.color.carbon.low.bg.light,
          'low-fg': tokens.color.carbon.low.fg.light,
          'mid-bg': tokens.color.carbon.mid.bg.light,
          'mid-fg': tokens.color.carbon.mid.fg.light,
          'high-bg': tokens.color.carbon.high.bg.light,
          'high-fg': tokens.color.carbon.high.fg.light,
          'severe-bg': tokens.color.carbon.severe.bg.light,
          'severe-fg': tokens.color.carbon.severe.fg.light,
        },
        transport: {
          eco: tokens.color.transport.eco.light,
          balance: tokens.color.transport.balance.light,
          fast: tokens.color.transport.fast.light,
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '55px', fontWeight: '800' }],
        'display-md': ['2.25rem', { lineHeight: '44px', fontWeight: '800' }],
        'heading-lg': ['1.75rem', { lineHeight: '36px', fontWeight: '700' }],
        'heading-md': ['1.375rem', { lineHeight: '30px', fontWeight: '700' }],
        'heading-sm': ['1.125rem', { lineHeight: '25px', fontWeight: '600' }],
        'body-lg': ['1.0625rem', { lineHeight: '27px', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '26px', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '21px', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '17px', fontWeight: '500' }],
        'numeric-hero': [
          '3.5rem',
          { lineHeight: '56px', fontWeight: '800', letterSpacing: '-0.02em' },
        ],
        'numeric-lg': [
          '2.25rem',
          { lineHeight: '36px', fontWeight: '800', letterSpacing: '-0.02em' },
        ],
        'numeric-md': ['1.375rem', { lineHeight: '24px', fontWeight: '700' }],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
      },
      boxShadow: {
        sm: tokens.shadow.sm.light,
        md: tokens.shadow.md.light,
        lg: tokens.shadow.lg.light,
        brand: tokens.shadow.brand.light,
      },
      transitionTimingFunction: {
        standard: tokens.motion.easing.standard,
        decelerate: tokens.motion.easing.decelerate,
        accelerate: tokens.motion.easing.accelerate,
      },
      transitionDuration: {
        '240': '240ms',
        '720': '720ms',
      },
      aspectRatio: {
        tour: '16 / 9',
        course: '4 / 3',
        map: '4 / 3',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
