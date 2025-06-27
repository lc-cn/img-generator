#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 设置 GitHub Actions 配置...\n');

// 获取当前 git commit SHA
function getCurrentCommitSha() {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('⚠️  无法获取当前 commit SHA，请手动设置');
    return 'REPLACE_WITH_CURRENT_COMMIT_SHA';
  }
}

// 更新 release-please 配置文件
function updateReleaseConfig() {
  const configPath = '.github/release-please-config.json';
  const manifestPath = '.github/.release-please-manifest.json';
  
  try {
    // 读取 core 包的当前版本
    const corePackagePath = 'packages/core/package.json';
    const corePackage = JSON.parse(fs.readFileSync(corePackagePath, 'utf8'));
    const currentVersion = corePackage.version;
    
    // 更新 manifest 文件
    const manifest = {
      "packages/core": currentVersion
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    
    // 更新配置文件中的 SHA
    const currentSha = getCurrentCommitSha();
    const configContent = fs.readFileSync(configPath, 'utf8');
    const updatedConfig = configContent
      .replace('REPLACE_WITH_CURRENT_COMMIT_SHA', currentSha)
      .replace('REPLACE_WITH_LAST_RELEASE_SHA', currentSha);
    
    fs.writeFileSync(configPath, updatedConfig);
    
    console.log('✅ 更新 release-please 配置:');
    console.log(`   - 当前版本: ${currentVersion}`);
    console.log(`   - 当前 SHA: ${currentSha}`);
    
  } catch (error) {
    console.error('❌ 更新 release-please 配置失败:', error.message);
  }
}

// 检查必需的文件
function checkRequiredFiles() {
  const requiredFiles = [
    '.github/workflows/ci.yml',
    '.github/workflows/publish.yml',
    '.github/workflows/release-please.yml',
    '.github/workflows/deploy.yml',
    '.github/release-please-config.json',
    '.github/.release-please-manifest.json'
  ];
  
  console.log('📋 检查必需文件:');
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (缺失)`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// 显示下一步操作
function showNextSteps() {
  console.log('\n🎯 下一步操作:');
  console.log('');
  console.log('1. 在 GitHub 仓库设置中添加 Secrets:');
  console.log('   - NPM_TOKEN: 你的 NPM 发布令牌');
  console.log('   - VERCEL_TOKEN: Vercel 令牌 (可选)');
  console.log('   - VERCEL_ORG_ID: Vercel 组织 ID (可选)');
  console.log('   - VERCEL_PROJECT_ID: Vercel 项目 ID (可选)');
  console.log('');
  console.log('2. 提交并推送代码:');
  console.log('   git add .');
  console.log('   git commit -m "feat: setup GitHub Actions workflows"');
  console.log('   git push origin main');
  console.log('');
  console.log('3. 使用 Conventional Commits 格式提交代码:');
  console.log('   feat: 新功能');
  console.log('   fix: 修复问题');
  console.log('   docs: 文档更新');
  console.log('   chore: 维护工作');
  console.log('');
  console.log('4. 发布新版本:');
  console.log('   - 自动: Release Please 会根据提交自动创建 PR');
  console.log('   - 手动: 在 GitHub Actions 页面触发 "Publish" 工作流');
  console.log('   - 本地: 运行 pnpm release:patch/minor/major');
  console.log('');
  console.log('📚 详细文档: .github/README.md');
}

// 主函数
function main() {
  // 检查是否在项目根目录
  if (!fs.existsSync('package.json') || !fs.existsSync('packages/core/package.json')) {
    console.error('❌ 请在项目根目录运行此脚本');
    process.exit(1);
  }
  
  // 检查文件
  const filesExist = checkRequiredFiles();
  
  if (!filesExist) {
    console.error('\n❌ 缺少必需的文件，请确保所有 GitHub Actions 配置文件都已创建');
    process.exit(1);
  }
  
  // 更新配置
  updateReleaseConfig();
  
  // 显示下一步
  showNextSteps();
  
  console.log('\n🎉 GitHub Actions 配置完成！');
}

main(); 