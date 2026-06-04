import { Message, SystemPrompt } from "@/types";

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
      const text = content.map((part) => part.text ?? "").join("");
      return acc + estimateTokens(text);
    }
    if (msg.type === "assistant") {
      return acc + estimateTokens(msg.message.content);
    }
    return acc;
  }, 0);
}
