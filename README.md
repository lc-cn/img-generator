# 图片生成器 (Image Generator)

一个强大的图片生成工具，支持JSX、HTML、组件渲染和文件夹渲染，专为有文件系统访问权限的环境设计。

## 🌟 功能特性

- **🎨 JSX 渲染** - 将JSX元素转换为高质量图片，**支持JSX字符串语法**
- **🌐 HTML 渲染** - 将HTML转换为图片，支持内联CSS
- **⚛️ 组件渲染** - 渲染React组件，支持props传递
- **📁 文件夹渲染** - 渲染文件夹中的组件
- **🎭 Emoji 支持** - 自动检测和加载emoji字体
- **🔤 Google 字体** - 自动加载和缓存Google字体
- **🖼️ 图片嵌入** - 支持base64图片嵌入
- **🎯 CSS 内联** - 自动将CSS样式内联到HTML中
- **💾 自动保存** - 生成的图片自动保存到本地文件系统
- **🌐 在线体验** - 美观的Web界面进行实时测试，支持JSX语法高亮
- **🔄 双向转换** - JSX字符串与对象格式互相转换

## 🏗️ 项目结构

```
img-generator/
├── packages/
│   ├── core/          # 核心库（包含JSX解析器）
│   └── playground/    # 在线体验平台
├── examples/          # 示例文件
└── README.md
```

## 🚀 快速开始

### 安装依赖

```bash
# 安装所有依赖
pnpm install

# 或者分别安装
cd packages/core && pnpm install
cd packages/playground && pnpm install
```

### 使用核心库

```javascript
import { 
  jsxToBuffer, 
  jsxStringToBuffer, 
  parseJSX, 
  objectToJSX, 
  htmlToBuffer, 
  renderComponent 
} from 'img-generator'

// JSX字符串渲染（新功能！）
const jsxString = `<div style={{color: "red"}}>Hello World</div>`
const buffer1 = await jsxStringToBuffer(jsxString)

// JSX对象渲染（传统方式）
const jsxElement = {
  type: 'div',
  props: {
    style: {
      color: 'red'
    }
  },
  children: 'Hello World'
}
const buffer2 = await jsxToBuffer(jsxElement, { width: 1200, height: 630 })

// 统一接口（自动检测字符串或对象）
const buffer3 = await jsxToBuffer(jsxString)

// HTML 渲染
const buffer4 = await htmlToBuffer('<div>Hello World</div>')

// 组件渲染
const buffer5 = await renderComponent('MyComponent', { props: { title: 'Hello' } })

// JSX解析和转换
const parsed = parseJSX(jsxString)      // 字符串 → 对象
const backToJSX = objectToJSX(parsed)   // 对象 → 字符串
```

### 启动在线体验平台

```bash
cd packages/playground
pnpm dev
```

在线体验平台将在 `http://localhost:3001` 启动。

## 📦 包说明

### Core 包 (`packages/core`)

核心渲染库，提供所有渲染功能。

**主要功能：**
- JSX到图片转换
- HTML到图片转换
- React组件渲染
- 文件夹渲染
- 字体和emoji处理
- CSS内联处理

**安装：**
```bash
npm install img-generator
```

**使用：**
```javascript
import { jsxToBuffer, htmlToBuffer, renderComponent } from 'img-generator'

// JSX 渲染
const buffer = await jsxToBuffer(jsxElement, { width: 1200, height: 630 })

// HTML 渲染
const buffer = await htmlToBuffer('<div>Hello World</div>')

// 组件渲染
const buffer = await renderComponent('MyComponent', { props: { title: 'Hello' } })
```

### Playground 包 (`packages/playground`)

在线体验平台，提供美观的Web界面。

**功能：**
- 在线JSX编辑器，支持语法高亮
- JSX/JSON双模式切换
- 实时图片预览
- 一键下载功能
- 完整的API文档
- 无鉴权API调用

**启动：**
```bash
cd packages/playground
pnpm dev
```

**访问：**
- 在线体验：http://localhost:3001
- API文档：http://localhost:3001 (切换到API文档标签)

**API示例：**
```bash
# JSX对象渲染
curl -X POST http://localhost:3001/api/og \
  -H "Content-Type: application/json" \
  -d '{
    "type": "jsx",
    "content": {
      "type": "div",
      "props": {"style": {"color": "red"}},
      "children": "Hello World"
    }
  }'

# JSX字符串渲染（新功能！）
curl -X POST http://localhost:3001/api/og \
  -H "Content-Type: application/json" \
  -d '{
    "type": "jsx-string",
    "content": "<div style={{color: \"red\"}}>Hello World</div>"
  }'
```

## 🎯 使用场景

### 1. OG 图片生成

为社交媒体生成精美的OG图片：

