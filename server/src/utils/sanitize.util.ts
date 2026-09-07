/**
 * 隐形危险字符：所有控制字符、格式字符、换行分隔符、变体选择符、隐形填充符
 */
export const INVISIBLE_UNSAFE_CHARS = /[\p{Cc}\p{Cf}\u2028\u2029\uFE00-\uFE0F\u3164\uFFA0]/gu;

/**
 * HTML 特殊字符与路径分隔符（文件名、路径等场景建议替换）
 */
export const HTML_PATH_UNSAFE_CHARS = /[<>"'`&\\/:*?|]/g;

/**
 * 对用户输入进行安全处理，移除危险字符
 * @param input 用户输入的文本
 * @param options 安全处理选项
 * @returns 安全后的文本
 */
export function sanitizeUserText(
    input: string, 
    options:{
        replaceHtmlAndPathChars?: boolean; // 是否替换 HTML 特殊字符与路径分隔符
        replacement?: string; // 替换字符
    } = {})
{
    const { replaceHtmlAndPathChars = false, replacement = "_" } = options;
    let text = input.normalize("NFKC");
    text = text.replace(INVISIBLE_UNSAFE_CHARS, "");
    if (replaceHtmlAndPathChars) {
        text = text.replace(HTML_PATH_UNSAFE_CHARS, replacement);
    }
    return text.trim();
}