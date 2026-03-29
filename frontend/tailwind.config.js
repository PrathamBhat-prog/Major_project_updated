const colors = require('tailwindcss/colors');

module.exports = {
  mode: 'jit',
  purge: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        slate: colors.blueGray,
        gray: colors.gray,
        zinc: colors.gray,
        neutral: colors.trueGray,
        stone: colors.warmGray,
        red: colors.red,
        orange: colors.orange,
        amber: colors.amber,
        yellow: colors.yellow,
        lime: colors.lime,
        green: colors.green,
        emerald: colors.emerald,
        teal: colors.teal,
        cyan: colors.cyan,
        sky: colors.lightBlue,
        blue: colors.blue,
        indigo: colors.indigo,
        violet: colors.violet,
        purple: colors.purple,
        fuchsia: colors.fuchsia,
        pink: colors.pink,
        rose: colors.rose,
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};