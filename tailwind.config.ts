import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'mana-primary': '#10b981',
                'mana-primary-dark': '#065f46',
                'mana-accent': '#fbbf24',
                'mana-bg': '#050505',
            },
        },
    },
    plugins: [],
};
export default config;
