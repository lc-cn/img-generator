import { ReactElement, ReactNode } from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import loadGoogleFont, { getTextFont } from './language';
import * as fs from 'fs';
import * as path from 'path';
import parse from 'html-react-parser';
import { parse as parseSFC } from '@vue/compiler-sfc';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import * as parser from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { loadEmoji } from './cache';

export interface ImageOptions {
  width?: number;
  height?: number;
  debug?: boolean;
  props?: Record<string, unknown>;
}

const DEFAULT_OPTIONS: Required<ImageOptions> = {
  width: 1200,
  height: 630,
  debug: false,
  props: {},
};

interface ProcessedElement {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: ReactNode | ReactNode[];
    [key: string]: any;
  };
  key?: string | number | null;
}

/**
 * 处理 React 元素中的文本和 emoji
 */
async function processText(element: ReactElement): Promise<ReactElement> {
  if (!element || typeof element !== 'object' || !('props' in element)) {
    return element;
  }

  const processedElement = element as unknown as ProcessedElement;

  // 处理子元素
  let children = processedElement.props.children;
  if (children) {
    if (Array.isArray(children)) {
      children = await Promise.all(
        children.map(child =>
          typeof child === 'object' && child !== null && 'type' in child
            ? processText(child as ReactElement)
            : child
        )
      );
      // 只在 children 是数组时调用 flat
      if (Array.isArray(children)) {
        children = children.flat();
      }
    } else if (typeof children === 'object' && children !== null && 'type' in children) {
      children = await processText(children as ReactElement);
    } else if (typeof children === 'string') {
      const fonts = getTextFont(children);
      return {
        ...processedElement,
        props: {
          ...processedElement.props,
          style: {
            ...processedElement.props.style,
            fontFamily: fonts.join(', '),
          },
          children,
        },
      } as unknown as ReactElement;
    }
  }

  return {
    ...processedElement,
    props: {
      ...processedElement.props,
      children,
    },
  } as unknown as ReactElement;
}

/**
 * 将 React 元素转换为 PNG Buffer
 */
export async function reactToBuffer(
  element: ReactElement,
  options: ImageOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };


  // 处理元素（递归时 emoji 也会自动下载）
  const processedElement = await processText(element);

  // 生成 SVG
  const svg = await satori(processedElement, {
    width: opts.width,
    height: opts.height,
    debug: opts.debug,
    embedFont:false,
    fonts:[
      {
        name:'Noto Sans SC',
        data: fs.readFileSync(path.join(__dirname, '../public/fonts/NotoSansSC-Regular.ttf')),
        weight:400,
        style:'normal'
      }
    ],
    loadAdditionalAsset: async (code: string, segment: string) => {
      if(code==='emoji'){
        return loadEmoji(segment)
      }
      return []
    },
  });

  // 转换为 PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: opts.width,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

/**
 * 将 HTML 字符串转换为 PNG Buffer
 * @param html HTML 字符串
 * @param options 图片选项
 * @returns PNG Buffer
 */
export async function htmlToBuffer(
  html: string,
  options: ImageOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 将 HTML 字符串转换为 React 元素
  const element = parse(html) as ReactElement;

  // 使用 reactToBuffer 处理
  return reactToBuffer(element, opts);
}

/**
 * 将 Vue 单文件组件转换为 React 元素
 * @param vueCode Vue 单文件组件代码
 * @param props
 * @returns React 元素
 */
async function vueToReact(vueCode: string, props?: Record<string, unknown>): Promise<ReactElement> {
  const { descriptor } = parseSFC(vueCode);
  const template = descriptor.template?.content || '';
  const script = descriptor.script?.content || '';

  // 使用 Babel 解析和转换 script 部分
  const ast = parser.parse(script, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  // 转换 ESM 语法为 CommonJS
  traverse(ast, {
    ImportDeclaration(path) {
      // 将 import 语句转换为 require
      const specifiers = path.node.specifiers.map(specifier => {
        if (t.isImportDefaultSpecifier(specifier)) {
          return t.variableDeclarator(
            specifier.local,
            t.callExpression(t.identifier('require'), [path.node.source])
          );
        } else if (t.isImportSpecifier(specifier)) {
          return t.variableDeclarator(
            specifier.local,
            t.memberExpression(
              t.callExpression(t.identifier('require'), [path.node.source]),
              specifier.imported
            )
          );
        }
        return null;
      }).filter(Boolean);

      path.replaceWith(t.variableDeclaration('const', specifiers as t.VariableDeclarator[]));
    },
    ExportDefaultDeclaration(path) {
      // 将 export default 转换为 module.exports
      if (t.isObjectExpression(path.node.declaration)) {
        path.replaceWith(
          t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier('module'), t.identifier('exports')),
              path.node.declaration
            )
          )
        );
      }
    }
  });

  // 生成转换后的代码
  const { code } = generate(ast);

  // 创建一个新的模块来执行转换后的代码
  const module = { exports: {} };
  const scriptContent = `
    ${code}
  `;

  // 执行组件代码
  new Function('module', 'exports', 'require', scriptContent)(
    module,
    module.exports,
    (name: string) => {
      if (name === 'vue') {
        return { createSSRApp, renderToString };
      }
      throw new Error(`Cannot require ${name}`);
    }
  );
  // 创建 Vue 应用
  const app = createSSRApp({
      template,
      ...module.exports
    },
    props);

  // 使用 SSR 渲染组件
  const html = await renderToString(app);

  // 将渲染结果转换为 React 元素
  const element = parse(html) as ReactElement;

  // 确保所有容器元素都有正确的 display 属性
  function ensureDisplay(element: ReactElement): ReactElement {
    if (!element || typeof element !== 'object' || !('props' in element)) {
      return element;
    }

    const props = element.props as { style?: Record<string, any>, children?: ReactNode };
    const style = props.style || {};
    const children = props.children;

    // 如果有多个子节点，确保有 display 属性
    if (Array.isArray(children) && children.length > 1 && !style.display) {
      style.display = 'flex';
    }

    // 递归处理子节点
    if (Array.isArray(children)) {
      return {
        ...element,
        props: {
          ...props,
          style,
          children: children.map(child =>
            typeof child === 'object' ? ensureDisplay(child as ReactElement) : child
          )
        }
      } as ReactElement;
    } else if (typeof children === 'object' && children !== null) {
      return {
        ...element,
        props: {
          ...props,
          style,
          children: ensureDisplay(children as ReactElement)
        }
      } as ReactElement;
    }

    return {
      ...element,
      props: {
        ...props,
        style
      }
    } as ReactElement;
  }

  return ensureDisplay({
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex'
      },
      children: element
    }
  } as ReactElement);
}

/**
 * 将 Vue 单文件组件转换为 PNG Buffer
 * @param vueCode Vue 单文件组件代码
 * @param options 图片选项
 * @returns PNG Buffer
 */
export async function vueToBuffer(
  vueCode: string,
  options: ImageOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (vueCode.endsWith('.vue') && fs.existsSync(vueCode)) {
    vueCode = fs.readFileSync(vueCode, 'utf-8');
  }
  // 将 Vue 组件转换为 React 元素
  const element = await vueToReact(vueCode, opts.props);

  // 使用 reactToBuffer 处理
  return reactToBuffer(element, opts);
}
