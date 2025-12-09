
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  keywords = [], 
  image = 'https://picsum.photos/seed/nakhlestan-logo/1200/630', // Default social image
  url = 'https://manapalm.com',
  type = 'website'
}) => {
  const siteTitle = 'نخلستان معنا | Nakhlestan Ma\'na';
  const fullTitle = title === 'Home' ? siteTitle : `${title} | نخلستان معنا`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={['نخلستان معنا', 'کاشت نخل', 'مسئولیت اجتماعی', 'خیریه هوشمند', ...keywords].join(', ')} />

      {/* Open Graph / Facebook / Telegram */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="نخلستان معنا" />
      <meta property="og:locale" content="fa_IR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOHead;
