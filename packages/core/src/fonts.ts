import emojiRegex from 'emoji-regex'
import { readFileSync } from 'fs'
import {btoa} from "node:buffer";

// 字体缓存
const fontCache = new Map<string, ArrayBuffer>()

/**
 * 字体加载和处理模块
 */
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontStyle = 'normal' | 'italic';
export interface FontLoadOptions {
    data: Buffer | ArrayBuffer;
    name: string;
    weight?: Weight;
    style?: FontStyle;
    lang?: string;
}

/**
 * 从 Google Fonts 加载字体
 */
export async function loadFont(
  fontFamily: string,
  text:string,
  isAll?:boolean
): Promise<ArrayBuffer | null> {
  if(!fontFamily||(!text && !isAll)) return null
  const api=`https://fonts.googleapis.com/css2?family=${fontFamily}${isAll?'':`&text=${encodeURIComponent(text)}`}`
  const css=await fetch(api,{
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
    }
  }).then(res=>res.text())
  const resource=css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)
  if(!resource) throw new Error('Font file URL not found in CSS')
    const res=await fetch(resource[1])
  if(!res.ok) throw new Error('Failed to fetch font file')
  return res.arrayBuffer()
}

/**
 * 从本地文件加载字体
 */
export async function loadFontFromFile(filePath: string): Promise<ArrayBuffer | null> {
  try {
      const buffer = readFileSync(filePath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } catch (error) {
    console.warn(`Failed to load font from file ${filePath}:`, error);
    return null;
  }
}

/**
 * 检测文本中需要的字体
 */
export function detectFonts(text: string): string[] {
  const fonts: string[] = [];
  
  // 检测中文字符
  if (/[\u4e00-\u9fff]/.test(text)) {
    fonts.push('Noto Sans SC');
  }
  
  // 检测日文字符
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
    fonts.push('Noto Sans JP');
  }
  
  // 检测韩文字符
  if (/[\uac00-\ud7af]/.test(text)) {
    fonts.push('Noto Sans KR');
  }
  
  // 检测阿拉伯文字符
  if (/[\u0600-\u06ff]/.test(text)) {
    fonts.push('Noto Sans Arabic');
  }
  
  // 如果没有特殊字符，使用默认字体
  if (fonts.length === 0) {
    fonts.push('Inter');
  }
  
  return fonts;
}

/**
 * 检测文本中的 emoji
 */
export function detectEmojis(text: string): string[] {
  const emojiR = emojiRegex()
  const matches = text.match(emojiR);
  return matches ? [...new Set(matches)] : [];
}


