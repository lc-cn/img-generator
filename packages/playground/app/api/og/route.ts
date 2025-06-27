import { NextRequest, NextResponse } from 'next/server'
import { jsxToBuffer, jsxStringToBuffer, htmlToBuffer, renderComponent, renderFolder } from 'img-generator'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content, options = {} } = body

    let buffer: Buffer

    switch (type) {
      case 'jsx':
        // 支持对象和字符串两种格式
        buffer = await jsxToBuffer(content, options)
        break
      case 'jsx-string':
        // 专门处理JSX字符串
        buffer = await jsxStringToBuffer(content, options)
        break
      case 'html':
        buffer = await htmlToBuffer(content, options)
        break
      case 'component':
        const { componentName, props = {} } = content
        buffer = await renderComponent(componentName, {props, ...options})
        break
      case 'folder':
        buffer = await renderFolder(content, options)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be jsx, jsx-string, html, component, or folder' },
          { status: 400 }
        )
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const content = searchParams.get('content')
  const contentBase64 = searchParams.get('contentBase64')
  const options = searchParams.get('options')

  if (!type || (!content && !contentBase64)) {
    return NextResponse.json(
      { error: 'Missing required parameters: type and content (or contentBase64)' },
      { status: 400 }
    )
  }

  try {
    let buffer: Buffer
    const parsedOptions = options ? JSON.parse(options) : {}
    
    // 处理内容：优先使用base64编码的内容
    let processedContent: any
    if (contentBase64) {
      try {
        const decodedContent = Buffer.from(contentBase64, 'base64').toString('utf-8')
        processedContent = JSON.parse(decodedContent)
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid base64 content' },
          { status: 400 }
        )
      }
    } else if (content) {
      try {
        processedContent = JSON.parse(content)
      } catch (e) {
        // 如果不是JSON，直接使用原始内容
        processedContent = content
      }
    }

    switch (type) {
      case 'jsx':
        console.log('jsx', { content: processedContent }, parsedOptions)
        // 支持对象和字符串两种格式
        buffer = await jsxToBuffer(processedContent, parsedOptions)
        break
      case 'jsx-string':
        console.log('jsx-string', { content: processedContent }, parsedOptions)
        // 专门处理JSX字符串
        buffer = await jsxStringToBuffer(processedContent, parsedOptions)
        break
      case 'html':
        buffer = await htmlToBuffer(processedContent, parsedOptions)
        break
      case 'component':
        const { componentName, props = {} } = processedContent
        buffer = await renderComponent(componentName, {props, ...parsedOptions})
        break
      case 'folder':
        buffer = await renderFolder(processedContent, parsedOptions)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be jsx, jsx-string, html, component, or folder' },
          { status: 400 }
        )
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
} 