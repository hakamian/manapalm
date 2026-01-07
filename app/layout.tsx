import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  display: 'swap',
});

export const metadata: Metadata = {
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
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-512x512.png" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 min-h-screen text-white">

        <Providers>{children}</Providers>

      </body>
    </html>
  );
}