import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ClientLayout from '../components/layout/ClientLayout';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://manapalm.com'),
  title: 'نخلستان معنا - جایی که معنا و تاثیر جاودانه می‌شود',
  description: 'پلتفرمی برای خلق میراث معنادار از طریق کاشت نخل، یادگیری و هم‌آفرینی',
  keywords: ['نخل', 'نخل معنا', 'معنا', 'میراث', 'گیمیفیکیشن', 'آکادمی', 'فقرزدایی', 'اشتغال‌زایی'],
  authors: [{ name: 'تیم نخلستان معنا' }],
  openGraph: {
    title: 'نخلستان معنا',
    description: 'جایی که معنا و تاثیر جاودانه می‌شود',
    url: 'https://manapalm.com',
    siteName: 'نخلستان معنا',
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نخلستان معنا',
    description: 'جایی که معنا و تاثیر جاودانه می‌شود',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-512x512.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.className}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Manapalm",
              "alternateName": "نخلستان معنا",
              "url": "https://manapalm.com",
              "logo": "https://manapalm.com/icon-512x512.png",
              "sameAs": [
                "https://instagram.com/manapalm",
                "https://linkedin.com/company/manapalm"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+98-21-00000000",
                "contactType": "customer service",
                "areaServed": "IR",
                "availableLanguage": "Persian"
              },
              "description": "پلتفرمی برای خلق میراث معنادار از طریق کاشت نخل، یادگیری و هم‌آفرینی."
            })
          }}
        />
        {/* Cloudinary Script for Upload Widget */}
        <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript" async></script>
      </head>
      <body className="bg-gray-900 min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
        {/* Atmospheric Background */}
        <div className="aurora-bg">
          <div className="aurora-blob blob-1"></div>
          <div className="aurora-blob blob-2"></div>
          <div className="aurora-blob blob-3"></div>
        </div>
        <div className="noise-overlay"></div>

        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
