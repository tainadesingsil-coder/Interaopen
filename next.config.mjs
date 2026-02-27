/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ANTHROPIC_KEY:
      process.env.NEXT_PUBLIC_ANTHROPIC_KEY ?? process.env.VITE_ANTHROPIC_KEY ?? '',
    VITE_ANTHROPIC_KEY: process.env.VITE_ANTHROPIC_KEY ?? '',
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
