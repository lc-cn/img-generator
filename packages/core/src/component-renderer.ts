import { ReactElement, createElement, ComponentType, ReactNode } from 'react'
import { jsxToBuffer, ImageOptions } from './core'

/**
 * 组件渲染选项
 */
export interface ComponentRenderOptions extends ImageOptions {
  props?: Record<string, any>
  children?: ReactNode
  cssStyles?: Record<string, any>
}

/**
 * 组件渲染器类
 */
export class ComponentRenderer {
  private components: Map<string, ComponentType<any>> = new Map()

  /**
   * 注册组件
   */
  register(name: string, component: ComponentType<any>): void {
    this.components.set(name, component)
  }

  /**
   * 注册多个组件
   */
  registerMultiple(components: Record<string, ComponentType<any>>): void {
    Object.entries(components).forEach(([name, component]) => {
      this.register(name, component)
    })
  }

  /**
   * 渲染已注册的组件
   */
  async renderComponent(
    componentName: string,
    options: ComponentRenderOptions = {}
  ): Promise<Buffer> {
    const component = this.components.get(componentName)
    if (!component) {
      throw new Error(`Component "${componentName}" not found. Available components: ${Array.from(this.components.keys()).join(', ')}`)
    }

    const { props = {}, children, cssStyles, ...imageOptions } = options
    const element = createElement(component, props, children)
    return jsxToBuffer(element, imageOptions, undefined, cssStyles)
  }

  /**
   * 渲染自定义 React 元素
   */
  async renderElement(
    element: ReactElement,
    options: ImageOptions & { cssStyles?: Record<string, any> } = {}
  ): Promise<Buffer> {
    const { cssStyles, ...imageOptions } = options
    return jsxToBuffer(element, imageOptions, undefined, cssStyles)
  }

  /**
   * 渲染函数组件
   */
  async renderFunction(
    component: ComponentType<any>,
    options: ComponentRenderOptions = {}
  ): Promise<Buffer> {
    const { props = {}, children, cssStyles, ...imageOptions } = options
    const element = createElement(component, props, children)
    return jsxToBuffer(element, imageOptions, undefined, cssStyles)
  }

  /**
   * 获取已注册的组件列表
   */
  getRegisteredComponents(): string[] {
    return Array.from(this.components.keys())
  }

  /**
   * 检查组件是否已注册
   */
  hasComponent(name: string): boolean {
    return this.components.has(name)
  }

  /**
   * 移除组件
   */
  unregister(name: string): boolean {
    return this.components.delete(name)
  }

  /**
   * 清空所有组件
   */
  clear(): void {
    this.components.clear()
  }
}

/**
 * 创建组件渲染器实例
 */
export function createComponentRenderer(): ComponentRenderer {
  return new ComponentRenderer()
}

/**
 * 全局组件渲染器实例
 */
export const globalRenderer = createComponentRenderer()

/**
 * 便捷函数：渲染已注册的组件
 */
export async function renderComponent(
  componentName: string,
  options: ComponentRenderOptions = {}
): Promise<Buffer> {
  return globalRenderer.renderComponent(componentName, options)
}

/**
 * 便捷函数：渲染自定义 React 元素
 */
export async function renderElement(
  element: ReactElement,
  options: ImageOptions & { cssStyles?: Record<string, any> } = {}
): Promise<Buffer> {
  return globalRenderer.renderElement(element, options)
}

/**
 * 便捷函数：渲染函数组件
 */
export async function renderFunction(
  component: ComponentType<any>,
  options: ComponentRenderOptions = {}
): Promise<Buffer> {
  return globalRenderer.renderFunction(component, options)
}

/**
 * 便捷函数：注册组件
 */
export function registerComponent(name: string, component: ComponentType<any>): void {
  globalRenderer.register(name, component)
}

/**
 * 便捷函数：注册多个组件
 */
export function registerComponents(components: Record<string, ComponentType<any>>): void {
  globalRenderer.registerMultiple(components)
} 