import { ImageResponse } from '@vercel/og'
import { FontOptions, ImageOptions, DEFAULT_OPTIONS } from './types'
import { loadGoogleFont, detectFonts, detectEmojis } from './fonts'
import { loadResource } from './resources'
import { htmlToJSX } from './html'
import { mergeClassAndStyle } from './css'
import { 
  ReactElement,
  createElement,
  isValidElement, 
  isJSXObject, 
  jsxObjectToReactElement 
} from './react-element'

/**
 * 自动修复：确保所有元素都有显式的display属性
 * - 多子元素：display: flex + flexDirection: column
 * - 单子元素或无子元素：display: flex
 * 这是@vercel/og的要求，所有元素都必须显式设置display属性
 */
function autoFlex(element: ReactElement): ReactElement {
  if (!isValidElement(element)) return element
  const { type, props } = element
  const safeProps = (typeof props === 'object' && props !== null) ? (props as Record<string, any>) : {}
  let children = safeProps.children

  // 递归处理所有子节点（包括字符串、数组、ReactElement）
  if (Array.isArray(children)) {
    children = children.map(child => {
      if (isValidElement(child)) {
        return autoFlex(child)
      }
      return child
    })
  } else if (children !== undefined && children !== null && isValidElement(children)) {
    children = autoFlex(children)
  }

  // 只处理字符串类型的标签（如 div、section、main 等）
  if (typeof type === 'string') {
    // 统计有效子节点数量
    let count = 0
    if (Array.isArray(children)) {
      count = children.length
    } else if (children !== undefined && children !== null) {
      count = 1
    }
    // 确保所有元素都有显式的display属性（@vercel/og要求）
    const style = { ...(safeProps.style || {}) }
    if (count > 1 && !style.display) {
      style.display = 'flex'
      style.flexDirection = 'column'
    } else if (count <= 1 && !style.display) {
      // 为单子元素或无子元素的元素设置display: flex
      style.display = 'flex'
    }
    
    // 正确处理children的传递
    if (Array.isArray(children)) {
      return createElement(type, { ...safeProps, style }, ...children)
    } else if (children !== undefined && children !== null) {
      return createElement(type, { ...safeProps, style }, children)
    } else {
      return createElement(type, { ...safeProps, style })
    }
  }
  
  // 对于非字符串类型的组件，也要正确处理children
  if (Array.isArray(children)) {
    return createElement(type, { ...safeProps, children })
  } else {
    return createElement(type, { ...safeProps, children })
  }
}

/**
 * 递归处理 JSX 元素，提取文本和检测字体，并转换图片为 base64，处理 CSS 内联
 */
export function processElement(
  element: any, // 允许对象、字符串、数字
  baseDir?: string,
  cssStyles?: Record<string, any>
): {
  fonts: string[]
  emojis: string[]
  text: string
  processedElement: ReactElement
} {
  const fonts = new Set<string>()
  const emojis = new Set<string>()
  let text = ''

  function traverse(el: any): any {
    if (typeof el === 'string') {
      text += el
      const detectedFonts = detectFonts(el)
      detectedFonts.forEach(font => fonts.add(font))
      const detectedEmojis = detectEmojis(el)
      detectedEmojis.forEach(emoji => emojis.add(emoji))
      return el
    } else if (typeof el === 'number') {
      text += el.toString()
      return el
    } else if (el && typeof el === 'object') {
      // 处理JSX对象格式或ReactElement
      if (isJSXObject(el)) {
        // 直接处理JSX对象，避免双重递归
        const { type, props } = el
        const { children, ...otherProps } = props
        
        let processedChildren = children
        if (children !== undefined && children !== null) {
          if (Array.isArray(children)) {
            processedChildren = children.map(traverse)
          } else {
            processedChildren = traverse(children)
          }
        }
        
        // 创建ReactElement
        let processedElement
        if (Array.isArray(processedChildren)) {
          processedElement = createElement(type, otherProps, ...processedChildren)
        } else if (processedChildren !== undefined && processedChildren !== null) {
          processedElement = createElement(type, otherProps, processedChildren)
        } else {
          processedElement = createElement(type, otherProps)
        }
        
        return processedElement
      } else if (isValidElement(el)) {
        // 处理ReactElement
        const { type, props } = el
        
        // 处理函数组件
        if (typeof type === 'function') {
          try {
            // 检查是否是类组件（有prototype.render方法）
            if (type.prototype && type.prototype.render) {
              // 类组件需要用new实例化
              const instance = new (type as any)(props)
              const functionResult = instance.render()
              return traverse(functionResult)
            } else {
              // 函数组件直接调用
              const functionResult = (type as any)(props)
              return traverse(functionResult)
            }
          } catch (error) {
            // 如果函数组件调用失败，跳过处理
            console.warn('Function component failed:', error)
          }
        }
        
        // 处理 img 标签
        if (type === 'img' && props.src) {
          const src = props.src
          const processedSrc = loadResource(src, baseDir)
          return createElement('img', { ...props, src: processedSrc })
        }
        
        // 先处理 CSS 内联转换
        let processedProps = { ...props }
        if (cssStyles && processedProps.className) {
          const className = processedProps.className
          const merged = mergeClassAndStyle(`class="${className}"`, cssStyles)
          if (merged.style) {
            processedProps.style = { ...processedProps.style, ...merged.style }
          }
          delete processedProps.className
        }
        
        // 提取children（从props.children获取）
        const { children, ...otherProps } = processedProps
        
        let processedChildren = children
        if (children !== undefined && children !== null) {
          if (Array.isArray(children)) {
            processedChildren = children.map(traverse)
          } else {
            processedChildren = traverse(children)
          }
        }
        
        // 创建处理后的元素
        let processedElement
        if (Array.isArray(processedChildren)) {
          processedElement = createElement(type, otherProps, ...processedChildren)
        } else if (processedChildren !== undefined && processedChildren !== null) {
          processedElement = createElement(type, otherProps, processedChildren)
        } else {
          processedElement = createElement(type, otherProps)
        }
        
        // 返回处理后的元素，不在这里调用autoFlex
        return processedElement
      } else {
        // 处理普通对象（可能是旧格式的JSX对象）
        // 尝试当作JSX对象处理
        if (el.type && typeof el.type === 'string') {
          const jsxObject = {
            type: el.type,
            props: {
              ...el.props,
              ...(el.children !== undefined ? { children: el.children } : {})
            }
          }
          const reactElement = jsxObjectToReactElement(jsxObject)
          return traverse(reactElement)
        }
      }
    }
    return el
  }

  // 转换为@vercel/og兼容的ReactElement
  const processedElement = traverse(element) as any // 使用any避免类型冲突
  
  // 最后统一应用autoFlex修复，确保每个元素都有正确的display属性
  const finalElement = autoFlex(processedElement)
  
  return {
    fonts: Array.from(fonts),
    emojis: Array.from(emojis),
    text,
    processedElement: finalElement
  }
}

