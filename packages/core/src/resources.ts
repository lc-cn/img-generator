import { readFileSync, existsSync } from 'fs'
import { extname, join } from 'path'

// 支持图片格式
const SUPPORTED_IMG = ['.png', '.jpg', '.jpeg', '.gif', '.svg']

/**
 * 将资源文件转换为 base64 数据 URL
 */
export function loadResource(src: string, baseDir?: string): string {
  // 如果已经是 base64 或 http 链接，直接返回
  if (src.startsWith('data:') || src.startsWith('http')) {
    return src
  }
  
  let fullPath = src
  if (baseDir && !src.startsWith('/')) {
    fullPath = join(baseDir, src)
  }
  
  if (!existsSync(fullPath)) {
    console.warn(`[loadResource] 资源文件不存在: ${fullPath}`)
    return src
  }
  
  try {
    const ext = extname(fullPath).toLowerCase()
    if (!SUPPORTED_IMG.includes(ext)) {
      console.warn(`[loadResource] 不支持的图片格式: ${ext}`)
      return src
    }
    
    const buffer = readFileSync(fullPath)
    const base64 = buffer.toString('base64')
    const mimeType = getMimeType(ext)
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error(`[loadResource] 转换资源失败: ${fullPath}`, error)
    return src
  }
}

/**
 * 获取文件扩展名对应的 MIME 类型
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  }
  return mimeTypes[ext] || 'application/octet-stream'
} 