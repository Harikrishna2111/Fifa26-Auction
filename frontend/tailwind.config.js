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
                        "background-light": "#0a0f0c",
                        "background-dark": "#0a0f0b",
                        "bg-dark": "#050807",
                        "accent-blue": "#3b82f6",
                        "accent-gold": "#FFD700",
                        "panel-dark": "#121816",
                        "pitch-green": "#112218",
                        "auction-gold": "#ffd700",
                        "auction-red": "#ff4d4d",
                        "auction-yellow": "#fbbf24",
                        "surface-dark": "#162c1d",
                        "card-bg": "#161b18",
                        "input-bg": "#0d1210",
                        "gold": "#FFD700",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "0.5rem",
                        "lg": "1rem",
                        "xl": "1.5rem",
                        "2xl": "2rem",
                        "full": "9999px"
                    },
                    backgroundImage: {
                        'pitch-pattern': 'repeating-linear-gradient(90deg, #152a1e 0px, #152a1e 100px, #112218 100px, #112218 200px)',
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    },
                    keyframes: {
                        marquee: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(-100%)' } },
                        shine: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } }
                    }
                },
            },
  plugins: [],
};
