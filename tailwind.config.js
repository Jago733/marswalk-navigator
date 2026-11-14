/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#000000',
          panel: '#1D1D1F',
          surface: '#161617',
          card: '#2C2C2E',
          hover: '#3A3A3C',
          border: 'rgba(255, 255, 255, 0.12)',
          borderSubtle: 'rgba(255, 255, 255, 0.06)',
          blue: '#0071E3',
          blueHover: '#0076DF',
          blueActive: '#0062C4',
          text: '#F5F5F7',
          textSecondary: '#86868B',
          textTertiary: '#6E6E73',
          green: '#30D158',
          orange: '#FF9F0A',
          red: '#FF453A',
          purple: '#BF5AF2',
        },
        mars: {
          rust: '#C1440E',
          red: '#E26D5C',
          sand: '#E76F51',
          gold: '#F4A261',
          dust: '#E0A96D',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        'apple-pill': '980px',
        'apple-card': '18px',
        'apple-sm': '12px',
      },
      boxShadow: {
        'apple-card': '0 4px 24px -1px rgba(0, 0, 0, 0.35)',
        'apple-float': '0 12px 40px -4px rgba(0, 0, 0, 0.55)',
        'apple-glow': '0 0 20px rgba(0, 113, 227, 0.35)',
      },
      backdropBlur: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}
