"use client";

import dynamic from 'next/dynamic';

// Dynamically import the main App component with SSR disabled
// to maintain current Vite-based logic while running inside Next.js
const App = dynamic(() => import('../App'), { ssr: false });

export default function Home() {
    return <App />;
}
