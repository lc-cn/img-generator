// 核心功能
export { 
  generateImage,
  generateImageFromInput,
  jsxToBuffer, 
  jsxStringToBuffer, 
  jsxObjectToBuffer,
  reactElementToBuffer,
  processElement
} from './core.js'

// 组件渲染
export { 
  expandComponents
} from './component-renderer.js'

// JSX 解析
export { parseJSX, objectToJSX } from './jsx-parser.js'

// React 元素处理
export { 
  createElement, 
  isValidElement, 
  isJSXObject, 
  jsxObjectToReactElement,
  reactElementToJSXObject,
  cloneElement
} from './react-element.js'

// 文件夹渲染
export { renderFolder } from './folder-renderer.js'

// 字体处理
export { 
  loadFont, 
  loadFontFromFile,
  detectFonts, 
  detectEmojis,
  getDefaultFonts
} from './fonts.js'

// 类型定义
export type { 
  ImageOptions, 
  ImageFormat,
  FontOptions, 
  JSXObject, 
  JSXChild,
  FolderRenderOptions,
  HTMLConvertOptions,
  ComponentRenderOptions,
  ResourceOptions
} from './types.js'

// 导出默认配置
export const DEFAULT_CONFIG = {
  width: 1200,
  height: 630,
  format: 'png' as const,
  quality: 90,
} as const

// 导出常量
export const SUPPORTED_FONTS = [
  'Inter',
  'Noto Sans SC',
  'Noto Sans JP', 
  'Noto Sans KR',
  'Noto Sans Arabic'
] as const 