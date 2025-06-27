# 图片生成器 Playground

这是图片生成器项目的在线体验平台，提供美观的Web界面来测试和体验图片生成功能，同时保留完整的API调用能力。

## 🌟 功能特性

- **🎨 在线编辑器** - 实时编辑JSX内容并预览
- **🖼️ 实时预览** - 即时查看生成的图片效果
- **📋 代码复制** - 一键复制JSX代码和cURL命令
- **📥 图片下载** - 直接下载生成的图片
- **📚 API文档** - 完整的API使用文档
- **🔧 无鉴权API** - 保留完整的API调用能力

## 🚀 快速开始

### 安装依赖

```bash
cd packages/playground
pnpm install
```

### 启动服务

```bash
pnpm dev
```

服务将在 `http://localhost:3001` 启动。

## 🎯 使用方式

### 1. 在线体验

访问 `http://localhost:3001` 进入在线体验界面：

- **JSX编辑器** - 在左侧编辑JSX内容
- **实时预览** - 在右侧查看生成的图片
- **一键生成** - 点击"生成图片"按钮
- **下载保存** - 点击"下载图片"按钮

### 2. API调用

平台保留了完整的API调用能力，支持：

#### POST /api/og

```bash
curl -X POST http://localhost:3001/api/og \
  -H "Content-Type: application/json" \
  -d '{
    "type": "jsx",
    "content": {
      "type": "div",
      "props": {
        "style": {
          "fontSize": "32px",
          "color": "red",
          "padding": "20px"
        }
      },
      "children": "Hello World"
    }
  }'
```

#### GET /api/og

```bash
curl "http://localhost:3001/api/og?type=jsx&content={\"type\":\"div\",\"props\":{\"style\":{\"color\":\"red\"}},\"children\":\"Hello World\"}"
```

## 🎨 界面特性

### 现代化设计

- **响应式布局** - 适配各种屏幕尺寸
- **美观UI** - 使用Tailwind CSS和Heroicons
- **交互反馈** - 加载状态、复制确认等
- **代码高亮** - 语法高亮的代码编辑器

### 用户体验

- **实时编辑** - 所见即所得的编辑体验
- **一键操作** - 复制、下载、生成等快捷操作
- **错误处理** - 友好的错误提示
- **加载状态** - 清晰的加载指示器

## 📚 API文档

平台内置了完整的API文档，包括：

- **端点说明** - POST和GET接口详解
- **参数说明** - 请求参数和响应格式
- **示例代码** - 各种渲染类型的示例
- **环境要求** - 部署环境说明

## 🔧 技术栈

- **Next.js 14** - React框架
- **Tailwind CSS** - 样式框架
- **Heroicons** - 图标库
- **Headless UI** - 无样式组件库
- **TypeScript** - 类型安全

## 🚀 部署

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 生产模式
pnpm start
```

### Docker部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🎯 使用场景

### 1. 开发者测试

- 快速测试JSX渲染效果
- 验证API调用参数
- 调试渲染问题

### 2. 产品演示

- 展示图片生成功能
- 演示各种渲染类型
- 提供交互式体验

### 3. 学习工具

- 学习JSX语法
- 理解图片生成原理
- 实践API调用

## 🔗 相关链接

- [Core 包文档](../core/README.md)
- [项目主页](../../README.md)
- [API 端点文档](./app/api/og/route.ts)
