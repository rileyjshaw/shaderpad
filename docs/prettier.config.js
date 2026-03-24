/** @type {import('prettier').Options} */
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const parentConfig = JSON.parse(readFileSync(resolve(__dirname, '../.prettierrc'), 'utf8'));

module.exports = {
	...parentConfig,
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindStylesheet: './src/styles/tailwind.css',
};
