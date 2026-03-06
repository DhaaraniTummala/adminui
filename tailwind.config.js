import { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import withMT from "@material-tailwind/react/utils/withMT";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins"],
      },
      fontWeight: {
        normal: 400,
        bold: 800,
      },
      colors: {
        primary: "#6499E9",
        customGray: '#f7f7f7',
      },
      screens: {
        mobile: "320px",
        mobileM: "475px",
        mobileL: "580px",
        mobileXL: "640px",
        tablet: "768px",
        tabletL: "962px",
        laptop: "1024px",
        laptopM: "1280px",
      },
    },
    screens: {
      mobile: "320px",
      mobileM: "475px",
      mobileL: "580px",
      mobileXL: "640px",
      tablet: "768px",
      tabletL: "962px",
      laptop: "1024px",
      laptopM: "1280px",
    },
  },
  variants: {
    extend: {
      textColor: ['dark', 'hover', 'dark:hover'],
    },
  },
  plugins: [],
};

export default withMT(config);
