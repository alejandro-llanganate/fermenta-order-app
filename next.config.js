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
  // Ensure CSS is properly processed in standalone mode
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Copy static assets to standalone output
  trailingSlash: false,
  // Remove GitHub Pages specific config for Railway deployment
  // basePath: process.env.NODE_ENV === 'production' ? '/fermenta-order-app' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/fermenta-order-app/' : '',
}

module.exports = nextConfig 