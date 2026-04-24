/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
        serif: 'var(--font-serif), serif',
      },
      colors: {
        'bg-main': 'var(--color-bg-main)',
        'bg-side': 'var(--color-bg-side)',
        'bg-hover': 'var(--color-bg-hover)',
        'bg-active': 'var(--color-bg-active)',
        'card': 'var(--color-card)',
        'text-main': 'var(--color-text-main)',
        'text-dim': 'var(--color-text-dim)',
        'text-dark': 'var(--color-text-dark)',
        'g50': '#ECFDF5',
        'g100': '#D1FAE5',
        'g400': '#10B981',
        'g600': '#059669',
        'g800': '#065F46',
        't50': '#ECFDF5',
        't400': '#10B981',
        't600': '#059669',
        'a50': '#FFFBEB',
        'a400': '#F59E0B',
        'a600': '#D97706',
        'b50': '#EFF6FF',
        'b400': '#3B82F6',
        'b600': '#2563EB',
        'r50': '#FEF2F2',
        'r400': '#EF4444',
        'r600': '#DC2626',
      },
      borderRadius: {
        'xl': '24px',
        'lg': '16px',
        'md': '12px',
      },
    },
  },
  plugins: [],
}
