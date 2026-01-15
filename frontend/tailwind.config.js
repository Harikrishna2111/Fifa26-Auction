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
                        "primary": "#0df259",
                        "accent-gold": "#FFD700",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
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
                },
            },
  plugins: [],
};
