/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Este catálogo se sirve también reenviado desde sophiaaurea.co/catalogo.
  // Sin prefijo, pediría su JS y CSS a /_next/ de ESE dominio, donde vive el
  // website de marca: daban 404 y la página se quedaba en "Cargando...".
  // Con el prefijo, los assets se piden siempre a su propio subdominio.
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.sharepoint.com',
      },
    ],
    imageSizes: [256, 384],
    deviceSizes: [384, 640],
  },
};

module.exports = nextConfig;
