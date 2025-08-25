/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Deshabilitar pre-renderizado estático para páginas que usan Supabase
  experimental: {
    // Esto evita que Next.js intente pre-renderizar páginas con variables de entorno
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig 