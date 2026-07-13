/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
