import fs from 'fs';
import path from 'path';
import { Html2ImgError } from '../types';

export enum FontWeight {
  THIN = 100,
  EXTRA_LIGHT = 200,
  LIGHT = 300,
  NORMAL = 400,
  MEDIUM = 500,
  SEMI_BOLD = 600,
  BOLD = 700,
  EXTRA_BOLD = 800,
  BLACK = 900
}

export enum FontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic'
}

/**
 * 字体配置接口
 */
export interface FontConfig {
  name: string;
  data: Buffer;
  weight: FontWeight;
  style: FontStyle;
}

/**
 * 加载默认中文字体
 */
export function loadDefaultChineseFont(): FontConfig {
  try {
    const fontPath = path.join(
      process.cwd(),
      'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff'
    );
    if (!fs.existsSync(fontPath)) {
      throw new Html2ImgError('Default Chinese font not found');
    }
    const fontData = fs.readFileSync(fontPath);
    return {
      name: 'Noto Sans SC',
      data: fontData,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    };
  } catch (error) {
    throw new Html2ImgError('Failed to load default Chinese font', error);
  }
}

/**
 * 加载自定义字体
 */
export function loadCustomFont(
  fontPath: string,
  options: Partial<Omit<FontConfig, 'data'>> = {}
): FontConfig {
  try {
    if (!fs.existsSync(fontPath)) {
      return loadDefaultChineseFont();
    }
    const fontData = fs.readFileSync(fontPath);
    return {
      name: options.name || 'Custom Font',
      data: fontData,
      weight: options.weight || FontWeight.NORMAL,
      style: options.style || FontStyle.NORMAL,
    };
  } catch (error) {
    return loadDefaultChineseFont();
  }
}

/**
 * 加载 Roboto 字体
 */
export function loadRobotoFonts(): { normal: FontConfig; bold: FontConfig } {
  try {
    const robotoNormal = fs.readFileSync(
      path.join(
        process.cwd(),
        'node_modules/@fontsource/roboto/files/roboto-latin-400-normal.woff'
      )
    );
    const robotoBold = fs.readFileSync(
      path.join(
        process.cwd(),
        'node_modules/@fontsource/roboto/files/roboto-latin-700-normal.woff'
      )
    );

    return {
      normal: {
        name: 'Roboto',
        data: robotoNormal,
        weight: FontWeight.NORMAL,
        style: FontStyle.NORMAL,
      },
      bold: {
        name: 'Roboto',
        data: robotoBold,
        weight: FontWeight.BOLD,
        style: FontStyle.NORMAL,
      },
    };
  } catch (error) {
    throw new Html2ImgError(
      'Failed to load Roboto font files. Make sure @fontsource/roboto is installed',
      error
    );
  }
}

export async function loadFont(fontPath: string): Promise<FontConfig> {
  try {
    const fontData = await fs.promises.readFile(fontPath);
    return {
      name: path.basename(fontPath, path.extname(fontPath)),
      data: fontData,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL
    };
  } catch (error) {
    throw new Error(`Failed to load font: ${error instanceof Error ? error.message : String(error)}`);
  }
}
