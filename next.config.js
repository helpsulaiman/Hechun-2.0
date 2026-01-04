/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {

    // You also need to specify the dimensions for the Image component
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hdbmcwmgolmxmtllaclx.supabase.co',
        pathname: '/storage/v1/object/public/images/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  }
};

module.exports = nextConfig;