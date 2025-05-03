/**
 * 模块入口文件
 * @module html2img
 */

import { JSDOM } from 'jsdom';
import {
  JSXElement,
  Html2ImgError,
  Html2ImgOptions,
  Html2ImgInput,
} from './types';
import { htmlToJsx } from './core/converter';
import { renderSvg } from './core/renderer';
import { resolveResourcePath, getImageDimensions } from './utils/resource';
import { loadDefaultChineseFont } from './utils/font';

export { Html2ImgError };
export type { Html2ImgOptions, JSXElement };

/**
 * Convert HTML or JSXElement to PNG image
 */
export async function html2img(
  input: Html2ImgInput,
  options: Html2ImgOptions = {}
): Promise<Buffer> {
  try {
    let jsx: JSXElement;
    
    if (typeof input === 'string') {
      // Process image resources in HTML
      const dom = new JSDOM(input);
      const { document } = dom.window;
      const images = document.getElementsByTagName('img');
      
      for (const img of images) {
        const src = img.getAttribute('src');
        if (src) {
          const resolvedPath = await resolveResourcePath(src, options.baseUrl);
          const dimensions = getImageDimensions(resolvedPath);
          img.setAttribute('src', resolvedPath);
          if (dimensions) {
            img.setAttribute('width', dimensions.width.toString());
            img.setAttribute('height', dimensions.height.toString());
          }
        }
      }

      // Convert HTML to JSX
      jsx = await htmlToJsx(dom.serialize(), options.baseUrl);
    } else {
      // Use JSXElement directly
      jsx = input;
    }

    // Load default Chinese font
    const font = loadDefaultChineseFont();

    // 从 JSX 元素中获取尺寸
    const rootStyle = jsx.props?.style || {};
    const width = rootStyle.width
      ? parseInt(rootStyle.width.toString())
      : options.width;
    const height = rootStyle.height
      ? parseInt(rootStyle.height.toString())
      : options.height;
    console.log({width,height});
    // Render to SVG
    const svg = await renderSvg(jsx, {
      width,
      height,
      fonts: [font],
    });

    // Convert SVG to PNG
    const resvg = new (await import('@resvg/resvg-js')).Resvg(svg);
    return resvg.render().asPng();
  } catch (error) {
    throw new Html2ImgError('Failed to convert HTML to image', error);
  }
}
