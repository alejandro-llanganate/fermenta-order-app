/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Remove GitHub Pages specific config for Railway deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/fermenta-order-app' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/fermenta-order-app/' : '',
}

module.exports = nextConfig 