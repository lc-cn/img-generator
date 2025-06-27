import { ReactElement, JSXElementConstructor, ReactNode } from 'react';

// 直接使用React的类型定义
export { ReactElement, JSXElementConstructor };

// 自定义JSX对象格式
export interface JSXObject {
  type: string | JSXElementConstructor<any>;
  props: {
    children?: ReactNode;
    [key: string]: any;
  };
}

// 自定义实现的createElement函数
export function createElement<P extends {}>(
  type: string | JSXElementConstructor<P>,
  props?: P | null,
  ...children: ReactNode[]
): ReactElement {
  return {
    $$typeof: Symbol.for('react.element'),
    type,
    key: (props as any)?.key || null,
    ref: (props as any)?.ref || null,
    props: {
      ...props,
      children: children.length === 0 ? undefined : 
               children.length === 1 ? children[0] : children,
    },
    _owner: null,
    _store: {},
  } as ReactElement;
}

// 自定义实现的isValidElement函数
export function isValidElement(object: any): object is ReactElement {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === Symbol.for('react.element')
  );
}

// 检查是否为JSX对象格式
export function isJSXObject(obj: any): obj is JSXObject {
  return (
    obj &&
    typeof obj === 'object' &&
    'type' in obj &&
    'props' in obj &&
    typeof obj.props === 'object'
  );
}

// JSX对象转ReactElement
export function jsxObjectToReactElement(jsxObj: JSXObject): ReactElement {
  const { children, ...otherProps } = jsxObj.props;
  
  // 递归处理children
  if (children === undefined || children === null) {
    return createElement(jsxObj.type, otherProps);
  }
  
  if (Array.isArray(children)) {
    const processedChildren = children.map(child => 
      isJSXObject(child) ? jsxObjectToReactElement(child) : child
    );
    return createElement(jsxObj.type, otherProps, ...processedChildren);
  }
  
  if (isJSXObject(children)) {
    return createElement(jsxObj.type, otherProps, jsxObjectToReactElement(children));
  }
  
  return createElement(jsxObj.type, otherProps, children);
}

// ReactElement转JSX对象
export function reactElementToJSXObject(element: ReactElement): JSXObject {
  return {
    type: element.type,
    props: element.props,
  };
}

// 克隆元素
export function cloneElement(
  element: ReactElement,
  props?: any,
  ...children: ReactNode[]
): ReactElement {
  return createElement(
    element.type,
    { ...element.props, ...props },
    ...(children.length > 0 ? children : [element.props.children])
  );
} 