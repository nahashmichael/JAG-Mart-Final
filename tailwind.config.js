/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: {
            light: '#4A5D4F',  // Matte sage green
            DEFAULT: '#2C392F', // Deep forest green
            dark: '#1A231C'    // Dark moss green
          },
          red: {
            light: '#8B4744',  // Muted brick red
            DEFAULT: '#6B3532', // Deep clay red
            dark: '#4A2422'    // Dark maroon
          },
          brown: {
            light: '#796657',  // Warm taupe
            DEFAULT: '#5A4B3F', // Rich coffee brown
            dark: '#3B312A'    // Deep espresso
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}