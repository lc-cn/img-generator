# html2img

Convert HTML or JSXElement to PNG image with Chinese font support.

[![npm version](https://badge.fury.io/js/html2img.svg)](https://badge.fury.io/js/html2img)
[![CI](https://github.com/yourusername/html2img/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/html2img/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Convert HTML string to PNG image
- Support JSXElement input
- Support Chinese fonts (Noto Sans SC)
- Support external images
- Support CSS styles
- Support SVG elements

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

#### Returns

Promise that resolves to a Buffer containing the PNG image data.

### Types

```typescript
interface JSXElement {
  type: string;
  props: {
    [key: string]: any;
  };
  children: (string | JSXElement)[];
}

interface Html2ImgOptions {
  width?: number;
  height?: number;
  baseUrl?: string;
}
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/html2img.git
cd html2img

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test
```

### Project Structure

```
html2img/
├── src/
│   ├── core/         # Core conversion logic
│   ├── utils/        # Utility functions
│   ├── types/        # TypeScript type definitions
│   └── index.ts      # Main entry point
├── dist/             # Build output
├── examples/         # Usage examples
└── tests/            # Test files
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

## Release Process

This project uses [Release Please](https://github.com/google-github-actions/release-please-action) for automated version management and releases.

### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Test-related changes
- `build`: Build system changes
- `ci`: CI configuration changes
- `perf`: Performance improvements
- `style`: Code style changes
- `revert`: Revert changes

### Version Bumping

- `feat` -> Minor version (1.0.0 -> 1.1.0)
- `fix` -> Patch version (1.0.0 -> 1.0.1)
- `BREAKING CHANGE` -> Major version (1.0.0 -> 2.0.0)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 