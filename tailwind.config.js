/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-primary)',
        shell: 'var(--bg-shell)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
        'primary-soft': 'var(--bg-primary-soft)',
        
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        
        border: {
          DEFAULT: 'var(--border-light)',
          medium: 'var(--border-medium)',
          strong: 'var(--border-medium)',
        },
        
        trading: {
          profit: 'var(--profit)',
          loss: 'var(--loss)',
          neutral: 'var(--warning)',
          open: 'var(--primary)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      transitionDuration: {
        '200': '200ms',
      }
    },
  },
  plugins: [],
}
