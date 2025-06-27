# Core Package - Image Generator

核心渲染库，提供JSX到图片转换的所有功能。

## 🚀 功能特性

- **🎨 JSX 渲染** - 支持JSX字符串和对象格式
- **🔄 统一格式** - 标准化的JSX对象结构
- **⚛️ React 兼容** - 使用React类型，自定义函数实现
- **🌐 HTML 转换** - HTML到JSX的转换
- **📁 文件夹渲染** - 批量渲染文件夹中的组件
- **🎭 Emoji 支持** - 自动检测和渲染emoji
- **🔤 字体加载** - 自动加载Google字体
- **🖼️ 图片处理** - 支持图片资源加载
- **🔒 类型安全** - 完整的TypeScript类型支持

## 📦 安装

```bash
npm install img-generator
```

## ⚛️ React类型兼容性

本库采用独特的设计：**使用React的官方类型定义，但实现自定义的函数**。这样既保证了与`@vercel/og`等库的完全类型兼容性，又避免了对React运行时的依赖。

### 核心实现

```typescript
// 使用React的类型定义
import { ReactElement, JSXElementConstructor } from 'react';

// 但实现自定义函数
export function createElement(type, props, ...children): ReactElement {
  // 自定义实现逻辑
}

export function isValidElement(object): object is ReactElement {
  // 自定义验证逻辑
}
```

### 优势

- ✅ **完全类型兼容** - 与React生态系统类型完全兼容
- ✅ **无运行时依赖** - 不需要React运行时
- ✅ **性能优化** - 专为图片生成优化的实现
- ✅ **@vercel/og兼容** - 直接兼容Vercel OG库

## 🎯 JSX格式规范

### 标准JSX对象格式

本库使用以下统一的JSX对象格式：

```javascript
{
  type: string,
  props: {
    children?: JSXObject | JSXObject[] | string | number,
    [key: string]: any
  }
}
```

### 示例

```javascript
// ✅ 标准格式
const jsxObject = {
  type: 'div',
  props: {
    style: { color: 'red', fontSize: '24px' },
    className: 'my-class',
    children: 'Hello World'
  }
}

// ✅ 嵌套结构
const nestedJSX = {
  type: 'div',
  props: {
    style: { padding: '20px' },
    children: [
      {
        type: 'h1',
        props: {
          children: 'Title'
        }
      },
      {
        type: 'p',
        props: {
          children: 'Content'
        }
      }
    ]
  }
}
```

## 🔧 基本用法

### JSX字符串渲染

```javascript
import { jsxStringToBuffer, jsxToBuffer } from 'img-generator'

// 方式1: 专门的字符串函数
const jsxString = `<div style={{color: "red"}}>Hello World</div>`
const buffer1 = await jsxStringToBuffer(jsxString)

// 方式2: 统一接口（自动检测）
const buffer2 = await jsxToBuffer(jsxString)
```

### JSX对象渲染

```javascript
import { jsxToBuffer } from 'img-generator'

const jsxObject = {
  type: 'div',
  props: {
    style: {
      width: '800px',
      height: '600px',
      background: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '32px'
    },
    children: 'Hello from JSX Object!'
  }
}

const buffer = await jsxToBuffer(jsxObject)
```

### JSX解析和转换

```javascript
import { parseJSX, objectToJSX } from 'img-generator'

// JSX字符串 → 对象
const jsxString = `<div style={{color: "red"}}>Hello</div>`
const parsed = parseJSX(jsxString)
console.log(parsed)
// 输出: { type: 'div', props: { style: { color: 'red' }, children: 'Hello' } }

// 对象 → JSX字符串
const backToJSX = objectToJSX(parsed)
console.log(backToJSX)
// 输出: <div style={{color: 'red'}}>Hello</div>
```

## 🎨 样式处理

### 内联样式

```javascript
const styledJSX = {
  type: 'div',
  props: {
    style: {
      width: '400px',
      height: '300px',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    children: 'Styled Component'
  }
}
```

### CSS类名（配合HTML转换）

```javascript
import { htmlToBuffer } from 'img-generator'

const htmlWithCSS = `
  <style>
    .card {
      width: 400px;
      height: 300px;
      background: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
    }
  </style>
  <div class="card">
    <h2>Card Title</h2>
    <p>Card content</p>
  </div>
`

const buffer = await htmlToBuffer(htmlWithCSS)
```

## 🔧 配置选项

```javascript
const options = {
  width: 1200,           // 图片宽度
  height: 630,           // 图片高度
  fonts: [               // 自定义字体
    {
      name: 'Inter',
      data: fontBuffer,
      weight: 400,
      style: 'normal'
    }
  ]
}

const buffer = await jsxToBuffer(jsxObject, options)
```

## 🧪 测试

```bash
# 运行测试
npm test

# 运行特定测试
node test-jsx-core.js
```

## 📚 API 参考

### jsxToBuffer(element, options?, baseDir?, cssStyles?)

将JSX对象或字符串转换为图片Buffer。

**参数:**
- `element` - JSX对象或JSX字符串
- `options` - 图片选项（可选）
- `baseDir` - 基础目录（可选）
- `cssStyles` - CSS样式（可选）

**返回:** `Promise<Buffer>`

### jsxStringToBuffer(jsxString, options?, baseDir?)

专门处理JSX字符串的函数。

**参数:**
- `jsxString` - JSX字符串
- `options` - 图片选项（可选）
- `baseDir` - 基础目录（可选）

**返回:** `Promise<Buffer>`

### parseJSX(jsxString)

将JSX字符串解析为标准JSX对象。

**参数:**
- `jsxString` - JSX字符串

**返回:** `JSXObject`

### objectToJSX(jsxObject, indent?)

将JSX对象转换为JSX字符串。

**参数:**
- `jsxObject` - JSX对象
- `indent` - 缩进级别（可选）

**返回:** `string`

## �� 许可证

MIT License 