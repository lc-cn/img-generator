import { JSXElement, Html2ImgError, StyleObject } from '../types';
import { resolveResourcePath, getImageDimensions } from '../utils/resource';
import { JSDOM } from 'jsdom';

/**
 * 将 HTML 转换为 JSX 元素
 */
export async function htmlToJsx(html: string, baseUrl?: string): Promise<JSXElement> {
  try {
    // 检查输入是否为空
    if (!html || html.trim() === '') {
      throw new Html2ImgError('Empty HTML input');
    }

    const dom = new JSDOM(html);
    const { document } = dom.window;
    const body = document.body;

    // 处理图片资源
    const images = body.getElementsByTagName('img');
    for (const img of images) {
      const src = img.getAttribute('src');
      if (src) {
        const resolvedPath = await resolveResourcePath(src, baseUrl);
        const dimensions = await getImageDimensions(resolvedPath);
        img.setAttribute('src', resolvedPath);
        if (dimensions) {
          img.setAttribute('width', dimensions.width.toString());
          img.setAttribute('height', dimensions.height.toString());
        }
      }
    }

    // 转换为 JSX
    const jsx = convertElement(body);
    
    // 获取第一个子元素的样式
    const firstChild = jsx.children?.[0];
    const rootStyle = (typeof firstChild === 'object' && firstChild.props.style) || {} as StyleObject;
    
    // 保留原始尺寸，只在没有设置时添加默认值
    const finalStyle: StyleObject = {
      ...rootStyle,
      display: (jsx.children && jsx.children.length > 1) ? 'flex' : (rootStyle.display || 'block'),
      flexDirection: rootStyle.flexDirection || 'column',
      position: rootStyle.position || 'relative',
      overflow: rootStyle.overflow || 'hidden'
    };

    // 只在没有任何尺寸设置时才设置默认值
    if (!rootStyle.width && !rootStyle.height) {
      finalStyle.width = '100%';
      finalStyle.height = '100%';
    }
    
    return {
      type: 'div',
      props: {
        style: finalStyle,
        children: jsx.children
      },
      children: jsx.children
    };
  } catch (error) {
    throw new Html2ImgError(
      `Failed to convert HTML to JSX: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

/**
 * 处理 JSX 资源
 */
export async function processJsxResources(element: JSXElement, baseUrl?: string): Promise<JSXElement> {
  try {
    const props = { ...element.props };
    const style = (props.style || {}) as StyleObject;

    // 处理资源路径
    if (baseUrl) {
      if (typeof props.src === 'string') {
        props.src = await resolveResourcePath(props.src, baseUrl);
      }
      if (typeof props.href === 'string') {
        props.href = await resolveResourcePath(props.href, baseUrl);
      }
      if (style.backgroundImage) {
        const urlMatch = style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) {
          const url = await resolveResourcePath(urlMatch[1], baseUrl);
          style.backgroundImage = `url('${url}')`;
        }
      }
    }

    // 确保 div 元素有正确的 display 属性
    if (element.type === 'div') {
      if (!style.display) {
        style.display = (element.children && element.children.length > 1) ? 'flex' : 'block';
      }
      if (style.display === 'flex' && !style.flexDirection) {
        style.flexDirection = 'column';
      }
      if (style.display === 'flex' && !style.alignItems) {
        style.alignItems = 'flex-start';
      }
    }

    // 处理特殊的 display 值
    if (style.display === 'list-item') {
      style.display = 'block';
    }

    // 处理样式值
    for (const key in style) {
      if (key === 'zIndex' || key === 'z-index') {
        const value = style[key];
        if (typeof value === 'string') {
          style[key] = parseInt(value) || 0;
        }
      }
    }

    props.style = style;

    // 处理子元素
    let children: (JSXElement | string)[] = [];
    if (props.children) {
      const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
      children = await Promise.all(
        childrenArray.map(child => 
          typeof child === 'string' ? child : processJsxResources(child as JSXElement, baseUrl)
        )
      );
    }

    return {
      ...element,
      props,
      children
    };
  } catch (error) {
    throw new Html2ImgError(
      `Failed to process JSX resources: ${error instanceof Error ? error.message : String(error)}`,
      error
    );
  }
}

/**
 * 转换元素为 JSX
 */
function convertElement(element: Element): JSXElement {
  const props: JSXElement['props'] = {};
  const children = Array.from(element.childNodes).map(child => {
    if (child.nodeType === 3) { // Text node
      return child.textContent || '';
    } else if (child.nodeType === 1) { // Element node
      return convertElement(child as Element);
    }
    return '';
  }).filter(Boolean);

  for (const attr of element.attributes) {
    if (attr.name === 'style') {
      continue; // 样式单独处理
    }
    props[attr.name] = attr.value;
  }

  // 处理内联样式
  const inlineStyle = element.getAttribute('style');
  if (inlineStyle) {
    const styles: StyleObject = {};
    const styleRules = inlineStyle.split(';').filter(Boolean);

    for (const rule of styleRules) {
      const [key, value] = rule.split(':').map(s => s.trim());
      if (key && value) {
        // 将连字符形式的属性名转换为驼峰命名
        const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        
        // 处理 zIndex
        if (camelKey === 'zIndex' || key === 'z-index') {
          styles[camelKey] = parseInt(value) || 0;
          continue;
        }
        
        styles[camelKey] = value;
      }
    }

    // 确保 div 元素有正确的 display 属性
    if (element.tagName.toLowerCase() === 'div') {
      if (!styles.display) {
        styles.display = children.length > 1 ? 'flex' : 'block';
      }
      if (styles.display === 'flex' && !styles.flexDirection) {
        styles.flexDirection = 'column';
      }
      if (styles.display === 'flex' && !styles.alignItems) {
        styles.alignItems = 'flex-start';
      }
    }

    // 处理特殊的 display 值
    if (styles.display === 'list-item') {
      styles.display = 'block';
    }

    if (Object.keys(styles).length > 0) {
      props.style = styles;
    }
  }

  // Set children
  props.children = children;

  return {
    type: element.tagName.toLowerCase(),
    props,
    children
  };
}