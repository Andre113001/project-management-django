/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xl': '1440px',
        'tablet': '690px',
        'phone': '250px',      // Custom screen size for phones
        'desktop': '1024px',   // Custom screen size for desktops
        'widescreen': '1440px', // Custom screen size for widescreens
      },
      fontSize: {
        sm: '16px',
        md: '20px',
        'md-lg': '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '96px',
        'heading-1': '64px'
      },
      colors: {
        'primary': "blue",
        'secondary': "#F3F3F3",
        'white': "white"
      },
    },
  },
  plugins: [],
}