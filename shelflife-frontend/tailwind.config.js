/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        academic: {
          50: '#F0F6FC',
          100: '#E1EDF8',
          200: '#C8DEF2',
          300: '#9FC4E7',
          400: '#6FA4D9',
          500: '#3B82C4',
          600: '#1769AA', // Primary university library blue
          700: '#125488',
          800: '#10466F',
          900: '#113B5C',
        },
        brand: {
          50: '#EBF3FC',
          100: '#E1EDF8',
          500: '#1769AA',
          600: '#125488',
          700: '#0F446F',
        },
        library: {
          sidebar: '#F8FAFC', // Warm off-white / light slate sidebar
          bg: '#F7F9FB', // Calm neutral workspace background
          surface: '#FFFFFF',
          border: '#E3E8EE',
          text: '#172033',
          muted: '#64748B',
          success: '#16845B',
          warning: '#B7791F',
          danger: '#C53030',
        },
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'modal': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
}
