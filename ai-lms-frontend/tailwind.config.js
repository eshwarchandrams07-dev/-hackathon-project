/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        foundation: {
          blue: '#102A43',
          dark: '#0B1D30',
          hover: '#1B3A57',
        },
        aether: {
          purple: '#7B61FF',
          dark: '#6348EE',
          light: '#F3F0FF',
          border: 'rgba(123, 97, 255, 0.35)',
        },
        quantum: {
          teal: '#00A3BF',
          dark: '#008CA4',
          light: '#E6F8FB',
          border: 'rgba(0, 163, 191, 0.35)',
        },
        studio: {
          white: '#F0F4F8',
          card: '#FFFFFF',
          hover: '#F8FAFC',
          border: '#D9E2EC',
        },
        charcoal: {
          text: '#243B53',
          muted: '#627D98',
          subtle: '#829AB1',
          heading: '#102A43',
        },
        // Direct theme tokens matching the image roles:
        primary: '#102A43',    // Foundation Blue (Major UI, structure, headers)
        secondary: '#7B61FF',  // Aether Purple (AI accent, insights, Socratic)
        accent: '#00A3BF',     // Quantum Teal (CTAs, buttons, progress)
        canvas: '#F0F4F8',     // Studio White (Background)
        neutral: '#243B53',    // Charcoal Text (Body text)
        surface: '#FFFFFF',    // Pure White Card
        border: '#D9E2EC',     // Clean subtle border
        muted: '#627D98',      // Muted slate text
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