```javascript
// 使用JSX字符串（推荐！）
const jsxString = `<div style={{
  width: "1200px",
  height: "630px",
  background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: "48px",
  fontFamily: "Arial, sans-serif"
}}>
  我的博客标题
</div>`

const ogImage = await jsxStringToBuffer(jsxString)

// 或使用对象格式（传统方式）
const ogImage2 = await jsxToBuffer({
  type: 'div',
  props: {
    style: {
      width: '1200px',
      height: '630px',
      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif'
    }
  },
  children: '我的博客标题'
})
```

### 2. 组件渲染

渲染预定义的React组件：

```javascript
// 注册组件
import { registerComponent } from 'img-generator'
import MyCard from './components/MyCard'

registerComponent('MyCard', MyCard)

// 渲染组件
const buffer = await renderComponent('MyCard', {
  props: {
    title: '欢迎',
    subtitle: '这是一个测试'
  }
})
```

### 3. 文件夹渲染

渲染文件夹中的组件：

```javascript
const buffer = await renderFolder('./components/my-component', {
  width: 1200,
  height: 630
})
```

### 4. 在线体验

使用Web界面快速测试和预览：

1. 访问 http://localhost:3001
2. 在左侧编辑JSX内容
3. 点击"生成图片"按钮
4. 在右侧查看预览效果
5. 下载生成的图片

## 🔧 配置选项

### 渲染选项

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
  ],
  loadAdditionalFonts: true,  // 自动加载Google字体
  loadAdditionalImages: true  // 自动加载图片
}
```

### 字体处理

```javascript
// 自动检测和加载emoji字体
const buffer = await jsxToBuffer(element, {
  loadAdditionalFonts: true
})

// 使用Google字体
const buffer = await jsxToBuffer(element, {
  fonts: [
    {
      name: 'Roboto',
      data: await fetch('https://fonts.googleapis.com/css2?family=Roboto').then(r => r.arrayBuffer()),
      weight: 400,
      style: 'normal'
    }
  ]
})
```

## 🌍 环境要求

此项目专为有文件系统访问权限的环境设计，适用于：

- ✅ 传统服务器部署
- ✅ Docker容器
- ✅ 本地开发环境
- ✅ 支持文件系统的云平台
- ❌ 无服务器环境（Vercel、Netlify等）

## 🚀 部署

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### 传统服务器部署

```bash
# 构建
pnpm build

# 启动生产服务
cd packages/playground && pnpm start
```

## 🧪 测试

### 运行测试

```bash
# 核心库测试
cd packages/core
pnpm test

# 在线体验平台测试
cd packages/playground
pnpm dev
```

### 示例测试

```bash
# 运行示例
cd examples
node test-jsx-demo.js
node test-css-inline.js
```

## 📚 示例

查看 `examples/` 目录中的完整示例：

- `component-renderer-demo.js` - 组件渲染示例
- `comprehensive-test.js` - 综合功能测试
- `test-css-inline.js` - CSS内联测试
- `demo-folder/` - 文件夹渲染示例


## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [Core 包文档](packages/core/README.md)
- [Playground 包文档](packages/playground/README.md)

## 🆕 最新更新

### JSX字符串支持（Core层集成）

我们将JSX解析器集成到了core层，现在你可以：

✨ **直接使用JSX字符串语法**
```javascript
const jsxString = `<div style={{color: "red"}}>Hello World</div>`
const buffer = await jsxStringToBuffer(jsxString)
```

🔄 **统一的API接口**
```javascript
// 自动检测输入类型（字符串或对象）
const buffer1 = await jsxToBuffer(jsxString)    // JSX字符串
const buffer2 = await jsxToBuffer(jsxObject)    // JSX对象
```

🎯 **双向转换**
```javascript
const parsed = parseJSX(jsxString)      // JSX字符串 → 对象
const backToJSX = objectToJSX(parsed)   // 对象 → JSX字符串
```

🎨 **在线体验增强**
- JSX语法高亮
- JSX/JSON双模式切换
- 实时预览
- 一键复制/下载

🚀 **API支持**
```bash
# 新增jsx-string类型
curl -X POST http://localhost:3001/api/og \
  -H "Content-Type: application/json" \
  -d '{"type": "jsx-string", "content": "<div>Hello</div>"}'
```

### 📐 JSX格式规范统一

为了确保一致性和可预测性，我们使用统一的JSX对象格式：

**标准格式：**
```javascript
{
  type: 'div',
  props: {
    style: { color: 'red' },
    children: 'Hello World'  // children在props内部
  }
}
```

**优势:**
- 🔄 统一的数据结构
- 🚀 更好的性能
- 🎯 更可靠的解析
- 📚 更清晰的文档
- 🧹 更简洁的代码

这些更新让JSX图片生成变得更加直观和便捷！
