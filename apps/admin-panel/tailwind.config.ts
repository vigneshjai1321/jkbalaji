import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v4 - design tokens for JK Balaji.
 * v4 is CSS-first; this file is loaded explicitly from src/styles/globals.css via `@config`.
 * Content sources are auto-detected in v4, `content` is kept for editor tooling clarity.
 * Plot status colours are part of the design system (used by maps, badges, charts).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8e6',
          100: '#ffecb8',
          500: '#d4a017',
          600: '#b8860b',
          700: '#8f6a08',
          900: '#3d2d03',
        },
        plot: {
          available: '#16a34a',
          blocked: '#f59e0b',
          booked: '#2563eb',
          registered: '#7c3aed',
          sold: '#dc2626',
          notForSale: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
};

export default config;
