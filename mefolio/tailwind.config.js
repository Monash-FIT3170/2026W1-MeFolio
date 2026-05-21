module.exports = {
  content: [
    "./imports/ui/**/*.{js,jsx,ts,tsx}",
    "./client/*.{js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: "320px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1280px",
      },
    },
  },
  plugins: [],
};
