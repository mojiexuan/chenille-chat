import { Message, SystemPrompt } from "@/types";
import { SIZE_UNITS } from "@/constants";

/**
 * 快速预估文本 Token 用量
 *
 * 规则：
 * - 1 个中文字符 ≈ 0.6 token
 * - 1 个英文字符 ≈ 0.3 token
 * - 结果向上取整
 */
export function estimateTokens(text: string): number {
  // 中文字符
  let chinese = 0;
  // 英文字符
  let latin = 0;
  // Unicode 标点
  let punctuation = 0;
  // 其他字符
  let other = 0;

  for (const char of text) {
    if (/\p{Script=Han}/u.test(char)) {
      chinese++;
    } else if (/\p{Script=Latin}/u.test(char)) {
      latin++;
    } else if (/\p{P}/u.test(char)) {
      punctuation++;
    } else {
      other++;
    }
  }

  return Math.ceil(
    chinese * 0.6 + latin * 0.3 + punctuation * 0.5 + other * 0.3,
  );
}

/**
 * 快速预估系统提示词 Token 用量
 */
export function estimateSystemPromptTokens(systemPrompt: SystemPrompt) {
  return estimateTokens(systemPrompt.join("\n"));
}

/**
 * 快速预估消息 Token 用量
 */
export function estimateMessagesTokens(messages: Message[]) {
  return messages.reduce((acc, msg) => {
    if (msg.type === "user") {
      const content = msg.message.content;
      if (typeof content === "string") {
        return acc + estimateTokens(content);
      }
      const text = content.map((part) => {
        if(part.type === "text"){
          return part.text ?? "";
        } else if (part.type === "image_url"){
          // 随意估值
          return "chenille".repeat(80);
        }else {
          return "";
        }
      }).join("");
      return acc + estimateTokens(text);
    }
    if (msg.type === "assistant") {
      return acc + estimateTokens(msg.message.content);
    }
    return acc;
  }, 0);
}

/**
 * 格式化数字，添加单位
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (num === 0) return "0";
  const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  const suffix = SIZE_UNITS[tier] || "";
  const scaled = num / Math.pow(10, tier * 3);
  const fixed = scaled.toFixed(decimals);
  const trimmed = fixed.replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1");
  return trimmed + (suffix ? suffix : "");
}
