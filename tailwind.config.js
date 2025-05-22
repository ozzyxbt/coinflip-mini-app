/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 1.2s linear infinite',
        'flip': 'flip 1.5s forwards',
        'coin-bounce': 'coinBounce 0.5s ease-out forwards',
        'scale-up': 'scaleUp 0.3s ease-out forwards',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0) scale(1)' },
          '50%': { transform: 'rotateY(450deg) scale(1.4)' },
          '100%': { transform: 'rotateY(900deg) scale(1)' },
        },
        coinBounce: {
          '0%': { transform: 'translateY(-20px) scale(1.2)' },
          '60%': { transform: 'translateY(10px) scale(0.9)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(131, 110, 249, 0.5)',
        'gold': '0 0 15px 5px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  plugins: [],
};