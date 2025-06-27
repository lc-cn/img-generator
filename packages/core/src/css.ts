import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * 加载 CSS 文件并解析为样式对象
 */
export function loadCSSFile(cssPath: string, baseDir?: string): Record<string, any> {
  let fullPath = cssPath
  if (baseDir && !cssPath.startsWith('/') && !cssPath.startsWith('http')) {
    fullPath = join(baseDir, cssPath)
  }
  
  if (!existsSync(fullPath)) {
    console.warn(`[loadCSSFile] CSS 文件不存在: ${fullPath}`)
    return {}
  }
  
  try {
    const cssContent = readFileSync(fullPath, 'utf-8')
    return parseCSS(cssContent)
  } catch (error) {
    console.error(`[loadCSSFile] 读取 CSS 文件失败: ${fullPath}`, error)
    return {}
  }
}

/**
 * 解析 CSS 内容为样式对象
 */
export function parseCSS(cssContent: string): Record<string, any> {
  const styles: Record<string, any> = {}
  const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g
  let match
  
  while ((match = classRegex.exec(cssContent)) !== null) {
    const className = match[1]
    const cssRules = match[2].trim()
    
    const styleObj: any = {}
    const ruleRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g
    let ruleMatch
    
    while ((ruleMatch = ruleRegex.exec(cssRules)) !== null) {
      const property = ruleMatch[1].trim()
      const value = ruleMatch[2].trim()
      
      // 转换 CSS 属性名为 camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      
      styleObj[camelProperty] = value
    }
    
    styles[className] = styleObj
  }
  
  return styles
}

/**
 * 合并 class 和 style 属性为最终 style，遵循优先级：class 顺序 < style 属性
 */
export function mergeClassAndStyle(attributesStr: string, cssStyles: Record<string, any>): { className?: string, style?: any } {
  const result: { className?: string, style?: any } = {}
  let mergedStyle = {}
  
  // 合并 class 样式
  const classMatch = attributesStr.match(/class\s*=\s*["']([^"']*)["']/)
  if (classMatch) {
    const classNames = classMatch[1].split(/\s+/)
    result.className = classMatch[1]
    
    // 按顺序应用多个类的样式
    for (const cls of classNames) {
      if (cssStyles[cls]) {
        Object.assign(mergedStyle, cssStyles[cls])
      }
    }
  }
  
  // 合并 style 属性（优先级最高）
  const styleMatch = attributesStr.match(/style\s*=\s*["']([^"']*)["']/)
  if (styleMatch) {
    const styleStr = styleMatch[1]
    const styleObj: any = {}
    styleStr.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim())
      if (property && value) {
        // 转换 CSS 属性名为 camelCase
        const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        styleObj[camelProperty] = value
      }
    })
    Object.assign(mergedStyle, styleObj)
  }
  
  if (Object.keys(mergedStyle).length > 0) {
    result.style = mergedStyle
  }
  
  return result
} 