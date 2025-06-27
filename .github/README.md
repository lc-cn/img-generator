# GitHub Actions 配置说明

本项目使用 GitHub Actions 进行自动化构建、测试和发布。以下是各个工作流的说明：

## 🚀 工作流概览

### 1. CI (持续集成) - `.github/workflows/ci.yml`

**触发条件：**
- 推送到 `main` 或 `master` 分支
- 创建 Pull Request

**功能：**
- 在 Node.js 18.x 上运行测试
- 构建所有包（core 和 playground）
- 运行代码检查和测试
- 缓存依赖以提高构建速度

### 2. 发布 (Publish) - `.github/workflows/publish.yml`

**触发条件：**
- 创建 GitHub Release
- 手动触发（workflow_dispatch）

**功能：**
- 构建和测试 core 包
- 发布 `img-generator` 包到 NPM
- 可选择发布版本和标签（latest, beta 等）
- 自动部署 playground 到 Vercel

**手动发布示例：**
```bash
# 在 GitHub Actions 页面手动触发，输入：
# Version: 1.0.0
# Tag: latest
```

### 3. Release Please - `.github/workflows/release-please.yml`

**触发条件：**
- 推送到 `main` 或 `master` 分支

**功能：**
- 根据 Conventional Commits 自动生成 CHANGELOG
- 自动创建 Release PR
- 当 PR 合并时自动创建 GitHub Release
- 自动发布到 NPM

### 4. 部署 (Deploy) - `.github/workflows/deploy.yml`

**触发条件：**
- 推送到 `main` 或 `master` 分支（仅当 playground 或 core 有变更）
- 手动触发

**功能：**
- 部署 playground 到 Vercel 生产环境
- PR 预览部署

## 🔧 必需的 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

### NPM 发布
```
NPM_TOKEN=your_npm_token
```

### Vercel 部署（可选）
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

## 📦 发布流程

### 方法 1: 使用 Release Please（推荐）

1. 使用 Conventional Commits 格式提交代码：
   ```bash
   feat: add new JSX parsing feature
   fix: resolve styling issues
   docs: update API documentation
   ```

2. Release Please 会自动：
   - 创建 Release PR
   - 更新版本号和 CHANGELOG
   - 当 PR 合并时创建 Release 并发布到 NPM

### 方法 2: 手动发布

1. 在 GitHub Actions 页面手动触发 "Publish" 工作流
2. 输入版本号（如 1.0.0）和标签（如 latest）
3. 工作流会自动构建、测试并发布

### 方法 3: 本地发布

```bash
# 补丁版本
pnpm release:patch

# 次要版本  
pnpm release:minor

# 主要版本
pnpm release:major
```

## 🏗️ 构建流程

### 本地开发
```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

### CI/CD 流程
1. **代码提交** → 触发 CI 工作流
2. **构建测试** → 验证代码质量
3. **创建 PR** → Release Please 分析提交
4. **合并 PR** → 自动发布新版本
5. **部署应用** → Playground 自动部署到 Vercel

## 📋 版本管理

项目使用 [Semantic Versioning](https://semver.org/)：

- `MAJOR.MINOR.PATCH` (如 1.0.0)
- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

## 🔍 故障排除

### 构建失败
1. 检查 Node.js 版本兼容性
2. 确保所有依赖已正确安装
3. 验证 TypeScript 编译无错误

### 发布失败
1. 检查 NPM_TOKEN 是否有效
2. 确保包名在 NPM 上可用
3. 验证版本号格式正确

### 部署失败
1. 检查 Vercel secrets 配置
2. 确保 playground 构建成功
3. 验证 Vercel 项目配置

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Release Please 文档](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vercel 部署文档](https://vercel.com/docs) 