# IMG Generator Core

一个强大的图片生成库，支持从 JSX/React 元素生成 PNG、SVG 等格式的图片。底层使用 `satori` + `@resvg/resvg-js` 实现，同时支持 ESM 和 CommonJS。

## 特性

- 🚀 **高性能**: 基于 `satori` 和 `@resvg/resvg-js` 的底层实现
- 📦 **双模块支持**: 同时支持 ESM 和 CommonJS
- 🎨 **JSX 支持**: 支持 JSX 语法和 React 元素
- 🔧 **TypeScript**: 完整的 TypeScript 类型支持
- 🎯 **自动布局**: 智能的 Flexbox 布局修复
- 🌍 **字体支持**: 支持 Google Fonts 和自定义字体
- 🎭 **多格式**: 支持 PNG、SVG 输出格式

## 安装

```bash
npm install img-generator
# 或
pnpm add img-generator
# 或
yarn add img-generator
```

## 快速开始

### ESM 使用方式

```javascript
import { generateImage, createElement } from 'img-generator';
import fs from 'fs';

// 创建一个简单的元素
const element = createElement('div', {
  style: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    fontSize: '48px',
    color: '#333',
  }
}, 'Hello, World!');

// 生成图片
const buffer = await generateImage(element, {
  width: 800,
  height: 600,
  format: 'png'
});

// 保存图片
fs.writeFileSync('output.png', buffer);
```

### CommonJS 使用方式

```javascript
const { generateImage, createElement } = require('img-generator');
const fs = require('fs');

async function generateImg() {
  const element = createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e3f2fd',
      fontSize: '36px',
      color: '#1976d2',
    }
  }, 'CommonJS Works!');

  const buffer = await generateImage(element, {
    width: 600,
    height: 400
  });

  fs.writeFileSync('output.png', buffer);
}

generateImg();
```

## API 文档

### `generateImage(element, options)`

生成图片的核心函数。

**参数:**
- `element`: React 元素或 JSX 对象
- `options`: 生成选项

**选项:**
```typescript
interface GenerateOptions {
  width?: number;          // 图片宽度，默认 1200
  height?: number;         // 图片高度，默认 630
  format?: 'png' | 'svg';  // 输出格式，默认 'png'
  quality?: number;        // 图片质量，默认 90
  debug?: boolean;         // 调试模式
  background?: string;     // 背景颜色
}
```

### `createElement(type, props, ...children)`

创建 React 元素的工具函数。

**参数:**
- `type`: 元素类型（字符串或组件）
- `props`: 元素属性
- `children`: 子元素

### 其他实用函数

```javascript
// 从 JSX 字符串生成图片
const buffer = await jsxStringToBuffer('<div>Hello</div>', options);

// 自动检测输入类型
const buffer = await jsxToBuffer(elementOrStringOrObject, options);

// JSX 解析
const jsxObject = parseJSX('<div>Hello</div>');

// 对象转 JSX 字符串
const jsxString = objectToJSX(jsxObject);
```

## 样式支持

库支持大部分 CSS 样式属性，特别针对 Flexbox 布局进行了优化：

```javascript
const element = createElement('div', {
  style: {
    // 布局
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    
    // 尺寸
    width: '100%',
    height: '100%',
    padding: '20px',
    margin: '10px',
    
    // 外观
    backgroundColor: '#ffffff',
    color: '#333333',
    fontSize: '24px',
    fontWeight: 'bold',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    
    // 边框
    border: '1px solid #e0e0e0',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#ddd',
  }
}, 'Styled Content');
```

## 字体支持

### Google Fonts

```javascript
import { loadFont } from 'img-generator';

// 加载 Google 字体
const fontData = await loadFont('Inter', 400, 'normal');
```

### 自定义字体

```javascript
import { loadFontFromFile } from 'img-generator';

// 从文件加载字体
const fontData = await loadFontFromFile('./fonts/custom.ttf');
```

## 复杂示例

### 卡片样式

```javascript
const card = createElement('div', {
  style: {
    width: '400px',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '24px',
  }
}, [
  createElement('h2', {
    style: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      margin: '0 0 12px 0',
    }
  }, 'Card Title'),
  
  createElement('p', {
    style: {
      fontSize: '16px',
      color: '#666666',
      lineHeight: '1.5',
      margin: '0',
    }
  }, 'This is a description of the card content.')
]);

const buffer = await generateImage(card, {
  width: 500,
  height: 300
});
```

### 多语言支持

```javascript
const multiLang = createElement('div', {
  style: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '40px',
  }
}, [
  createElement('div', { 
    style: { fontSize: '32px', marginBottom: '16px' } 
  }, '🌍 Hello World'),
  
  createElement('div', { 
    style: { fontSize: '24px', marginBottom: '8px' } 
  }, '你好世界'),
  
  createElement('div', { 
    style: { fontSize: '24px', marginBottom: '8px' } 
  }, 'こんにちは世界'),
  
  createElement('div', { 
    style: { fontSize: '24px' } 
  }, '안녕하세요 세계'),
]);
```

## 错误处理

```javascript
try {
  const buffer = await generateImage(element, options);
  console.log('图片生成成功');
} catch (error) {
  if (error.message.includes('font')) {
    console.error('字体加载失败:', error);
  } else if (error.message.includes('satori')) {
    console.error('SVG 生成失败:', error);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 性能优化

1. **缓存字体**: 字体加载是耗时操作，建议缓存字体数据
2. **合理尺寸**: 避免生成过大的图片
3. **样式优化**: 使用简单的样式可以提高渲染速度

## 限制

1. **CSS 支持**: 不支持所有 CSS 特性，主要支持 Flexbox 布局
2. **图片格式**: 目前主要支持 PNG 和 SVG，JPEG 支持有限
3. **字体**: 需要显式加载字体，不支持系统字体回退

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v0.1.0
- 初始版本
- 支持 ESM 和 CommonJS
- 基于 satori + resvg-js 实现
- 支持 JSX 和 React 元素
- 自动 Flexbox 布局修复 