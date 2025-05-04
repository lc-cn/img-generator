import { FontDetector, languageFontMap } from '../utils/font'
async function fetchFont(
  text: string,
  font: string
): Promise<ArrayBuffer | null> {
  const API = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`

  const css = await (
    await fetch(API, {
      headers: {
        // Make sure it returns TTF.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    })
  ).text()

  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (!resource) return null

  const res = await fetch(resource[1])

  return res.arrayBuffer()
}
const detector = new FontDetector()
function encodeFontInfoAsArrayBuffer(code: string, fontData: ArrayBuffer) {
  // 1 byte per char
  const buffer = new ArrayBuffer(1 + code.length + 4 + fontData.byteLength)
  const bufferView = new Uint8Array(buffer)
  // 1 byte for the length of the language code
  bufferView[0] = code.length
  // X bytes for the language code
  for (let i = 0; i < code.length; i++) {
    bufferView[i + 1] = code.charCodeAt(i)
  }

  // 4 bytes for the length of the font data
  new DataView(buffer).setUint32(1 + code.length, fontData.byteLength, false)

  // Y bytes for the font data
  bufferView.set(new Uint8Array(fontData), 1 + code.length + 4)

  return buffer
}
export default async function loadGoogleFont(fonts:string[],text:string):Promise<Buffer> {

  if (!fonts || fonts.length === 0 || !text) return Buffer.from([])

  const textByFont = await detector.detect(text, fonts)

  const _fonts = Object.keys(textByFont)

  const encodedFontBuffers: ArrayBuffer[] = []
  let fontBufferByteLength = 0
  ;(
    await Promise.all(_fonts.map((font) => fetchFont(textByFont[font], font)))
  ).forEach((fontData, i) => {
    if (fontData) {
      const langCode = Object.entries(languageFontMap).find(
        ([, v]) => v === _fonts[i]
      )?.[0]
      if (langCode) {
        const buffer = encodeFontInfoAsArrayBuffer(langCode, fontData)
        encodedFontBuffers.push(buffer)
        fontBufferByteLength += buffer.byteLength
      }
    }
  })

  const responseBuffer = new ArrayBuffer(fontBufferByteLength)
  const responseBufferView = new Uint8Array(responseBuffer)
  let offset = 0
  encodedFontBuffers.forEach((buffer) => {
    responseBufferView.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength
  })

  return Buffer.from(responseBuffer)
}
/**
 * 检测文本的语言并返回对应的字体
 */
export function getTextFont(text: string): string[] {
  // 简单的语言检测
  const fonts = new Set<string>();
  fonts.add('sans-serif'); // 默认字体

  if (/[\u4e00-\u9fff]/.test(text)) {
    fonts.add('Noto Sans SC');
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    fonts.add('Noto Sans JP');
  }
  if (/[\uac00-\ud7af]/.test(text)) {
    fonts.add('Noto Sans KR');
  }
  if (/[\u0600-\u06ff]/.test(text)) {
    fonts.add('Noto Sans Arabic');
  }
  if (/[\u0590-\u05ff]/.test(text)) {
    fonts.add('Noto Sans Hebrew');
  }
  if (/[\u0e00-\u0e7f]/.test(text)) {
    fonts.add('Noto Sans Thai');
  }

  return Array.from(fonts);
}
