/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta FutBoss
        'futboss': {
          'purple': '#6B46C1',
          'magenta': '#D946EF',
          'blue-neon': '#06B6D4',
          'orange': '#F97316',
          'dark': '#000000',
          'gray-dark': '#1F2937',
          'gray-medium': '#374151',
        }
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #6B46C1 0%, #000000 100%)',
        'gradient-card': 'linear-gradient(145deg, #1F2937 0%, #374151 100%)',
        'gradient-button': 'linear-gradient(135deg, #6B46C1, #D946EF)',
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        glow: {
          '0%': {
            textShadow: '0 0 20px #6B46C1'
          },
          '100%': {
            textShadow: '0 0 30px #D946EF, 0 0 40px #D946EF'
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        }
      },
      boxShadow: {
        'glow': '0 4px 15px rgba(107, 70, 193, 0.4)',
        'glow-hover': '0 8px 25px rgba(107, 70, 193, 0.6)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}