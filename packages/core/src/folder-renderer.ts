import { readdir, stat } from 'fs/promises'
import { join, extname, dirname } from 'path'
import { jsxToBuffer, type GenerateOptions } from './core.js'
import type { FolderRenderOptions } from './types.js'

const DEFAULT_FOLDER_OPTIONS: Required<Omit<FolderRenderOptions, 'inputDir' | 'outputDir' | 'baseDir'>> = {
  width: 1200,
  height: 630,
  format: 'png',
  quality: 90,
  recursive: true,
  filePattern: '**/*.{tsx,ts,jsx,js}',
}

/**
 * 查找入口文件
 */
async function findEntryFile(folderPath: string): Promise<string | null> {
  // 查找默认入口文件
  const defaultEntries = ['index.tsx', 'index.ts', 'index.jsx', 'index.js', 'page.tsx', 'page.ts']
  
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
    const extensions = ['.tsx', '.ts', '.jsx', '.js']
    for (const file of files) {
      const ext = extname(file)
      if (extensions.includes(ext)) {
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
  try {
    const module = await import(filePath)
    return module.default || module
  } catch (error) {
    console.error(`Failed to import file ${filePath}:`, error)
    throw error
  }
}

/**
 * 渲染文件夹中的组件
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
    const found = await findEntryFile(folderPath)
    if (!found) {
      throw new Error(`No entry file found in folder: ${folderPath}`)
    }
    entryFile = found
  }
  
  console.log('[renderFolder] 渲染组件:', entryFile)
  const Component = await importFile(entryFile)
  if (typeof Component !== 'function') {
    throw new Error(`Invalid component in file: ${entryFile}`)
  }
  const element = Component()
  return jsxToBuffer(element, opts as GenerateOptions)
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
        if (opts.filePattern.includes(ext)) {
          try {
            const buffer = await renderFolder(filePath, opts)
            results.set(file, buffer)
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