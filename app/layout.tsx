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
  title: {
    default: 'نخلستان معنا | تجربه‌ای متفاوت از کاشت نخل و خلق میراث',
    template: '%s | نخلستان معنا'
  },
  description: 'پلتفرم نخلستان معنا؛ پیشرو در اشتغال‌زایی روستایی، تولید محصولات ارگانیک و ایجاد پیوند میان انسان و طبیعت از طریق کاشت نخل‌های شناسنامه‌دار.',
  applicationName: 'Mana Palm',
  keywords: ['نخل', 'کاشت نخل', 'محصولات ارگانیک', 'اشتغال‌زایی', 'مسئولیت اجتماعی', 'سرمایه‌گذاری سبز', 'میراث جاودان', 'توسعه روستایی'],
  authors: [{ name: 'حسین حکیمیان', url: 'https://manapalm.com' }],
  creator: 'تیم فنی ماناپالم',
  publisher: 'نخلستان معنا',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: 'نخلستان معنا | پلتفرم جامع خلق میراث و تاثیر اجتماعی',
    description: 'با کاشت یک نخل، میراثی جاودان بسازید و در آبادانی مناطق محروم سهیم شوید.',
    url: 'https://manapalm.com',
    siteName: 'ManaPalm',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'نخلستان معنا - پلتفرم خلق میراث جاودان',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نخلستان معنا',
    description: 'جایی که معنا و تاثیر جاودانه می‌شود',
    images: ['/assets/og-image.jpg'],
    creator: '@manapalm',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-512x512.png' },
    ],
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
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
                "telephone": "+98-77-00000000",
                "contactType": "customer service",
                "areaServed": "IR",
                "availableLanguage": ["Persian", "English"]
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
