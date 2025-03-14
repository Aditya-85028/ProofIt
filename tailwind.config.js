/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Ensure this points to your source code
    "./app/**/*.{js,tsx,ts,jsx}",
    "./src/**/*.{js,tsx,ts,jsx}",
    "./components/**/*.{js,tsx,ts,jsx}",
    "./hooks/**/*.{js,tsx,ts,jsx}",
    "./constants/**/*.{js,tsx,ts,jsx}",
    "./assets/**/*.{js,tsx,ts,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
