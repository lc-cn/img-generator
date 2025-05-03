import { JSDOM } from 'jsdom';
import { TextEncoder, TextDecoder } from 'util';

// 设置全局 TextEncoder 和 TextDecoder
global.TextEncoder = TextEncoder as typeof TextEncoder;
global.TextDecoder = TextDecoder as typeof TextDecoder;

// 创建 JSDOM 实例
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

// 设置全局 DOM 相关对象
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLDivElement = dom.window.HTMLDivElement;
global.HTMLImageElement = dom.window.HTMLImageElement;
global.Node = dom.window.Node;
global.Document = dom.window.Document;
global.DocumentFragment = dom.window.DocumentFragment;
global.DOMParser = dom.window.DOMParser;
global.XMLSerializer = dom.window.XMLSerializer;
