/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/fermenta-order-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/fermenta-order-app/' : '',
}

module.exports = nextConfig 