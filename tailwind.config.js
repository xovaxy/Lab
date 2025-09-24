/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        background: {
          start: '#061025',
          end: '#2b0b3a',
        },
        accent: {
          primary: '#00f5d4',
          secondary: '#9b5de5',
          tertiary: '#f15bb5',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e0e0e0',
          muted: '#a0a0a0',
        },
      },
      boxShadow: {
        glass: '0 4px 30px rgba(0, 0, 0, 0.3)',
        glow: '0 0 15px rgba(0, 245, 212, 0.5)',
        'glow-purple': '0 0 15px rgba(155, 93, 229, 0.5)',
        'glow-pink': '0 0 15px rgba(241, 91, 181, 0.5)',
      },
      animation: {
        'gradient-x': 'gradient-x 8s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 600ms ease-out both',
        'fade-in-up': 'fade-in-up 700ms ease-out both',
        'fade-in-down': 'fade-in-down 700ms ease-out both',
        'fade-in-right': 'fade-in-right 700ms ease-out both',
        'scale-in': 'scale-in 500ms ease-out both',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
