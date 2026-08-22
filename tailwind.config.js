/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/app/**/*.{js,jsx}", "./src/components/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        yeah: {
          primary: "#0d111d",
          secondary: "#20242f",
          text: "#dddfff",
        },
        linkedin: "#0a66c2",
      },
    },
  },

  plugins: [],
};

export default config;
