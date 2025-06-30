'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { 
  CodeBracketIcon, 
  EyeIcon, 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline'
// 使用客户端专用的JSX解析器
import { parseJSX, objectToJSX } from 'img-generator/client'

// 动态导入Monaco编辑器避免SSR问题
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
})

// 预定义的JSX模板
const jsxTemplates = {
  basic: {
    name: '基础模板',
    jsx: `<div style={{
  width: "1200px",
  height: "630px",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontFamily: "Arial, sans-serif",
  padding: "40px"
}}>
  <h1 style={{
    fontSize: "48px",
    fontWeight: "bold",
    margin: "0 0 20px 0",
    textAlign: "center"
  }}>
    图片生成器
  </h1>
  <p style={{
    fontSize: "24px",
    margin: "0",
    opacity: "0.9",
    textAlign: "center"
  }}>
    强大的JSX到图片转换工具
  </p>
</div>`,
    content: {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '40px'
        }
      },
      children: [
        {
          type: 'h1',
          props: {
            style: {
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 0 20px 0',
              textAlign: 'center'
            }
          },
          children: '图片生成器'
        },
        {
          type: 'p',
          props: {
            style: {
              fontSize: '24px',
              margin: '0',
              opacity: '0.9',
              textAlign: 'center'
            }
          },
          children: '强大的JSX到图片转换工具'
        }
      ]
    }
  },
  card: {
    name: '卡片模板',
    jsx: `<div style={{
  width: "1200px",
  height: "630px",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px"
}}>
  <div style={{
    background: "#f8fafc",
    border: "2px solid #e2e8f0",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    maxWidth: "800px"
  }}>
    <h1 style={{
      fontSize: "48px",
      fontWeight: "bold",
      color: "#1e293b",
      margin: "0 0 16px 0"
    }}>
      欢迎使用
    </h1>
    <p style={{
      fontSize: "24px",
      color: "#64748b",
      margin: "0"
    }}>
      这是一个精美的卡片设计
    </p>
  </div>
</div>`,
    content: {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }
      },
      children: {
        type: 'div',
        props: {
          style: {
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            maxWidth: '800px'
          }
        },
        children: [
          {
            type: 'h1',
            props: {
              style: {
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: '0 0 16px 0'
              }
            },
            children: '欢迎使用'
          },
          {
            type: 'p',
            props: {
              style: {
                fontSize: '24px',
                color: '#64748b',
                margin: '0'
              }
            },
            children: '这是一个精美的卡片设计'
          }
        ]
      }
    }
  },
  gradient: {
    name: '渐变模板',
    jsx: `<div style={{
  width: "1200px",
  height: "630px",
  background: "linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)",
  backgroundSize: "400% 400%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontFamily: "Arial, sans-serif"
}}>
  <div style={{
    textAlign: "center"
  }}>
    <h1 style={{
      fontSize: "64px",
      fontWeight: "bold",
      margin: "0 0 20px 0",
      textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
    }}>
      🌈 多彩世界
    </h1>
    <p style={{
      fontSize: "28px",
      margin: "0",
      opacity: "0.9"
    }}>
      创造属于你的精彩
    </p>
  </div>
</div>`,
    content: {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
          backgroundSize: '400% 400%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }
      },
      children: {
        type: 'div',
        props: {
          style: {
            textAlign: 'center'
          }
        },
        children: [
          {
            type: 'h1',
            props: {
              style: {
                fontSize: '64px',
                fontWeight: 'bold',
                margin: '0 0 20px 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }
            },
            children: '🌈 多彩世界'
          },
          {
            type: 'p',
            props: {
              style: {
                fontSize: '28px',
                margin: '0',
                opacity: '0.9'
              }
            },
            children: '创造属于你的精彩'
          }
        ]
      }
    }
  }
}

