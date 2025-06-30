/** @type {import('next').NextConfig} */
const nextConfig = {
  // 转译我们的 core 包
  transpilePackages: ['img-generator'],
  
  // 优化图片处理
  images: {
    unoptimized: true,
  },
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@resvg/resvg-js': 'commonjs @resvg/resvg-js'
      });
    }
    // 客户端配置
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
}

module.exports = nextConfig 