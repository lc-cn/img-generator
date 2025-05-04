import { createElement, ReactNode } from 'react';

/**
 * 将 emoji 字符转换为 SVG URL
 */
export function emojiToSvgUrl(emoji: string): string {
  const codePoint = emoji.codePointAt(0)?.toString(16);
  if (!codePoint) return '';
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
}

export function splitEmojiToReact(text: string): ReactNode[] {
  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}/gu;
  let lastIndex = 0;
  const result: ReactNode[] = [];
  let match: RegExpExecArray | null;
  while ((match = emojiRegex.exec(text))) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    const emoji = match[0];
    const codePoint = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16)).join('-');
    const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
    result.push(createElement('img', {
      src: url,
      width: 36,
      height: 36,
      style: { verticalAlign: 'middle' },
      alt: emoji,
      key: `emoji-${match.index}`,
    }));
    lastIndex = match.index + emoji.length;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
} 