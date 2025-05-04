import { FontStyle } from "satori/wasm";

export interface FontOptions {
    data: Buffer | ArrayBuffer;
    name: string;
    weight?: Weight;
    style?: FontStyle;
    lang?: string;
}
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900