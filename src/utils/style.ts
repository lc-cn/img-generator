/**
 * 解析样式值中的数字
 */
export function parseStyleValue(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, ''));
}
