/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  prefix: 'tw-',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/vuetify/dist/vuetify.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
