import { ReactElement, createElement } from 'react'
import { loadCSSFile, mergeClassAndStyle } from './css'
import { loadResource } from './resources'

/**
 * 轻量级 HTML 到 JSX 转换器（递归为所有 div 多子节点自动加 display: flex）
 * 支持 <img src="xxx"> 自动转 base64
 */
export function htmlToJSX(html: string, baseDir?: string, cssStyles?: Record<string, any>): ReactElement {
  const cleanHtml = html.trim()
  
  // 如果没有传入 cssStyles，则加载所有 CSS 文件并解析样式
  if (!cssStyles) {
    cssStyles = {}
    
    // 提取所有 link 标签中的 CSS 文件
    const linkRegex = /<link[^>]*href\s*=\s*["']([^"']*\.css)["'][^>]*>/gi
    let linkMatch
    while ((linkMatch = linkRegex.exec(cleanHtml)) !== null) {
      const cssPath = linkMatch[1]
      const styles = loadCSSFile(cssPath, baseDir)
      // 合并所有 CSS 文件的样式
      Object.assign(cssStyles, styles)
    }
  }

  // 优先提取 <body> 内容
  const bodyMatch = cleanHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    return htmlToJSX(bodyMatch[1], baseDir, cssStyles)
  }
  // 如果没有 <body>，尝试提取 <html> 内容
  const htmlMatch = cleanHtml.match(/<html[^>]*>([\s\S]*?)<\/html>/i)
  if (htmlMatch) {
    return htmlToJSX(htmlMatch[1], baseDir, cssStyles)
  }

  if (!cleanHtml.startsWith('<')) {
    return createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        color: 'black',
        background: 'white',
      },
      children: cleanHtml,
    })
  }

  // 递归解析 HTML 字符串为 ReactElement
  function parseHTML(htmlStr: string, parentDir?: string): ReactElement | string | null {
    const trimmed = htmlStr.trim()
    if (!trimmed.startsWith('<')) return trimmed

    // 匹配开始标签
    const tagMatch = trimmed.match(/^<([a-zA-Z0-9]+)([^>]*)>/)
    if (!tagMatch) return trimmed
    const tagName = tagMatch[1].toLowerCase()
    const attributesStr = tagMatch[2]
    const startTagLength = tagMatch[0].length

    // 跳过 head、meta、link、style、title、script 等标签
    const skipTags = ['head', 'meta', 'link', 'style', 'title', 'script']
    if (skipTags.includes(tagName)) {
      return null
    }

    // 解析属性
    const props: any = {}
    if (attributesStr) {
      // 合并 class/style
      const merged = mergeClassAndStyle(attributesStr, cssStyles!)
      if (merged.className) props.className = merged.className
      if (merged.style) props.style = merged.style
      // src (for img)
      if (tagName === 'img') {
        const srcMatch = attributesStr.match(/src\s*=\s*["']([^"']*)["']/)
        if (srcMatch) {
          const src = srcMatch[1]
          props.src = loadResource(src, parentDir || baseDir)
        }
      }
    }

    // 查找结束标签
    const endTag = `</${tagName}>`
    const endIndex = trimmed.lastIndexOf(endTag)
    if (endIndex === -1) return createElement(tagName, props)

    // 提取内容
    const content = trimmed.substring(startTagLength, endIndex).trim()
    if (!content) return createElement(tagName, props)

    // 递归解析内容，支持多个子节点
    const children = parseChildren(content, parentDir)

    // 递归修正：如果是 div 且有多个子节点，自动加 display: flex
    if (tagName === 'div' && Array.isArray(children) && children.length > 1) {
      if (!props.style) props.style = {}
      if (!props.style.display) {
        props.style.display = 'flex'
        props.style.flexDirection = 'column'
      }
    }
    if (Array.isArray(children)) {
      return createElement(tagName, props, ...children)
    } else {
      return createElement(tagName, props, children)
    }
  }

  // 解析内容为多个子节点
  function parseChildren(content: string, parentDir?: string): (ReactElement | string)[] | ReactElement | string {
    const result: (ReactElement | string)[] = []
    let i = 0
    while (i < content.length) {
      if (content[i] === '<') {
        // 找到下一个标签
        const tagMatch = content.substring(i).match(/^<([a-zA-Z0-9]+)([^>]*?)(\/?)>/)
        if (tagMatch) {
          const tagName = tagMatch[1]
          const isSelfClosing = tagMatch[3] === '/'
          const startTag = tagMatch[0]
          const start = i
          
          if (isSelfClosing) {
            // 自闭合标签，直接解析
            const htmlFragment = content.substring(start, start + startTag.length)
            const child = parseHTML(htmlFragment, parentDir)
            if (child !== null) result.push(child)
            i = start + startTag.length
            continue
          }
          
          // 查找结束标签
          const endTag = `</${tagName}>`
          let depth = 1
          let j = i + startTag.length
          while (j < content.length) {
            if (content.substring(j).startsWith(`<${tagName}`)) depth++
            if (content.substring(j).startsWith(endTag)) depth--
            if (depth === 0) break
            j++
          }
          if (depth === 0) {
            const end = content.indexOf(endTag, j) + endTag.length
            const htmlFragment = content.substring(start, end)
            const child = parseHTML(htmlFragment, parentDir)
            if (child !== null) result.push(child)
            i = end
            continue
          } else {
            // 没有找到结束标签，当作自闭合标签处理
            console.warn(`[htmlToJSX] 未找到结束标签 ${endTag}，当作自闭合标签处理`)
            const htmlFragment = content.substring(start, start + startTag.length)
            const child = parseHTML(htmlFragment, parentDir)
            if (child !== null) result.push(child)
            i = start + startTag.length
            continue
          }
        } else {
          // 不是有效的标签，跳过这个字符
          i++
          continue
        }
      }
      // 处理文本节点
      let nextTag = content.indexOf('<', i)
      if (nextTag === -1) nextTag = content.length
      const text = content.substring(i, nextTag).trim()
      if (text) result.push(text)
      i = nextTag
    }
    // 过滤掉 null
    const filtered = result.filter(x => x !== null)
    if (filtered.length === 1) return filtered[0]
    return filtered
  }

  try {
    const jsxElement = parseHTML(cleanHtml, baseDir)
    if (typeof jsxElement === 'string') {
      return createElement('div', {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: 'black',
          background: 'white',
        },
        children: jsxElement,
      })
    }
    return jsxElement as ReactElement
  } catch (error) {
    console.error('[htmlToJSX] 解析失败:', error)
    return createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        color: 'red',
        background: 'white',
      },
      children: `解析失败: ${error}`,
    })
  }
} 