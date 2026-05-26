import { randomFillSync } from "crypto";
import { CharType } from "@/enumeration";

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @param types 字符类型
 * @returns 随机字符串
 */
export function randomStr(length: number, types: CharType = CharType.Digit): string {
    let chars = "";
    if (types & CharType.Digit) chars += "0123456789";
    if (types & CharType.Lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (types & CharType.Upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    if (!chars) throw new Error("至少指定一种字符类型");

    const bytes = Buffer.alloc(length);
    randomFillSync(bytes);

    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}