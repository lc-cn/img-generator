import satori, { type Font, type SatoriOptions } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { JSXElement, FontConfig } from '../types';
import { FontWeight, FontStyle } from '../utils/font';

/**
 * 渲染配置接口
 */
interface RenderConfig {
  width?: number;
  height?: number;
  fonts: FontConfig[];
}

/**
 * 递归处理样式
 */
function processStyles(element: JSXElement): JSXElement {
  if (!element.props?.style) {
    return element;
  }

  const style = element.props.style;
  const processedStyle: Record<string, string | number> = {};

  // 处理样式值
  for (const [key, value] of Object.entries(style)) {
    if (typeof value === 'number' && key === 'zIndex') {
      processedStyle[key] = value;
    } else if (typeof value === 'string') {
      processedStyle[key] = value;
    }
  }

  return {
    ...element,
    props: {
      ...element.props,
      style: processedStyle,
    },
  };
}

/**
 * 渲染 JSX 元素为 SVG
 */
export async function renderSvg(
  element: JSXElement,
  config: RenderConfig
): Promise<string> {
  try {
    const processedElement = processStyles(element);
    const options = {
      width: config.width,
      height: config.height,
      fonts: config.fonts.map((font): Font => ({
        name: font.name,
        data: font.data.buffer,
        weight: font.weight as FontWeight,
        style: font.style as FontStyle,
      })),
    };

    return await satori(processedElement, options as SatoriOptions);
  } catch (error) {
    throw new Error(`Failed to render SVG: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 将 SVG 转换为 PNG
 */
export function svgToPng(svg: string, width?: number, height?: number): Buffer {
  try {
    const resvg = new Resvg(svg, {
      fitTo: width
        ? {
            mode: 'width',
            value: width,
          }
        : height
          ? {
              mode: 'height',
              value: height,
            }
          : undefined,
    });

    const pngData = resvg.render();
    return pngData.asPng();
  } catch (error) {
    throw new Error(`Failed to convert SVG to PNG: ${error instanceof Error ? error.message : String(error)}`);
  }
}
