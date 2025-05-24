/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Disable linting only during build, not in development
  },
};

export default nextConfig;
