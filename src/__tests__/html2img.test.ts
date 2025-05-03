import { html2img, Html2ImgError } from '../index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 辅助函数：保存图片到测试目录
async function saveTestImage(buffer: Buffer, testName: string) {
  const testDir = path.join(__dirname, 'test-outputs');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  const filename = `${testName.replace(/\s+/g, '-')}.png`;
  const filepath = path.join(testDir, filename);
  await fs.promises.writeFile(filepath, buffer);
  console.log(`测试图片已保存到: ${filepath}`);
}

describe('html2img', () => {
  // 测试基本的 HTML 字符串转换
  it('应该能够将简单的 HTML 转换为图片', async () => {
    const html = `
      <div style="
        width: 100px; 
        height: 100px; 
        background-color: #ff0000; 
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      "></div>
    `;
    const buffer = await html2img(html);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    await saveTestImage(buffer, 'basic-red-square');
  });

  // 测试包含样式的 HTML 转换
  it('应该能够正确处理带有样式的 HTML', async () => {
    const html = `
      <div style="
        height: 200px;
        background-color: #0000ff;
        border: 2px solid #000000;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
      ">
        <span style="
          color: #ffffff; 
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          display: block;
          position: relative;
          z-index: 1;
        ">测试文本 content11111111111111111</span>
      </div>
    `;
    const buffer = await html2img(html);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    await saveTestImage(buffer, 'styled-blue-box');
  });

  // 测试包含图片的 HTML 转换
  it('应该能够处理包含图片的 HTML', async () => {
    const html = `
      <div style="
        width: 300px;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img src="https://picsum.photos/200/200" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    `;
    const buffer = await html2img(html);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    await saveTestImage(buffer, 'with-external-image');
  });

  // 测试错误处理
  it('应该正确处理无效的 HTML 输入', async () => {
    const invalidHtml = '';
    await expect(html2img(invalidHtml)).rejects.toThrow(Html2ImgError);
  });

  it('should use default Chinese font when enabled', async () => {
    const html = `
      <div style="
        height: 200px;
        background-color: #f0f0f0;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 24px;">测试中文字体</span>
      </div>
    `;

    const image = await html2img(html);

    expect(image).toBeInstanceOf(Buffer);
    expect(image.length).toBeGreaterThan(0);

    await saveTestImage(image, 'with-chinese-font');
  });
});
