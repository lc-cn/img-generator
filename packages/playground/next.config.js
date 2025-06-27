/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 使用 serverExternalPackages 替代 serverComponentsExternalPackages
  serverExternalPackages: ['img-generator'],
  
  // Next.js 15 默认启用 App Router，不需要显式配置
  
  // 优化图片处理
  images: {
    unoptimized: true,
  },
  
  // Webpack 配置
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
    
    // 忽略 folder-renderer 的动态导入警告
    config.ignoreWarnings = [
      {
        module: /folder-renderer/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ]
    
    return config
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: 'img-generator-playground',
  },
  
  // Next.js 15 实验性功能
  experimental: {
    // 启用 Turbopack (可选，用于开发)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = nextConfig 