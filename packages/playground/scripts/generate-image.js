#!/usr/bin/env node

import { generateImage, generateImageFromInput, jsxStringToBuffer } from 'img-generator';
import { readFile, writeFile } from 'fs/promises';

async function main() {
  try {
    // 获取命令行参数
    const [inputFile, outputFile] = process.argv.slice(2);
    
    if (!inputFile || !outputFile) {
      console.error('Usage: node generate-image.js <input-file> <output-file>');
      process.exit(1);
    }

    // 读取输入数据
    const inputData = JSON.parse(await readFile(inputFile, 'utf8'));
    const { type, content, options = {} } = inputData;

    let buffer;

    switch (type) {
      case 'jsx':
        buffer = await generateImage(content, options);
        break;
      case 'jsx-string':
        buffer = await jsxStringToBuffer(content, options);
        break;
      case 'auto':
        buffer = await generateImageFromInput(content, options);
        break;
      default:
        throw new Error(`Invalid type: ${type}`);
    }

    // 写入输出文件
    await writeFile(outputFile, buffer);
    
    console.log('Image generated successfully');
  } catch (error) {
    console.error('Error generating image:', error.message);
    process.exit(1);
  }
}

main(); 