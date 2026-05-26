/**
 * 字符类型枚举
 */
export enum CharType {
    Digit = 1,        // 0-9
    Lower = 1 << 1,   // a-z
    Upper = 1 << 2,   // A-Z
}