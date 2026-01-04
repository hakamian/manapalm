import type { Metadata } from "next";
import "../../index.css";
import { AppProvider } from "../../AppContext";
import Script from "next/script";

export const metadata: Metadata = {
    title: "نخلستان معنا | پلتفرم جامع معنا و مسئولیت اجتماعی",
    description: "میراث خود را با کاشت یک نخل جاودانه کنید.",
};

import { HelmetProvider } from "react-helmet-async";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa" dir="rtl">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="beforeInteractive" />
                <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" strategy="lazyOnload" />
            </head>
            <body className="antialiased overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
                <HelmetProvider>
                    <AppProvider>
                        <div className="relative min-h-screen text-white">
                            <div className="aurora-bg">
                                <div className="aurora-blob blob-1"></div>
                                <div className="aurora-blob blob-2"></div>
                                <div className="aurora-blob blob-3"></div>
                            </div>
                            <div className="noise-overlay"></div>
                            {children}
                        </div>
                    </AppProvider>
                </HelmetProvider>
            </body>
        </html>
    );
}
