/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        danger: "#ff2d2d",
        gold: "#c9a227",
        ember: "#ff6b00",
        ash: "#1a1a1a",
        smoke: "#2a2a2a",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-rajdhani)", "sans-serif"],
        mono: ["var(--font-share-tech-mono)", "monospace"],
      },
      animation: {
        "flicker": "flicker 3s linear infinite",
        "pulse-danger": "pulseDanger 2s ease-in-out infinite",
        "typewriter": "typewriter 0.05s steps(1) forwards",
        "scanline": "scanline 8s linear infinite",
        "ember-float": "emberFloat 6s ease-in-out infinite",
      },
      keyframes: {
        flicker: {
          "0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%": { opacity: "1" },
          "20%, 21.999%, 63%, 63.999%, 65%, 69.999%": { opacity: "0.4" },
        },
        pulseDanger: {
          "0%, 100%": { boxShadow: "0 0 20px #ff2d2d44, 0 0 60px #ff2d2d22" },
          "50%": { boxShadow: "0 0 40px #ff2d2d88, 0 0 100px #ff2d2d44" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        emberFloat: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)", opacity: "0.7" },
          "50%": { transform: "translateY(-20px) rotate(180deg)", opacity: "0.3" },
        },
      },
      backgroundImage: {
        "city-grid": "linear-gradient(rgba(201,162,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
