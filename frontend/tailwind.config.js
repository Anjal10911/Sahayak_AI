/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        indigo: {
          deep: "#1B1035",
          base: "#2D1B5E",
        },
        marigold: {
          DEFAULT: "#FF9F1C",
          dim: "#FFD08A",
        },
        leaf: "#2EC4B6",
        cream: "#FBF7F0",
        risk: {
          clean: "#2EC4B6",
          review: "#FF9F1C",
          high: "#E63946",
        },
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
