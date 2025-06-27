import emojiRegex from 'emoji-regex'

// 字体缓存
const fontCache = new Map<string, ArrayBuffer>()

/**
 * 自动加载 Google 字体
 */
export async function loadGoogleFont(font: string, text: string): Promise<ArrayBuffer> {
  const cacheKey = `${font}-${text}`
  
  // 检查缓存
  if (fontCache.has(cacheKey)) {
    return fontCache.get(cacheKey)!
  }

  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
    const css = await (await fetch(url)).text()
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)
    
    if (resource) {
      const response = await fetch(resource[1])
      if (response.status === 200) {
        const fontData = await response.arrayBuffer()
        fontCache.set(cacheKey, fontData)
        return fontData
      }
    }
    
    throw new Error('Failed to load font data')
  } catch (error) {
    console.warn(`Failed to load Google Font ${font}:`, error)
    throw error
  }
}

/**
 * 检测文本中使用的字体
 */
export function detectFonts(text: string): string[] {
  const fonts: string[] = []
  
  // 检测中文字符
  if (/[\u4e00-\u9fff]/.test(text)) {
    fonts.push('Noto Sans SC')
  }
  
  // 检测日文字符
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    fonts.push('Noto Sans JP')
  }
  
  // 检测韩文字符
  if (/[\uac00-\ud7af]/.test(text)) {
    fonts.push('Noto Sans KR')
  }
  
  // 检测阿拉伯字符
  if (/[\u0600-\u06ff]/.test(text)) {
    fonts.push('Noto Sans Arabic')
  }
  
  // 检测泰文字符
  if (/[\u0e00-\u0e7f]/.test(text)) {
    fonts.push('Noto Sans Thai')
  }
  
  // 如果没有检测到特殊字符，使用默认字体
  if (fonts.length === 0) {
    fonts.push('Inter')
  }
  
  return fonts
}

/**
 * 检测文本中的 emoji
 */
export function detectEmojis(text: string): string[] {
  const regex = emojiRegex()
  const matches = text.match(regex) || []
  return [...new Set(matches)]
}