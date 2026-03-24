/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#00D4A1', dark: '#00B589' },
        dark: { DEFAULT: '#0A0B0D', 100: '#111318', 200: '#1A1D23', 300: '#242830', 400: '#2E3340' }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
}
