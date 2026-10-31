import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        chalk: {
          0: 'var(--chalk-0)',
          50: 'var(--chalk-50)',
          100: 'var(--chalk-100)',
        },
        board: {
          100: 'var(--board-100)',
          200: 'var(--board-200)',
          300: 'var(--board-300)',
          400: 'var(--board-400)',
          500: 'var(--board-500)',
          700: 'var(--board-700)',
          900: 'var(--board-900)',
        },
        pencil: {
          100: 'var(--pencil-100)',
          300: 'var(--pencil-300)',
          500: 'var(--pencil-500)',
          700: 'var(--pencil-700)',
        },
        leaf: {
          100: 'var(--leaf-100)',
          600: 'var(--leaf-600)',
        },
        redpen: {
          100: 'var(--redpen-100)',
          600: 'var(--redpen-600)',
        },
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
      },
      boxShadow: {
        float: 'var(--shadow-float)',
      },
    },
  },
  plugins: [],
} satisfies Config;
