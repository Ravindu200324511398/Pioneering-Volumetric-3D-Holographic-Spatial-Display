/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hologram: {
          cyan: "#00f3ff",
          magenta: "#ff007f",
          purple: "#9d4edd",
          blue: "#3a86ff",
          neon: "#39ff14",
          darkBg: "#060913",
          cardBg: "rgba(13, 20, 36, 0.75)",
          border: "rgba(0, 243, 255, 0.25)",
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-fast': 'spin 0.6s linear infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 243, 255, 0.6)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 8px rgba(0, 243, 255, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
