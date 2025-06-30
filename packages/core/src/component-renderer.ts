import { ReactElement } from 'react';
import { createElement, isValidElement } from './react-element.js';

/**
 * 自动修复：确保所有元素都有显式的display属性
 * - 多子元素：display: flex + flexDirection: column
 * - 单子元素或无子元素：display: flex
 * 这是satori的要求，所有元素都必须显式设置display属性
 */
function autoFlex(element: ReactElement): ReactElement {
  if (!isValidElement(element)) return element;
  
  const { type, props } = element;
  const safeProps = (typeof props === 'object' && props !== null) ? (props as Record<string, any>) : {};
  let children = safeProps.children;

  // 递归处理所有子节点
  if (Array.isArray(children)) {
    children = children.map(child => {
      if (isValidElement(child)) {
        return autoFlex(child);
      }
      return child;
    });
  } else if (children !== undefined && children !== null && isValidElement(children)) {
    children = autoFlex(children);
  }

  // 只处理字符串类型的标签（如 div、section、main 等）
  if (typeof type === 'string') {
    // 统计有效子节点数量
    let count = 0;
    if (Array.isArray(children)) {
      count = children.length;
    } else if (children !== undefined && children !== null) {
      count = 1;
    }

    // 确保所有元素都有显式的display属性
    const style = { ...(safeProps.style || {}) };
    if (count > 1 && !style.display) {
      style.display = 'flex';
      style.flexDirection = 'column';
    } else if (count <= 1 && !style.display) {
      style.display = 'flex';
    }
    
    // 构建新的 props，不包含 children
    const { children: _, ...propsWithoutChildren } = safeProps;
    const newProps = { 
      ...propsWithoutChildren, 
      style
    };
    
    // 将 children 作为额外参数传递，而不是包含在 props 中
    if (children !== undefined && children !== null) {
      if (Array.isArray(children)) {
        return createElement(type, newProps, ...children);
      } else {
        return createElement(type, newProps, children);
      }
    } else {
      return createElement(type, newProps);
    }
  }

  // 对于非字符串类型的组件，保持原样
  return element;
}

/**
 * 处理元素，应用autoFlex修复
 */
export function processElement(element: ReactElement): ReactElement {
  // 应用autoFlex修复
  return autoFlex(element);
}

/**
 * 递归处理组件，展开函数组件
 */
export function expandComponents(element: ReactElement): ReactElement {
  if (!isValidElement(element)) return element;
  
  const { type, props } = element;
  
  // 处理函数组件
  if (typeof type === 'function') {
    try {
      // 检查是否是类组件（有prototype.render方法）
      if (type.prototype && type.prototype.render) {
        // 类组件需要用new实例化
        const instance = new (type as any)(props);
        const result = instance.render();
        return expandComponents(result);
      } else {
        // 函数组件直接调用
        const result = (type as any)(props);
        return expandComponents(result);
      }
    } catch (error) {
      console.warn('Function component failed:', error);
      return element;
    }
  }
  
  // 处理子元素
  const { children, ...otherProps } = props as any;
  let processedChildren = children;
  
  if (children !== undefined && children !== null) {
    if (Array.isArray(children)) {
      processedChildren = children.map(child => {
        if (isValidElement(child)) {
          return expandComponents(child);
        }
        return child;
      });
    } else if (isValidElement(children)) {
      processedChildren = expandComponents(children);
    }
  }
  
  // 重新构建元素，将children作为props的一部分
  return createElement(type, { ...otherProps, children: processedChildren });
} 