/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    '@tailwindcss/postcss': {}, // make sure this is here
  },
};
