// 客户端专用模块 - 不包含Node.js依赖
// 只导出可以在浏览器中运行的功能

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

// 导出常量
export const DEFAULT_CONFIG = {
  width: 1200,
  height: 630,
  format: 'png' as const,
  quality: 90,
} as const

export const SUPPORTED_FONTS = [
  'Inter',
  'Noto Sans SC',
  'Noto Sans JP', 
  'Noto Sans KR',
  'Noto Sans Arabic'
] as const 