const languageFontMap:Record<string,string|string[]>={ "ja-JP": "Noto+Sans+JP",
  "ko-KR": "Noto+Sans+KR",
  "zh-CN": "Noto+Sans+SC",
  "zh-TW": "Noto+Sans+TC",
  "zh-HK": "Noto+Sans+HK",
  "th-TH": "Noto+Sans+Thai",
  "bn-IN": "Noto+Sans+Bengali",
  "ar-AR": "Noto+Sans+Arabic",
  "ta-IN": "Noto+Sans+Tamil",
  "ml-IN": "Noto+Sans+Malayalam",
  "he-IL": "Noto+Sans+Hebrew",
  "te-IN": "Noto+Sans+Telugu",
  devanagari: "Noto+Sans+Devanagari",
  kannada: "Noto+Sans+Kannada",
  symbol: ["Noto+Sans+Symbols", "Noto+Sans+Symbols+2"],
  math: "Noto+Sans+Math",
  unknown: "Noto+Sans"
}
function checkCharInRange(char:string,ranges:(number|string|number[])[]){
  const codePoint=char.codePointAt(0)
  if(!codePoint) return false
  return ranges.some(range=>{
    if(typeof range==='number') return codePoint===range
    if(Array.isArray(range)) {
      const [start,end]=range
      return start <= codePoint && codePoint <= end
    }
    else {
      const [start,end]=range.split('-')
      return Number(start) <= codePoint && codePoint <= Number(end)
    }
  })
}
class FontDetector{
  rangesByLang:Record<string,(number|string|number[])[]>={}
  constructor(){}
  async detect(text:string,fonts:string[]){
    await this.load([...fonts])
    const result:Record<string,string>={}
    for(const char of text){
      const lang=this.detectChar(char,[...fonts])
      if(lang){
        result[lang]=result[lang]||""
        result[lang]+=char
      }
    }
    return result
  }
  detectChar(char:string,fonts:string[]){
    for(const font of fonts){
      const range=this.rangesByLang[font]
      if(range && checkCharInRange(char,range)) return font
    }
    return null
  }
  async load(fonts:string[]){
    let params:string='';
    const exitingLanguages=Object.keys(this.rangesByLang)
    const langNeedsToLoad=fonts.filter(font=>!exitingLanguages.includes(font))
    if(!langNeedsToLoad.length) return
    for(const lang of langNeedsToLoad){
      params+=`family=${lang}&`
    }
    params+="display=swap";
    const api=`https://fonts.googleapis.com/css2?${params}`
    const fontFace=await fetch(api,{
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
      }
    }).then(res=>res.text())
    this.addDetectors(fontFace)
  }
  addDetectors(fontFace:string){
    const regex=/font-family:\s*'(.+?)';.+?unicode-range:\s*(.+?);/gms;
    const matches=fontFace.matchAll(regex)
    for(const [,_lang,range] of matches){
      const lang = _lang.replace(/\s/g, "+");
      if(!this.rangesByLang[lang]){
        this.rangesByLang[lang]=[]
      }
      else this.rangesByLang[lang].push(...convert(range))
    }
  }
}
function convert(input:string) {
  return input.split(", ").map((range) => {
    range = range.replace(/U\+/g, "");
    const [start, end] = range.split("-").map((hex) => parseInt(hex, 16));
    if (isNaN(end)) {
      return start;
    }
    return [start, end];
  });
}
const detector=new FontDetector()
export function getIconCode(char:string){
  const U200D = String.fromCharCode(8205);
  const UFE0Fg = /\uFE0F/g;
  return toCodePoint(char.indexOf(U200D) < 0 ? char.replace(UFE0Fg, "") : char);
}
function toCodePoint(unicodeSurrogates:string) {
  var r = [], c2 = 0, p = 0, i = 0;
  while (i < unicodeSurrogates.length) {
    c2 = unicodeSurrogates.charCodeAt(i++);
    if (p) {
      r.push((65536 + (p - 55296 << 10) + (c2 - 56320)).toString(16));
      p = 0;
    } else if (55296 <= c2 && c2 <= 56319) {
      p = c2;
    } else {
      r.push(c2.toString(16));
    }
  }
  return r.join("-");
}
export function loadDynamicAsset({emoji}: {emoji?:string}) {
  return async (code: string, text: string):Promise<string|FontLoadOptions[]> => {
    if (code === 'emoji') {
      try{
        return `data:image/svg+xml;base64,${btoa(await loadEmoji(getIconCode(text),emoji))}`
      }catch {
        return text
      }
    }
    const codes=code.split('|')
    const names=codes.map((code2)=>languageFontMap[code2]).filter(Boolean).flat()
    if(!names.length) return []
    try{
      const textByFont=await detector.detect(text,names)
      const fonts = Object.keys(textByFont)
      const fontData=await Promise.all(fonts.map(font=>loadFont(font,textByFont[font])))
      return fontData.map((data,index):FontLoadOptions=>{
        return {
          name:`satori_${codes[index]}_fallback_${text}`,
          data:data as ArrayBuffer,
          weight:400,
          style:'normal',
          lang:codes[index]==='unknown'?void 0:codes[index]
        }
      })
    }catch(e){
      console.log(`failed to load fonts for ${code}`)
      return []
    }
  }
}
const apis:Record<string,string|((code:string)=>string)>={
  twemoji:(code:string)=>`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`,
  openmoji:'https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/',
  noto:'https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/',
  fluent:(code:string) => `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_color.svg`,
  fluentFlat:(code:string)=> `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_flat.svg`,
}
export async function loadEmoji(code:string,type?:string):Promise<string> {
  if(!type || !apis[type])  type='twemoji'
  const api=apis[type]
  if(typeof api==='string') return fetch(`${api}${code.toUpperCase()}.svg`).then(res=>res.text())
  return fetch(api(code)).then(res=>res.text())
}
export async function getDefaultFonts():Promise<FontLoadOptions[]>{
  const fontData=await loadFont('Noto+Sans','',true)
  if(!fontData) throw new Error(` failed to load default font`)
  return [
    {
      name: "sans serif",
      data: fontData,
      weight: 400,
      style: "normal"
    }
  ]
}