/**
 * 将 JSX 元素或 JSX 字符串转换为图片 Buffer
 */
export async function jsxToBuffer(
  element: any, // 支持各种JSX格式和字符串
  options: ImageOptions = {},
  baseDir?: string,
  cssStyles?: Record<string, any>
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // 如果输入是字符串，尝试解析为JSX
  let processedInput = element
  if (typeof element === 'string') {
    const { parseJSX } = await import('./jsx-parser')
    try {
      processedInput = parseJSX(element)
    } catch (error) {
      throw new Error(`Failed to parse JSX string: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // 处理元素，提取字体和 emoji 信息，并转换图片
  const { fonts: detectedFonts, text, processedElement } = processElement(processedInput, baseDir, cssStyles)
  // 加载检测到的字体
  const fontPromises = detectedFonts.map(async (fontName): Promise<FontOptions | null> => {
    try {
      const fontData = await loadGoogleFont(fontName, text)
      return {
        name: fontName,
        data: fontData,
        weight: 400,
        style: 'normal',
      }
    } catch (error) {
      console.warn(`Failed to load font ${fontName}:`, error)
      return null
    }
  })
  // 等待所有字体加载完成
  const loadedFonts = await Promise.all(fontPromises)
  const validFonts = loadedFonts.filter(font => font !== null) as FontOptions[]
  // 合并用户提供的字体
  let allFonts = [...validFonts, ...(opts.fonts || [])]
  // 如果没有字体，提供默认字体
  if (allFonts.length === 0) {
    try {
      const defaultFontData = await loadGoogleFont('Inter', 'Default Font')
      allFonts = [{
        name: 'Inter',
        data: defaultFontData,
        weight: 400,
        style: 'normal',
      }]
    } catch (error) {
      console.warn('Failed to load default font, using system fonts')
      allFonts = [{
        name: 'Arial',
        data: new ArrayBuffer(0),
        weight: 400,
        style: 'normal',
      }]
    }
  }
  // 创建 ImageResponse
  const response = new ImageResponse(processedElement, {
    width: opts.width,
    height: opts.height,
    fonts: allFonts,
  })
  // 转换为 Buffer
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * 将 JSX 字符串转换为图片 Buffer (便利函数)
 */
export async function jsxStringToBuffer(
  jsxString: string,
  options: ImageOptions = {},
  baseDir?: string
): Promise<Buffer> {
  return jsxToBuffer(jsxString, options, baseDir)
}

/**
 * 将 HTML 字符串转换为图片 Buffer
 */
export async function htmlToBuffer(
  html: string,
  options: ImageOptions = {},
  baseDir?: string
): Promise<Buffer> {
  // 如果没有提供 baseDir，默认使用当前工作目录
  if (!baseDir) {
    baseDir = process.cwd()
  }
  
  // 提取 CSS 样式
  const cssStyles: Record<string, any> = {}
  
  // 提取 <link> 标签中的 CSS 文件
  const linkMatches = html.match(/<link[^>]*href\s*=\s*["']([^"']*\.css[^"']*)["'][^>]*>/gi)
  if (linkMatches) {
    for (const linkMatch of linkMatches) {
      const hrefMatch = linkMatch.match(/href\s*=\s*["']([^"']*)["']/)
      if (hrefMatch) {
        const cssPath = hrefMatch[1]
        try {
          const { loadCSSFile } = await import('./css')
          const styles = loadCSSFile(cssPath, baseDir)
          // 合并所有 CSS 文件的样式
          Object.assign(cssStyles, styles)
        } catch (error) {
          console.warn(`Failed to load CSS file ${cssPath}:`, error)
        }
      }
    }
  }
  
  // 将 HTML 转换为 JSX（不处理 CSS，因为我们在 jsxToBuffer 中处理）
  const jsxElement = htmlToJSX(html, baseDir, {})
  
  // 转换为图片 Buffer，传递 CSS 样式
  return jsxToBuffer(jsxElement, options, baseDir, cssStyles)
}

// 重新导出类型和工具函数
export * from './types'
export * from './fonts'
export * from './css'
export * from './html'
export * from './resources' 