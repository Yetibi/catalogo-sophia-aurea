/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
