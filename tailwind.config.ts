import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				50: '#f3f4f6',
  				100: '#e3e8ef',
  				200: '#a3acf2',
  				300: '#3b82f6',
  				400: '#2563eb',
  				500: '#1f3a8a',
  				600: '#1e3a8a',
  				700: '#1a3d7c',
  				800: '#1a3d7c',
  				900: '#1a3d7c',
  				default: '#2563eb',
  			},
  			background: 'var(--background)',
  			foreground: 'var(--foreground)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
