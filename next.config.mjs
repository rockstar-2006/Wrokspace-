/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['gsap'],
  images: {
    unoptimized: true,
  },
  experimental: {
    // Keep the Admin SDK (and its native gRPC deps) out of the server bundle
    serverComponentsExternalPackages: ['firebase-admin'],
  },
};

export default nextConfig;
