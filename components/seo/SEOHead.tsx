
import React from 'react';
// import { Helmet } from 'react-helmet-async'; // Removed: Use Next.js Metadata API instead

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
  // In Next.js, use Metadata API in app/layout.tsx instead of Helmet
  // This component is now a placeholder for backward compatibility
  return null;
};

export default SEOHead;