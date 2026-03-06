/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 90],
  },
  // Configuración para archivos estáticos
  trailingSlash: false,
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

export default nextConfig
