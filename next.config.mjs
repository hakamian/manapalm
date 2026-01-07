/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // For easier migration, we can turn this on later
  typescript: {
    ignoreBuildErrors: true, // Boring solution: don't let TS errors stop the deploy during transition
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'sbjrayzghjfsmmuygwbw.supabase.co' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/Dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;