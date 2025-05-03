import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { Html2ImgError } from '../types';

/**
 * 从URL或本地文件获取资源
 */
export async function fetchResource(src: string): Promise<Buffer> {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return new Promise((resolve, reject) => {
      const client = src.startsWith('https://') ? https : http;
      client
        .get(src, (res) => {
          if (res.statusCode !== 200) {
            reject(
              new Html2ImgError(`获取远程资源失败: ${src}`, {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
              })
            );
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', (error) =>
            reject(new Html2ImgError(`获取远程资源时出错: ${src}`, error))
          );
        })
        .on('error', (error) =>
          reject(new Html2ImgError(`连接远程资源失败: ${src}`, error))
        );
    });
  } else {
    try {
      return fs.readFileSync(src);
    } catch (error) {
      throw new Html2ImgError(`读取本地文件失败: ${src}`, error);
    }
  }
}

/**
 * 解析资源路径
 */
export async function resolveResourcePath(
  src: string,
  baseUrl?: string
): Promise<string> {
  try {
    // 处理 data URL
    if (src.startsWith('data:')) {
      return src;
    }

    // 处理绝对 URL
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }

    // 处理相对路径
    if (baseUrl) {
      // 如果 baseUrl 是 URL
      if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
        const url = new URL(src, baseUrl);
        return url.href;
      }

      // 如果 baseUrl 是文件路径
      const absolutePath = path.resolve(
        baseUrl,
        src.startsWith('/') ? src.slice(1) : src
      );
      return absolutePath;
    }

    // 如果没有 baseUrl，尝试使用当前目录
    const currentDir = process.cwd();
    return path.resolve(currentDir, src);
  } catch (error) {
    throw new Html2ImgError('资源路径解析失败', error);
  }
}

/**
 * 将资源转换为 data URL
 */
export async function resourceToDataUrl(src: string): Promise<string> {
  try {
    // 如果已经是 data URL，直接返回
    if (src.startsWith('data:')) {
      return src;
    }

    // 处理远程资源
    if (src.startsWith('http://') || src.startsWith('https://')) {
      try {
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType =
          response.headers.get('content-type') || 'application/octet-stream';
        return `data:${mimeType};base64,${base64}`;
      } catch (error) {
        // 如果远程资源加载失败，返回占位图片
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
      }
    }

    // 处理本地资源
    try {
      const buffer = fs.readFileSync(src);
      const base64 = buffer.toString('base64');
      const ext = path.extname(src).toLowerCase();
      const mimeType = getMimeType(ext);
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      // 如果本地资源加载失败，返回占位图片
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
    }
  } catch (error) {
    throw new Html2ImgError('资源转换失败', error);
  }
}

/**
 * 获取 MIME 类型
 */
function getMimeType(ext: string): string {
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * 获取图片尺寸
 */
export function getImageDimensions(filePath: string): {
  width: number;
  height: number;
} {
  // 默认尺寸改为更合理的值
  const defaultDimensions = { width: 300, height: 300 };

  try {
    // 如果是远程URL，返回默认尺寸
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return defaultDimensions;
    }

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return defaultDimensions;
    }

    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();

    // 如果不是图片文件，返回默认尺寸
    if (!['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
      return defaultDimensions;
    }

    // 读取文件内容
    const content = fs.readFileSync(filePath);

    // 如果是 PNG 文件
    if (ext === '.png') {
      const width = content.readUInt32BE(16);
      const height = content.readUInt32BE(20);
      return { width, height };
    }

    // 如果是 JPEG 文件
    if (ext === '.jpg' || ext === '.jpeg') {
      let offset = 2;
      while (offset < content.length) {
        const marker = content.readUInt16BE(offset);
        if (marker === 0xffc0 || marker === 0xffc2) {
          const height = content.readUInt16BE(offset + 5);
          const width = content.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += content.readUInt16BE(offset + 2) + 2;
      }
    }

    // 如果是 SVG 文件
    if (ext === '.svg') {
      const svgContent = content.toString('utf-8');
      const widthMatch = svgContent.match(/width="([^"]+)"/);
      const heightMatch = svgContent.match(/height="([^"]+)"/);
      if (widthMatch && heightMatch) {
        const width = parseInt(widthMatch[1]);
        const height = parseInt(heightMatch[1]);
        if (!isNaN(width) && !isNaN(height)) {
          return { width, height };
        }
      }
    }

    // 如果无法获取尺寸，返回默认值
    return defaultDimensions;
  } catch (error) {
    // 发生错误时也返回默认尺寸
    return defaultDimensions;
  }
}
