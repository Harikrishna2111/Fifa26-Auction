/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
            theme: {
                extend: {
                    
                    colors: {
                        "primary": "#0df259", // Neon Green
                        "background-light": "#f5f8f6",
                        "background-dark": "#0a0f0b",
                        "accent-blue": "#3b82f6",
                        "accent-gold": "#FFD700",
                        "panel-dark": "#121816",
                        "auction-gold": "#ffd700",
                        "auction-red": "#ff4d4d",
                        "auction-yellow": "#fbbf24",
                        "surface-dark": "#162c1d",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
                        "full": "9999px"
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                },
            },
  plugins: [],
};
