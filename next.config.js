/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Este catálogo se sirve también reenviado desde sophiaaurea.co/catalogo.
  // Sin prefijo pediría su JS y CSS a /_next/ de ESE dominio, donde vive el
  // website de marca: daban 404 y la página se quedaba en "Cargando...".
  //
  // Va fijo en el código y no como variable de entorno a propósito: es una
  // URL pública y así no depende de configurar nada en Vercel. En desarrollo
  // queda sin prefijo para que localhost siga sirviendo sus propios assets.
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://catalogo.sophiaaurea.co"
      : undefined,
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
