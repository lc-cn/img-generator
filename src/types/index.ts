import { FontWeight } from '../utils/font';

/**
 * HTML 转图片的配置选项
 */
export interface Html2ImgOptions {
  /** 输出图片宽度 */
  width?: number;
  /** 输出图片高度 */
  height?: number;
  /** 基础URL，用于解析相对路径 */
  baseUrl?: string;
}

/**
 * 样式对象类型
 */
export interface StyleObject {
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  margin?: string;
  padding?: string;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string | number;
  textAlign?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  position?: string;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;
  overflow?: string;
  opacity?: number;
  transform?: string;
  transition?: string;
  listStyle?: string;
  lineHeight?: string | number;
  letterSpacing?: string;
  textDecoration?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  [key: string]: string | number | undefined;
}

/**
 * JSX Element 类型定义
 */
export interface JSXElement {
  type: string;
  props: {
    style?: StyleObject;
    src?: string;
    href?: string;
    children?: (JSXElement | string)[];
    [key: string]: StyleObject | string | (JSXElement | string)[] | undefined;
  };
  children?: (JSXElement | string)[];
}

/**
 * 自定义错误类
 */
export class Html2ImgError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'Html2ImgError';
    // 确保原型链正确设置
    Object.setPrototypeOf(this, Html2ImgError.prototype);
  }
}

/**
 * 渲染配置
 */
export interface RenderConfig {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 字体列表 */
  fonts: Font[];
}

/**
 * 字体配置
 */
export interface Font {
  /** 字体名称 */
  name: string;
  /** 字体数据 */
  data: ArrayBuffer;
  /** 字体样式 */
  style?: 'normal' | 'italic';
  /** 字体粗细 */
  weight?: number;
}

/**
 * 输入类型
 */
export type Html2ImgInput = string | JSXElement;

export interface ResourceConfig {
  baseUrl?: string;
  timeout?: number;
  maxRedirects?: number;
}

export interface FontConfig {
  name: string;
  data: Buffer;
  weight?: FontWeight;
  style?: string;
}

export interface FontOptions {
  name: string;
  data: Buffer;
  weight?: FontWeight;
  style?: string;
  format?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResourceError extends Error {
  code: string;
  url: string;
}
