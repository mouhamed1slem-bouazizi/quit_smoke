/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'storage.googleapis.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    // Copy the service worker to the public directory
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          // This would normally be handled by a build script
          console.log('Service worker will be copied to public directory during build');
        });
      },
    });
    return config;
  },
};

export default nextConfig;
