import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kezpo: {
          blue: "#2AABE2",
          "blue-dark": "#1a8fc5",
          "blue-light": "#e8f6fd",
        },
      },
    },
  },
  plugins: [],
};

export default config;
