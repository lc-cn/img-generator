// 重新导出类型以避免循环依赖
import type { ImageOptions } from "./core"
import { jsxToBuffer } from './core'

// 导出核心功能
export { jsxToBuffer, jsxStringToBuffer, htmlToBuffer, processElement } from './core'

// 导出类型定义
export * from './types'

// JSX 解析功能
export { parseJSX, objectToJSX } from './jsx-parser'

// 字体相关功能
export { loadGoogleFont, detectFonts, detectEmojis } from './fonts'

// CSS 处理功能
export { loadCSSFile, parseCSS, mergeClassAndStyle } from './css'

// HTML 转换功能
export { htmlToJSX } from './html'

// 资源加载功能
export { loadResource } from './resources'

// 组件渲染功能
export {
  ComponentRenderer,
  createComponentRenderer,
  globalRenderer,
  renderComponent,
  renderElement,
  renderFunction,
  registerComponent,
  registerComponents,
  type ComponentRenderOptions
} from './component-renderer'

// 导出文件夹渲染功能
export {
  renderFolder,
  renderFolderBatch,
  createFolderRenderer,
  type FolderRenderOptions
} from './folder-renderer'

// 导入示例组件
import { Card, BlogPost, ProductCard, SocialCard } from './components'

// 导入注册函数
import { registerComponents } from './component-renderer'

// 注册示例组件
registerComponents({
  Card,
  BlogPost,
  ProductCard,
  SocialCard
})

// 导出默认配置
export const DEFAULT_CONFIG = {
  width: 1200,
  height: 630,
  debug: false,
} as const

// 导出工具函数
export function createOGImage(
  element: React.ReactElement,
  options: ImageOptions = {}
): Promise<Buffer> {
  return jsxToBuffer(element, options)
}

// 导出类型
export interface OGImageOptions extends ImageOptions {
  // 扩展的选项类型
}

// 导出常量
export const SUPPORTED_FONTS = [
  'Inter',
  'Noto Sans SC',
  'Noto Sans JP', 
  'Noto Sans KR',
  'Noto Sans Arabic',
  'Noto Sans Thai'
] as const

export const SUPPORTED_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const 