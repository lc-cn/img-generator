/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['img-generator'],
  },
  webpack: (config, { isServer }) => {
    // Monaco Editor 需要特殊处理
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig 