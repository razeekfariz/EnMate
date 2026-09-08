/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-primary)', 'Neulis', 'sans-serif'],
        primary: ['var(--font-primary)', 'Neulis', 'sans-serif'],
        neulis: ['var(--font-primary)', 'Neulis', 'sans-serif'],
        brand: ['var(--font-brand)', 'Anokha', 'sans-serif'],
        anokha: ['var(--font-brand)', 'Anokha', 'sans-serif'],
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: {
          DEFAULT: 'var(--accent)',
          soft: 'var(--accent-soft)',
          dark: 'var(--accent-dark)',
        },
      },
    },
  },
  plugins: [],
}
