import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './composables/**/*.{ts,js}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        // Mood colors
        mood: {
          happy:     '#FFD700',
          sad:       '#6B9BD2',
          excited:   '#FF4500',
          relaxed:   '#90EE90',
          romantic:  '#FFB6C1',
          scared:    '#800080',
          inspired:  '#FFA500',
          nostalgic: '#D2691E',
        },
        // Dark cinema theme
        cinema: {
          950: '#050508',
          900: '#0a0a12',
          800: '#111120',
          700: '#1a1a2e',
          600: '#222240',
          500: '#2e2e55',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(255,255,255,0.05)',
        'glow': '0 0 20px rgba(255,255,255,0.08)',
        'glow-lg': '0 0 40px rgba(255,255,255,0.12)',
        'card': '0 8px 32px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  safelist: [
    // Mood color classes for dynamic usage with GSAP targets
    'text-mood-happy', 'text-mood-sad', 'text-mood-excited', 'text-mood-relaxed',
    'text-mood-romantic', 'text-mood-scared', 'text-mood-inspired', 'text-mood-nostalgic',
    'bg-mood-happy', 'bg-mood-sad', 'bg-mood-excited', 'bg-mood-relaxed',
    'bg-mood-romantic', 'bg-mood-scared', 'bg-mood-inspired', 'bg-mood-nostalgic',
    'border-mood-happy', 'border-mood-sad', 'border-mood-excited', 'border-mood-relaxed',
    'border-mood-romantic', 'border-mood-scared', 'border-mood-inspired', 'border-mood-nostalgic',
    // GSAP animation targets
    'movie-card', 'mood-btn', 'modal-overlay', 'modal-panel',
  ],
  plugins: [],
} satisfies Config
