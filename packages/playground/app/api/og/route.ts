export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { generateImage, generateImageFromInput, jsxStringToBuffer } from 'img-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content, options = {} } = body

    let buffer: Buffer

    switch (type) {
      case 'jsx':
        buffer = await generateImage(content, options)
        break
      case 'jsx-string':
        buffer = await jsxStringToBuffer(content, options)
        break
      case 'auto':
        buffer = await generateImageFromInput(content, options)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be jsx, jsx-string, or auto' },
          { status: 400 }
        )
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error?.message || 'Unknown error' },
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
        buffer = await generateImage(processedContent, parsedOptions)
        break
      case 'jsx-string':
        buffer = await jsxStringToBuffer(processedContent, parsedOptions)
        break
      case 'auto':
        buffer = await generateImageFromInput(processedContent, parsedOptions)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be jsx, jsx-string, or auto' },
          { status: 400 }
        )
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
} 