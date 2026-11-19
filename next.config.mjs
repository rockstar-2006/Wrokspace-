/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['gsap'],
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('firebase-admin');
    }
    return config;
  },
};

export default nextConfig;
