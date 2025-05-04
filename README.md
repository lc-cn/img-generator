# HTML to Image Generator

A powerful tool for generating Open Graph images dynamically from HTML, React components, and Vue components without a browser.

## Features

- 🖼️ Generate images from React components
- 📝 Convert HTML to images
- 🎨 Support for Vue single file components
- 🌏 Multi-language support with automatic font detection
- 😀 Emoji support
- 🎨 Modern CSS features support

## Installation

```bash
npm install img-generator
# or
yarn add img-generator
# or
pnpm add img-generator
```

## Usage

### React Component to Image

```typescript-jsx
import { reactToBuffer } from 'img-generator';

const element = (
  <div
    style={{
      fontSize: 128,
      background: 'white',
      width: '100%',
      height: '100%',
      display: 'flex',
      textAlign: 'center',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    Hello world!
  </div>
);

const buffer = await reactToBuffer(element, {
  width: 1200,
  height: 630,
});
```

### HTML to Image

```typescript
import { htmlToBuffer } from 'img-generator';

const html = `
  <div style="
    font-size: 128px;
    background: white;
    width: 100%;
    height: 100%;
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;
  ">
    Hello world!
  </div>
`;

const buffer = await htmlToBuffer(html, {
  width: 1200,
  height: 630,
});
```

### Vue Component to Image

```typescript
import { vueToBuffer } from 'img-generator';

const vueCode = `
<template>
  <div class="container">
    <h1>Hello World</h1>
  </div>
</template>

<style>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}
</style>
`;

const buffer = await vueToBuffer(vueCode, {
  width: 1200,
  height: 630,
});
```

## Configuration

### Image Options

- `width` (number, default: 1200): The width of the image
- `height` (number, default: 630): The height of the image
- `debug` (boolean, default: false): Display debug information
- `fontSource` (string, default: 'github'): Font source ('github' or 'gitee')
- `props` (object, default: {}): Additional props to pass to components

## License

MIT 
