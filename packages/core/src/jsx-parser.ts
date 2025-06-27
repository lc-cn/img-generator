import { createElement, ReactElement } from "react"

export function parseJSX(jsxString: string): ReactElement {
  // 移除多余的空白和换行
  const cleanJsx = jsxString.trim()
  
  // 如果输入已经是对象格式，直接返回
  if (cleanJsx.startsWith('{')) {
    try {
      return JSON.parse(cleanJsx)
    } catch (e) {
      throw new Error('Invalid JSON format')
    }
  }
  
  // 简单的JSX解析逻辑
  return parseJSXElement(cleanJsx)
}

function parseJSXElement(jsx: string): ReactElement {
  jsx = jsx.trim()
  
  // 处理自闭合标签
  const selfClosingMatch = jsx.match(/^<(\w+)([^>]*)\s*\/>$/)
  if (selfClosingMatch) {
    const tagName = selfClosingMatch[1]
    const attributesString = selfClosingMatch[2].trim()
    const props = parseAttributes(attributesString)
    return createElement(tagName, props)
  }
  
  // 处理普通标签
  const openTagMatch = jsx.match(/^<(\w+)([^>]*)>/)
  if (!openTagMatch) {
    throw new Error('Invalid JSX: Missing opening tag')
  }
  
  const tagName = openTagMatch[1]
  const attributesString = openTagMatch[2].trim()
  const props = parseAttributes(attributesString)
  
  // 找到匹配的结束标签
  const openTagLength = openTagMatch[0].length
  const closeTag = `</${tagName}>`
  const closeTagIndex = jsx.lastIndexOf(closeTag)
  
  if (closeTagIndex === -1) {
    throw new Error(`Invalid JSX: Missing closing tag for ${tagName}`)
  }
  
  // 提取children内容
  const childrenContent = jsx.slice(openTagLength, closeTagIndex).trim()
  
  if (!childrenContent) {
    return createElement(tagName, props)
  }
  
  // 解析children
  const children = parseChildren(childrenContent)
  
  // 将children放入props中
  if (children.length === 1) {
    props.children = children[0]
  } else if (children.length > 1) {
    props.children = children
  }
  
  return createElement(tagName, props)
}

function parseAttributes(attributesString: string): Record<string, any> {
  const props: Record<string, any> = {}
  
  if (!attributesString) return props
  
  // 处理style属性 - 使用更简单的方法
  if (attributesString.includes('style=')) {
    const styleStart = attributesString.indexOf('style={{')
    if (styleStart !== -1) {
      // 找到匹配的结束括号
      let braceCount = 0
      let styleEnd = styleStart + 7 // 'style={{'的长度
      
      for (let i = styleEnd; i < attributesString.length; i++) {
        if (attributesString[i] === '{') braceCount++
        else if (attributesString[i] === '}') {
          braceCount--
          if (braceCount === -1) {
            styleEnd = i + 1
            break
          }
        }
      }
      
      const styleString = attributesString.slice(styleStart + 8, styleEnd - 2) // 移除 'style={{' 和 '}}'
      props.style = parseStyleString(styleString)
      
      // 移除已处理的style属性
      attributesString = attributesString.slice(0, styleStart) + attributesString.slice(styleEnd)
    }
  }
  
  // 处理其他简单属性
  const simpleAttrPattern = /(\w+)=["']([^"']*)["']/g
  let match
  while ((match = simpleAttrPattern.exec(attributesString)) !== null) {
    const [, name, value] = match
    props[name] = value
  }
  
  return props
}

function parseStyleString(styleString: string): Record<string, any> {
  const style: Record<string, any> = {}
  
  // 分割样式属性，处理嵌套的引号和逗号
  const properties: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''
  
  for (let i = 0; i < styleString.length; i++) {
    const char = styleString[i]
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true
      quoteChar = char
      current += char
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false
      current += char
    } else if (!inQuotes && char === ',') {
      if (current.trim()) {
        properties.push(current.trim())
        current = ''
      }
    } else {
      current += char
    }
  }
  
  if (current.trim()) {
    properties.push(current.trim())
  }
  
  // 解析每个样式属性
  for (const prop of properties) {
    const colonIndex = prop.indexOf(':')
    if (colonIndex === -1) continue
    
    const key = prop.slice(0, colonIndex).trim().replace(/['"]/g, '')
    let value: any = prop.slice(colonIndex + 1).trim().replace(/['"]/g, '')
    
    // 尝试转换数字
    if (/^\d+$/.test(value)) {
      value = parseInt(value)
    } else if (/^\d+\.\d+$/.test(value)) {
      value = parseFloat(value)
    }
    
    style[key] = value
  }
  
  return style
}

function parseChildren(content: string): any[] {
  const children: any[] = []
  
  // 更智能的children解析
  let i = 0
  let current = ''
  
  while (i < content.length) {
    const char = content[i]
    
    if (char === '<') {
      // 如果有累积的文本，先添加它
      if (current.trim()) {
        children.push(current.trim())
        current = ''
      }
      
      // 找到完整的JSX元素
      const element = extractJSXElement(content.slice(i))
      if (element) {
        try {
          children.push(parseJSXElement(element))
          i += element.length
        } catch (e) {
          // 如果解析失败，当作文本处理
          current += char
          i++
        }
      } else {
        current += char
        i++
      }
    } else {
      current += char
      i++
    }
  }
  
  // 添加剩余的文本
  if (current.trim()) {
    children.push(current.trim())
  }
  
  // 过滤空字符串，但保留所有有效的children
  return children.filter(child => {
    if (typeof child === 'string') {
      return child.trim() !== ''
    }
    return true // 保留所有非字符串的children（ReactElement等）
  })
}

function extractJSXElement(content: string): string | null {
  let depth = 0
  let i = 0
  let tagName = ''
  
  while (i < content.length) {
    const char = content[i]
    
    if (char === '<') {
      if (content[i + 1] === '/') {
        // 结束标签
        depth--
        if (depth === 0) {
          // 找到匹配的结束标签，提取完整元素
          const endTagMatch = content.slice(i).match(/^<\/(\w+)>/)
          if (endTagMatch && endTagMatch[1] === tagName) {
            return content.slice(0, i + endTagMatch[0].length)
          }
        }
      } else {
        // 开始标签
        depth++
        if (depth === 1) {
          // 提取标签名
          const tagMatch = content.slice(i).match(/^<(\w+)/)
          if (tagMatch) {
            tagName = tagMatch[1]
          }
        }
      }
    } else if (char === '>' && depth === 1) {
      // 检查是否是自闭合标签
      if (content[i - 1] === '/') {
        return content.slice(0, i + 1)
      }
    }
    
    i++
  }
  
  return null
}

// 将对象格式转换为JSX字符串
export function objectToJSX(obj: ReactElement, indent: number = 0): string {
  const spaces = '  '.repeat(indent)
  const { type, props: { children, ...props } } = obj
  
  let result = `${spaces}<${type}`
  
  // 添加属性
  for (const [key, value] of Object.entries(props)) {
    if (key === 'style' && typeof value === 'object') {
      const styleString = Object.entries(value as Record<string, any>)
        .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`)
        .join(', ')
      result += ` style={{${styleString}}}`
    } else if (typeof value === 'string') {
      result += ` ${key}="${value}"`
    } else {
      result += ` ${key}={${JSON.stringify(value)}}`
    }
  }
  
  if (!children) {
    result += ' />'
    return result
  }
  
  result += '>'
  
  if (typeof children === 'string' || typeof children === 'number') {
    result += children
  } else if (Array.isArray(children)) {
    result += '\n'
    for (const child of children) {
      if (typeof child === 'string' || typeof child === 'number') {
        result += `${spaces}  ${child}\n`
      } else {
        result += objectToJSX(child, indent + 1) + '\n'
      }
    }
    result += spaces
  } else {
    // children是JSXObject类型
    result += '\n' + objectToJSX(children, indent + 1) + '\n' + spaces
  }
  
  result += `</${type}>`
  
  return result
} 