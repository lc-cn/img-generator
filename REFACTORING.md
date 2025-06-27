# 代码重构说明

## 重构目标

将原来的单一 `core.ts` 文件拆分为多个专注的模块，提高代码的可维护性、可读性和可扩展性。

## 新的文件结构

### 📁 `src/` 目录

```
src/
├── types.ts          # 类型定义
├── fonts.ts          # 字体相关功能
├── css.ts            # CSS 处理功能
├── html.ts           # HTML 到 JSX 转换
├── resources.ts      # 资源加载功能
├── core.ts           # 核心功能（简化后）
├── folder-renderer.ts # 文件夹渲染功能
├── index.ts          # 主入口文件
└── test.ts           # 测试功能
```

### 📦 模块说明

#### `types.ts` - 类型定义
- `Weight` - 字体粗细类型
- `FontStyle` - 字体样式类型
- `FontOptions` - 字体选项接口
- `ImageOptions` - 图片选项接口
- `DEFAULT_OPTIONS` - 默认选项

#### `fonts.ts` - 字体相关功能
- `loadGoogleFont()` - 自动加载 Google 字体
- `detectFonts()` - 检测文本中使用的字体
- `detectEmojis()` - 检测文本中的 emoji
- 字体缓存机制

#### `css.ts` - CSS 处理功能
- `loadCSSFile()` - 加载 CSS 文件并解析
- `parseCSS()` - 解析 CSS 内容为样式对象
- `mergeClassAndStyle()` - 合并 class 和 style 属性

#### `html.ts` - HTML 到 JSX 转换
- `htmlToJSX()` - 轻量级 HTML 到 JSX 转换器
- 支持自动 CSS 样式转换
- 支持图片自动转 base64
- 递归为 div 多子节点自动加 display: flex

#### `resources.ts` - 资源加载功能
- `loadResource()` - 将资源文件转换为 base64 数据 URL
- 支持多种图片格式
- MIME 类型自动识别

#### `core.ts` - 核心功能（简化后）
- `processElement()` - 递归处理 JSX 元素
- `jsxToBuffer()` - 将 JSX 元素转换为图片 Buffer
- `htmlToBuffer()` - 将 HTML 字符串转换为图片 Buffer
- 重新导出所有模块的功能

#### `index.ts` - 主入口文件
- 统一导出所有公共 API
- 清晰的模块分组

## 重构优势

### 🎯 **单一职责原则**
每个文件都有明确的职责，便于理解和维护。

### 🔧 **模块化设计**
功能按领域分组，便于扩展和修改。

### 📖 **可读性提升**
代码结构更清晰，新开发者更容易理解。

### 🧪 **测试友好**
每个模块可以独立测试，提高测试覆盖率。

### 🔄 **可扩展性**
新增功能时，只需要在对应模块中添加，不影响其他模块。

## 使用方式

### 导入方式保持不变
```typescript
import { jsxToBuffer, htmlToBuffer, loadGoogleFont } from 'img-generator'
```

### 新增的模块化导入
```typescript
// 按需导入特定功能
import { loadCSSFile, parseCSS } from 'img-generator/css'
import { detectFonts, detectEmojis } from 'img-generator/fonts'
import { loadResource } from 'img-generator/resources'
```

## 向后兼容性

✅ **完全向后兼容** - 所有原有的 API 都保持不变，只是内部实现被重构为更清晰的模块结构。

## 测试验证

重构后通过了完整的综合测试，确保所有功能正常工作：
- ✅ HTML 到 JSX 转换
- ✅ CSS 文件自动转换为内联样式
- ✅ Google Fonts 自动加载
- ✅ 图片自动转换为 base64
- ✅ 多语言字体支持
- ✅ 文件夹渲染功能

## 性能影响

🔄 **无性能影响** - 重构只是代码组织方式的改变，不影响运行时性能。 