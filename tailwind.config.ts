import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds - Iryna's dark blue theme
        bg: {
          primary: '#0F0F1A',
          secondary: '#161625',
          tertiary: '#1C1C2E',
          card: '#1A1A2E',
          hover: '#252540',
          input: '#12121F',
        },
        // Accent - Lime green from Iryna's design
        accent: {
          DEFAULT: '#ADFF2F',
          hover: '#C5FF5A',
          pressed: '#9AE625',
          muted: 'rgba(173, 255, 47, 0.15)',
          dark: '#8BC926',
        },
        // Gold for levels/rewards
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CC9900',
          muted: 'rgba(255, 215, 0, 0.15)',
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#B4B4C7',
          muted: '#6B6B80',
          disabled: '#4A4A5C',
        },
        // Status colors
        status: {
          success: '#22C55E',
          'success-bg': 'rgba(34, 197, 94, 0.15)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.15)',
          error: '#EF4444',
          'error-bg': 'rgba(239, 68, 68, 0.15)',
          pending: '#ADFF2F',
          'pending-bg': 'rgba(173, 255, 47, 0.15)',
          info: '#3B82F6',
          'info-bg': 'rgba(59, 130, 246, 0.15)',
          funded: '#ADFF2F',
          'funded-bg': 'rgba(173, 255, 47, 0.15)',
          delivered: '#22C55E',
          'delivered-bg': 'rgba(34, 197, 94, 0.15)',
          disputed: '#EF4444',
          'disputed-bg': 'rgba(239, 68, 68, 0.15)',
          accepted: '#3B82F6',
          'accepted-bg': 'rgba(59, 130, 246, 0.15)',
        },
        // Crypto colors
        crypto: {
          usdt: '#26A17B',
          btc: '#F7931A',
          eth: '#627EEA',
          ltc: '#345D9D',
          trc20: '#FF0013',
        },
        // Border
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          accent: 'rgba(173, 255, 47, 0.3)',
        },
      },
      backgroundImage: {
        // Gradient for balance card
        'balance-gradient': 'linear-gradient(135deg, #1A1A2E 0%, #252540 100%)',
        'level-gradient': 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
        'accent-gradient': 'linear-gradient(135deg, #ADFF2F 0%, #8BC926 100%)',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '12px',
        'badge': '8px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'button': '0 4px 12px rgba(173, 255, 47, 0.25)',
        'glow': '0 0 20px rgba(173, 255, 47, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
