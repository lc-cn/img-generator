import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '图片生成器 Playground',
  description: '在线体验平台，支持JSX、HTML和组件渲染的图片生成工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
} 