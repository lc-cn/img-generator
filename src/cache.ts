import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';

const CACHE_DIR = path.join(process.cwd(), '.cache');

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * 生成资源的缓存键
 */
function generateCacheKey(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

export async function loadEmoji(emoji: string): Promise<string> {
  const codePoint = emoji.codePointAt(0)?.toString(16);
  if (!codePoint) return '';
  const url=`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`
  return loadAsset(url).then((buffer) => {
    return `data:image/svg+xml;base64,${buffer.toString('base64')}`
  })
}

/**
 * 获取缓存文件路径
 */
function getCachePath(url: string): string {
  const key = generateCacheKey(url);
  return path.join(CACHE_DIR, key);
}

/**
 * 从缓存中读取资源
 */
function readFromCache(url: string): Buffer | null {
  const cachePath = getCachePath(url);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath);
  }
  return null;
}

/**
 * 写入缓存
 */
function writeToCache(url: string, data: Buffer): void {
  const cachePath = getCachePath(url);
  fs.writeFileSync(cachePath, data);
}

/**
 * 下载资源
 */
function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        writeToCache(url, buffer);
        resolve(buffer);
      });
      res.on('error', reject);
    });
  });
}

/**
 * 加载资源（优先使用缓存）
 */
export async function loadAsset(url: string): Promise<Buffer> {
  // 检查缓存
  const cached = readFromCache(url);
  if (cached) {
    return cached;
  }

  // 下载并缓存
  return download(url);
}
