# html2img

Convert HTML or JSXElement to PNG image with Chinese font support.

[![npm version](https://badge.fury.io/js/html2img.svg)](https://badge.fury.io/js/html2img)
[![CI](https://github.com/yourusername/html2img/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/html2img/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Convert HTML string to PNG image
- Support JSXElement input
- Support Chinese fonts (Noto Sans SC)
- Support Roboto fonts
- Support custom fonts
- Support external images
- Support CSS styles
- Support SVG elements
- TypeScript support with comprehensive type definitions
- Error handling with custom error types

## Installation

```bash
npm install html2img
# or
yarn add html2img
# or
pnpm add html2img
```

## Usage

### Basic Usage

```typescript
import { html2img } from 'html2img';

const html = `
  <div style="width: 100px; height: 100px; background-color: red;">
    Hello World
  </div>
`;

const buffer = await html2img(html);
```

### With JSXElement

```typescript
import { html2img, JSXElement } from 'html2img';

const jsx: JSXElement = {
  type: 'div',
  props: {
    style: {
      width: '100px',
      height: '100px',
      backgroundColor: 'red'
    }
  },
  children: ['Hello World']
};

const buffer = await html2img(jsx);
```

### With Custom Fonts

```typescript
import { html2img, loadCustomFont, loadRobotoFonts } from 'html2img';

// Load custom font
const customFont = loadCustomFont('/path/to/font.ttf', {
  name: 'My Custom Font',
  weight: 700,
  style: 'normal'
});

// Load Roboto fonts
const { normal, bold } = loadRobotoFonts();

const buffer = await html2img(html, {
  fonts: [customFont, normal, bold]
});
```

### With External Image

```typescript
import { html2img } from 'html2img';

const html = `
  <div>
    <img src="https://example.com/image.jpg" />
  </div>
`;

const buffer = await html2img(html, {
  baseUrl: 'https://example.com'
});
```

## API

### html2img(input: string | JSXElement, options?: Html2ImgOptions): Promise<Buffer>

#### Parameters

- `input`: HTML string or JSXElement to convert
- `options`: Optional configuration
  - `width`: Width of the output image (default: 800)
  - `height`: Height of the output image (default: 600)
  - `baseUrl`: Base URL for resolving relative paths in HTML
  - `fonts`: Array of font configurations

#### Returns

Promise that resolves to a Buffer containing the PNG image data.

### Types

```typescript
interface JSXElement {
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

interface StyleObject {
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

interface FontConfig {
  name: string;
  data: Buffer;
  weight: FontWeight;
  style: FontStyle;
}

enum FontWeight {
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

enum FontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic'
}
```

## Error Handling

The library provides a custom error class `Html2ImgError` for better error handling:

```typescript
import { Html2ImgError } from 'html2img';

try {
  const buffer = await html2img(html);
} catch (error) {
  if (error instanceof Html2ImgError) {
    console.error('Error:', error.message);
    console.error('Cause:', error.cause);
  }
}
```

## Development

### Setup

```bash
git clone https://github.com/yourusername/html2img.git
cd html2img
npm install
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT 