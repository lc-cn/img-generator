import { readdir, stat } from 'fs/promises'
import { join, extname, dirname } from 'path'
import { jsxToBuffer, htmlToBuffer, ImageOptions } from './core'

export interface FolderRenderOptions extends ImageOptions {
  entryFile?: string
  recursive?: boolean
  fileExtensions?: string[]
}

const DEFAULT_FOLDER_OPTIONS: Required<Omit<FolderRenderOptions, 'entryFile' | 'fonts'>> = {
  width: 1200,
  height: 630,
  debug: false,
  recursive: true,
  fileExtensions: ['.tsx', '.ts', '.jsx', '.js', '.html'],
}

/**
 * 查找入口文件
 */
async function findEntryFile(folderPath: string, options: FolderRenderOptions): Promise<string | null> {
  const { entryFile, fileExtensions = DEFAULT_FOLDER_OPTIONS.fileExtensions } = options
  
  // 如果指定了入口文件，直接返回
  if (entryFile) {
    const fullPath = join(folderPath, entryFile)
    try {
      await stat(fullPath)
      return fullPath
    } catch {
      return null
    }
  }
  
  // 查找默认入口文件
  const defaultEntries = ['index.tsx', 'index.ts', 'index.jsx', 'index.js', 'index.html', 'page.tsx', 'page.ts']
  
  for (const entry of defaultEntries) {
    const fullPath = join(folderPath, entry)
    try {
      await stat(fullPath)
      return fullPath
    } catch {}
  }
  
  // 查找第一个匹配的文件
  try {
    const files = await readdir(folderPath)
    for (const file of files) {
      const ext = extname(file)
      if (fileExtensions.includes(ext)) {
        return join(folderPath, file)
      }
    }
  } catch {
    return null
  }
  
  return null
}

/**
 * 动态导入文件
 */
async function importFile(filePath: string): Promise<any> {
  if (extname(filePath) === '.html') {
    throw new Error('importFile 不支持 .html 文件')
  }
  try {
    const module = await import(filePath)
    return module.default || module
  } catch (error) {
    console.error(`Failed to import file ${filePath}:`, error)
    throw error
  }
}

/**
 * 渲染文件夹中的组件或 HTML
 * folderPath 可以是文件夹或文件
 */
export async function renderFolder(
  folderPath: string,
  options: FolderRenderOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_FOLDER_OPTIONS, ...options }
  let entryFile = folderPath
  let fileStat: any
  try {
    fileStat = await stat(folderPath)
  } catch {
    throw new Error(`Path not found: ${folderPath}`)
  }
  if (fileStat.isDirectory()) {
    const found = await findEntryFile(folderPath, opts)
    if (!found) {
      throw new Error(`No entry file found in folder: ${folderPath}`)
    }
    entryFile = found
  }
  const ext = extname(entryFile)
  if (ext === '.html') {
    // 只读内容，不 import
    console.log('[renderFolder] 以 HTML 渲染:', entryFile)
    const html = await (await import('fs/promises')).readFile(entryFile, 'utf8')
    // 自动设置 baseDir 为 HTML 文件所在目录
    const baseDir = dirname(entryFile)
    return htmlToBuffer(html, opts, baseDir)
  } else {
    // 只 import 非 html
    console.log('[renderFolder] 以 React 组件渲染:', entryFile)
    const Component = await importFile(entryFile)
    if (typeof Component !== 'function') {
      throw new Error(`Invalid component in file: ${entryFile}`)
    }
    const element = Component()
    // 传递 baseDir 为 JSX 文件所在目录
    return jsxToBuffer(element, opts, dirname(entryFile))
  }
}

/**
 * 批量渲染文件夹中的所有组件
 */
export async function renderFolderBatch(
  folderPath: string,
  options: FolderRenderOptions = {}
): Promise<Map<string, Buffer>> {
  const opts = { ...DEFAULT_FOLDER_OPTIONS, ...options }
  const results = new Map<string, Buffer>()
  
  try {
    const files = await readdir(folderPath)
    
    for (const file of files) {
      const filePath = join(folderPath, file)
      const fileStat = await stat(filePath)
      
      if (fileStat.isDirectory() && opts.recursive) {
        // 递归处理子文件夹
        const subResults = await renderFolderBatch(filePath, opts)
        for (const [key, value] of subResults) {
          results.set(`${file}/${key}`, value)
        }
      } else if (fileStat.isFile()) {
        const ext = extname(file)
        if (opts.fileExtensions.includes(ext)) {
          try {
            if (ext === '.html') {
              const html = await (await import('fs/promises')).readFile(filePath, 'utf8')
              // 自动设置 baseDir 为 HTML 文件所在目录
              const baseDir = dirname(filePath)
              const buffer = await htmlToBuffer(html, opts, baseDir)
              results.set(file, buffer)
            } else {
              const buffer = await renderFolder(filePath, opts)
              results.set(file, buffer)
            }
          } catch (error) {
            console.warn(`Failed to render file ${file}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error(`Failed to read folder ${folderPath}:`, error)
  }
  
  return results
}

/**
 * 创建文件夹渲染的 API 路由
 */
export function createFolderRenderer(folderPath: string, options: FolderRenderOptions = {}) {
  return async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url)
      const file = searchParams.get('file')
      
      let targetPath = folderPath
      if (file) {
        targetPath = join(folderPath, file)
      }
      
      const buffer = await renderFolder(targetPath, options)
      
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch (error) {
      console.error('Folder render error:', error)
      return new Response('Failed to render folder', { status: 500 })
    }
  }
} 