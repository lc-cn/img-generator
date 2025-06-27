export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type FontStyle = 'normal' | 'italic'

export interface FontOptions {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: Weight;
  style?: FontStyle;
  lang?: string;
}

export interface ImageOptions {
  width?: number
  height?: number
  debug?: boolean
  fonts?: FontOptions[]
}

export const DEFAULT_OPTIONS: Required<Omit<ImageOptions, 'fonts'>> = {
  width: 1200,
  height: 630,
  debug: false,
} 