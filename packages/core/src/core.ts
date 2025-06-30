import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { ReactElement } from 'react';
import { processElement } from './component-renderer.js';
import {  loadDynamicAsset, FontLoadOptions, getDefaultFonts } from './fonts.js';
import { isJSXObject, jsxObjectToReactElement } from './react-element.js';
import type { JSXObject, ImageOptions, ImageFormat } from './types.js';

export interface GenerateOptions extends ImageOptions {
  debug?: boolean;
  fonts?: FontLoadOptions[];
  graphemeImages?: Record<string, string>;
  loadAdditionalAsset?: (code: string, segment: string) => Promise<string | ArrayBuffer>;
  background?: string;
  emoji?: string;
  fitTo?: {
    mode: 'width' | 'height' | 'zoom' | 'original';
    value?: number;
  };
}

/**
 * 生成图片的核心函数
 */
export async function generateImage(
  element: ReactElement | JSXObject,
  options: GenerateOptions = {}
): Promise<Buffer> {
  const { width = 1200, height = 630, format = 'png', quality = 90 } = options;

  // 处理 JSX 对象转换为 React 元素
  let processedElement: ReactElement;
  if (isJSXObject(element)) {
    processedElement = jsxObjectToReactElement(element);
  } else {
    processedElement = element as ReactElement;
  }

  // 处理元素（应用 autoFlex 等）
  const finalElement = processElement(processedElement);

  const fonts = options.fonts || await getDefaultFonts();
  // 使用 satori 生成 SVG
  const svg = await satori(finalElement, {
    width,
    height,
    fonts,
    debug: options.debug || false,
    graphemeImages: options.graphemeImages,
    loadAdditionalAsset: loadDynamicAsset({emoji:options.emoji}),
  });

  // 如果只需要 SVG，直接返回
  if (format === 'svg') {
    return Buffer.from(svg, 'utf-8');
  }

  // 使用 resvg 将 SVG 转换为 PNG/JPEG
  const resvgOptions: any = {};
  
  if (options.fitTo) {
    resvgOptions.fitTo = options.fitTo;
  }
  
  if (options.background) {
    resvgOptions.background = options.background;
  }

  const resvg = new Resvg(svg, resvgOptions);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // 如果需要 JPEG，需要进一步转换
  if (format === 'jpeg' || format === 'jpg') {
    // 注意：resvg-js 主要输出 PNG，对于 JPEG 我们可能需要额外的处理
    // 这里我们先返回 PNG，后续可以集成 sharp 或其他库来转换格式
    console.warn('JPEG format is not fully supported yet, returning PNG');
  }

  return pngBuffer;
}
/**
 * 便利函数：从 JSX 对象生成图片
 */
export async function jsxObjectToBuffer(
  jsxObject: JSXObject,
  options: GenerateOptions = {}
): Promise<Buffer> {
  return generateImage(jsxObject, options);
}

/**
 * 便利函数：从 React 元素生成图片
 */
export async function reactElementToBuffer(
  element: ReactElement,
  options: GenerateOptions = {}
): Promise<Buffer> {
  return generateImage(element, options);
}

/**
 * 便利函数：从 JSX 字符串生成图片
 */
export async function jsxStringToBuffer(
  jsxString: string,
  options: GenerateOptions = {}
): Promise<Buffer> {
  const { parseJSX } = await import('./jsx-parser.js');
  const jsxObject = parseJSX(jsxString);
  return generateImage(jsxObject, options);
}

/**
 * 自动检测输入类型并生成图片
 */
export async function generateImageFromInput(
  input: ReactElement | JSXObject | string,
  options: GenerateOptions = {}
): Promise<Buffer> {
  if (typeof input === 'string') {
    return jsxStringToBuffer(input, options);
  } else if (isJSXObject(input)) {
    return jsxObjectToBuffer(input as JSXObject, options);
  } else {
    return reactElementToBuffer(input as ReactElement, options);
  }
}

// 向后兼容的别名
export const jsxToBuffer = generateImageFromInput;

// 重新导出processElement
export { processElement } from './component-renderer.js'; 