import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          page: '#090d12',
          card: '#111620',
          elevated: '#161c28',
          hover: '#1a2330',
        },
        border: {
          subtle: '#1e2733',
          accent: '#1a3a2a',
        },
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 70%)',
        'card-glow': 'radial-gradient(ellipse at top left, rgba(99,102,241,0.04) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
};
export default config;