export default function Playground() {
  const [activeTab, setActiveTab] = useState<'editor' | 'api'>('editor')
  const [selectedTemplate, setSelectedTemplate] = useState('basic')
  const [inputMode, setInputMode] = useState<'jsx' | 'json'>('jsx')
  const [jsxContent, setJsxContent] = useState(jsxTemplates.basic.jsx)
  const [jsonContent, setJsonContent] = useState(JSON.stringify(jsxTemplates.basic.content, null, 2))
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 添加编辑器实例引用
  const editorRef = useRef<any>(null)

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    const template = jsxTemplates[templateKey as keyof typeof jsxTemplates]
    setJsxContent(template.jsx)
    setJsonContent(JSON.stringify(template.content, null, 2))
  }

  // JSX代码格式化函数
  const formatJSXCode = (jsxCode: string): string => {
    try {
      // 基本的JSX格式化逻辑
      let formatted = jsxCode
      
      // 移除多余的空白行
      formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')
      
      // 标准化缩进
      const lines = formatted.split('\n')
      let indentLevel = 0
      const indentSize = 2
      
      const formattedLines = lines.map((line) => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return ''
        
        // 检查是否是结束标签
        if (trimmedLine.startsWith('</') || trimmedLine.includes('</')) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        
        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine
        
        // 检查是否是开始标签（不是自闭合标签）
        if (trimmedLine.startsWith('<') && 
            !trimmedLine.includes('</') && 
            !trimmedLine.endsWith('/>') &&
            !trimmedLine.match(/<\w+[^>]*\/>/)) {
          indentLevel++
        }
        
        return indentedLine
      })
      
      return formattedLines.join('\n')
    } catch (error) {
      // 如果格式化失败，返回原始代码
      return jsxCode
    }
  }

  const handleModeSwitch = useCallback(() => {
    try {
      if (inputMode === 'jsx') {
        // JSX转JSON
        const parsed = parseJSX(jsxContent)
        setJsonContent(JSON.stringify(parsed, null, 2))
        setInputMode('json')
      } else {
        // JSON转JSX
        const parsed = JSON.parse(jsonContent)
        const jsx = objectToJSX(parsed)
        // 格式化JSX代码
        const formattedJsx = formatJSXCode(jsx)
        setJsxContent(formattedJsx)
        setInputMode('jsx')
        
        // 延迟触发Monaco编辑器的格式化
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument')?.run()
          }
        }, 200)
      }
      setError(null)
    } catch (err) {
      setError(`转换失败: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }, [inputMode, jsxContent, jsonContent])

  const generateImage = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      let jsxObject
      
      if (inputMode === 'jsx') {
        jsxObject = parseJSX(jsxContent)
      } else {
        jsxObject = JSON.parse(jsonContent)
      }
      
      const response = await fetch('/api/og', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'jsx',
          content: jsxObject,
          options: {
            width: 1200,
            height: 630
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setGeneratedImage(imageUrl)
      } else {
        const errorData = await response.json()
        setError(`生成失败: ${errorData.error}`)
      }
    } catch (error) {
      setError(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = `generated-image-${Date.now()}.png`
      link.click()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  // 安全地生成cURL示例，避免在服务器端渲染时解析JSX
  const getCurlExample = () => {
    try {
      const content = inputMode === 'jsx' ? JSON.stringify(parseJSX(jsxContent), null, 4) : jsonContent
      return `curl -X POST http://localhost:3001/api/og \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "jsx",
    "content": ${content.replace(/\n/g, '\n    ')}
  }'`
    } catch (error) {
      return `curl -X POST http://localhost:3001/api/og \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "jsx",
    "content": {}
  }'`
    }
  }
  
  const curlExample = getCurlExample()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <CodeBracketIcon className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">图片生成器 Playground</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeIcon className="h-5 w-5 inline mr-2" />
                在线体验
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'api'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                API 文档
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'editor' ? (
          <div className="flex gap-6">
            {/* 左侧编辑器 - 占2/3宽度 */}
            <div className="flex-1 w-2/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">代码编辑器</h2>
                  <div className="flex items-center space-x-4">
                    {/* 模式切换 */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleModeSwitch}
                        className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="切换输入模式"
                      >
                        <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                        {inputMode === 'jsx' ? 'JSX' : 'JSON'}
                      </button>
                    </div>
                    {/* 模板选择 */}
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {Object.entries(jsxTemplates).map(([key, template]) => (
                        <option key={key} value={key}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="600px"
                    language={inputMode === 'jsx' ? 'typescript' : 'json'}
                    theme="vs-dark"
                    value={inputMode === 'jsx' ? jsxContent : jsonContent}
                    onChange={(value) => {
                      if (inputMode === 'jsx') {
                        setJsxContent(value || '')
                      } else {
                        setJsonContent(value || '')
                      }
                    }}
                    onMount={(editor, monaco) => {
                      // 存储编辑器实例
                      editorRef.current = editor
                      
                      // 添加格式化快捷键 Ctrl+Shift+F
                      editor.addAction({
                        id: 'format-document',
                        label: 'Format Document',
                        keybindings: [
                          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF
                        ],
                        run: () => {
                          editor.getAction('editor.action.formatDocument')?.run()
                        }
                      })
                    }}
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      folding: true,
                      matchBrackets: 'always',
                      autoIndent: 'full',
                      formatOnPaste: true,
                      formatOnType: true,
                      suggest: {
                        showKeywords: true,
                        showSnippets: true,
                        showFunctions: true,
                        showConstants: true,
                        showVariables: true
                      },
                      quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: true
                      }
                    }}
                    beforeMount={(monaco) => {
                      // 配置TypeScript编译选项，支持JSX
                      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                        target: monaco.languages.typescript.ScriptTarget.Latest,
                        allowNonTsExtensions: true,
                        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                        module: monaco.languages.typescript.ModuleKind.CommonJS,
                        noEmit: true,
                        esModuleInterop: true,
                        jsx: monaco.languages.typescript.JsxEmit.React,
                        reactNamespace: 'React',
                        allowJs: true,
                        typeRoots: ['node_modules/@types']
                      });

                      // 添加React类型定义
                      monaco.languages.typescript.typescriptDefaults.addExtraLib(
                        `
                        declare namespace React {
                          interface CSSProperties {
                            [key: string]: any;
                            display?: string;
                            flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
                            alignItems?: string;
                            justifyContent?: string;
                            width?: string | number;
                            height?: string | number;
                            padding?: string | number;
                            margin?: string | number;
                            backgroundColor?: string;
                            background?: string;
                            color?: string;
                            fontSize?: string | number;
                            fontWeight?: string | number;
                            fontFamily?: string;
                            textAlign?: 'left' | 'center' | 'right' | 'justify';
                            borderRadius?: string | number;
                            border?: string;
                            boxShadow?: string;
                            opacity?: number;
                            transform?: string;
                            position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
                            top?: string | number;
                            right?: string | number;
                            bottom?: string | number;
                            left?: string | number;
                            zIndex?: number;
                            overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
                            textShadow?: string;
                            lineHeight?: string | number;
                            gap?: string | number;
                          }
                          
                          interface HTMLAttributes<T> {
                            style?: CSSProperties;
                            className?: string;
                            children?: ReactNode;
                          }
                          
                          type ReactNode = string | number | ReactElement | ReactNode[];
                          
                          interface ReactElement {
                            type: string;
                            props: any;
                            key?: string | number;
                          }
                          
                          function createElement<P>(
                            type: string,
                            props?: P,
                            ...children: ReactNode[]
                          ): ReactElement;
                        }
                        
                        declare global {
                          namespace JSX {
                            interface IntrinsicElements {
                              div: React.HTMLAttributes<HTMLDivElement>;
                              span: React.HTMLAttributes<HTMLSpanElement>;
                              p: React.HTMLAttributes<HTMLParagraphElement>;
                              h1: React.HTMLAttributes<HTMLHeadingElement>;
                              h2: React.HTMLAttributes<HTMLHeadingElement>;
                              h3: React.HTMLAttributes<HTMLHeadingElement>;
                              h4: React.HTMLAttributes<HTMLHeadingElement>;
                              h5: React.HTMLAttributes<HTMLHeadingElement>;
                              h6: React.HTMLAttributes<HTMLHeadingElement>;
                              img: React.HTMLAttributes<HTMLImageElement>;
                              a: React.HTMLAttributes<HTMLAnchorElement>;
                              button: React.HTMLAttributes<HTMLButtonElement>;
                              input: React.HTMLAttributes<HTMLInputElement>;
                              textarea: React.HTMLAttributes<HTMLTextAreaElement>;
                              select: React.HTMLAttributes<HTMLSelectElement>;
                              option: React.HTMLAttributes<HTMLOptionElement>;
                              ul: React.HTMLAttributes<HTMLUListElement>;
                              ol: React.HTMLAttributes<HTMLOListElement>;
                              li: React.HTMLAttributes<HTMLLIElement>;
                              table: React.HTMLAttributes<HTMLTableElement>;
                              thead: React.HTMLAttributes<HTMLTableSectionElement>;
                              tbody: React.HTMLAttributes<HTMLTableSectionElement>;
                              tr: React.HTMLAttributes<HTMLTableRowElement>;
                              td: React.HTMLAttributes<HTMLTableCellElement>;
                              th: React.HTMLAttributes<HTMLTableCellElement>;
                            }
                          }
                        }
                        `,
                        'react.d.ts'
                      );

                      // 为JSON模式配置更好的格式化
                      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                        validate: true,
                        allowComments: false,
                        schemas: [{
                          uri: 'http://json-schema.org/jsx-object',
                          fileMatch: ['*'],
                          schema: {
                            type: 'object',
                            properties: {
                              type: { type: 'string' },
                              props: {
                                type: 'object',
                                properties: {
                                  style: { type: 'object' },
                                  children: {
                                    oneOf: [
                                      { type: 'string' },
                                      { type: 'number' },
                                      { type: 'object' },
                                      { type: 'array' }
                                    ]
                                  }
                                }
                              }
                            }
                          }
                        }]
                      });
                    }}
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={generateImage}
                    disabled={isLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? '生成中...' : '生成图片'}
                  </button>
                </div>
              </div>
                </div>

            {/* 右侧预览 - 占1/3宽度 */}
            <div className="w-1/3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">预览</h2>
                  {generatedImage && (
                <button
                      onClick={downloadImage}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      下载
                </button>
                  )}
            </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-96 flex items-center justify-center">
                  {generatedImage ? (
                      <img
                        src={generatedImage}
                        alt="Generated"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-gray-500">
                      <EyeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">点击"生成图片"查看预览</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* API 文档页面保持不变 */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">API 文档</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">基本信息</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">端点:</span> <code className="bg-white px-2 py-1 rounded text-sm">POST /api/og</code>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Content-Type:</span> <code className="bg-white px-2 py-1 rounded text-sm">application/json</code>
                    </p>
                  </div>
                  </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">请求示例</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                      <code>{curlExample}</code>
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(curlExample)}
                    className="mt-2 flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    )}
                    {copied ? '已复制' : '复制命令'}
                  </button>
                  </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">支持的类型</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">JSX 对象</h4>
                      <p className="text-sm text-gray-600 mb-2">将 JSX 对象转换为图片</p>
                      <code className="text-xs bg-white px-2 py-1 rounded">type: "jsx"</code>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">HTML 字符串</h4>
                      <p className="text-sm text-gray-600 mb-2">将 HTML 转换为图片</p>
                      <code className="text-xs bg-white px-2 py-1 rounded">type: "html"</code>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">组件渲染</h4>
                      <p className="text-sm text-gray-600 mb-2">渲染预定义组件</p>
                      <code className="text-xs bg-white px-2 py-1 rounded">type: "component"</code>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">文件夹渲染</h4>
                      <p className="text-sm text-gray-600 mb-2">渲染文件夹结构</p>
                      <code className="text-xs bg-white px-2 py-1 rounded">type: "folder"</code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">响应格式</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">成功:</span> 返回 PNG 图片数据 (Content-Type: image/png)
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">失败:</span> 返回 JSON 错误信息
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 