import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: true, // enables all themes
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: true,
  },
};
