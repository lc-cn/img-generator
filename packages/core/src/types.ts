export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type FontStyle = 'normal' | 'italic'

export interface FontOptions {
  name: string;
  data: ArrayBuffer | Buffer;
  weight?: number;
  style?: 'normal' | 'italic';
}

export interface ImageOptions {
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: number;
}

export const DEFAULT_OPTIONS: Required<ImageOptions> = {
  width: 1200,
  height: 630,
  format: 'png',
  quality: 90,
};

export type ImageFormat = 'png' | 'jpeg' | 'jpg' | 'svg';

export interface JSXObject {
  type: string;
  props: {
    children?: JSXChild | JSXChild[];
    [key: string]: any;
  };
}

export type JSXChild = JSXObject | string | number | boolean | null | undefined;

export interface FolderRenderOptions extends ImageOptions {
  inputDir?: string;
  outputDir?: string;
  filePattern?: string;
  recursive?: boolean;
  baseDir?: string;
}

export interface HTMLConvertOptions extends ImageOptions {
  baseDir?: string;
  cssFiles?: string[];
  extractCSS?: boolean;
}

export interface ComponentRenderOptions extends ImageOptions {
  baseDir?: string;
  cssStyles?: Record<string, any>;
  fonts?: FontOptions[];
}

export interface ResourceOptions {
  baseDir?: string;
  allowedExtensions?: string[];
  maxFileSize?: number;
} 