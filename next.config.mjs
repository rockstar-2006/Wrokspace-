/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['gsap'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
