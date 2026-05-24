/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        'primary-foreground': '#FFFFFF',
        background: '#F6FBF3',
        foreground: '#2D3A2D',
        card: '#FFFFFF',
        'card-foreground': '#2D3A2D',
        muted: '#6B766B',
        'muted-foreground': '#6B766B',
        border: '#DDE8D8'
      }
    }
  },
  plugins: []
}