/** @type {import('prettier').Options} */
const parentConfig = require('../.prettierrc')

module.exports = {
  ...parentConfig,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/tailwind.css',
}
