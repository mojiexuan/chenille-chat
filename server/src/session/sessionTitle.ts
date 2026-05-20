import { ClientService } from "@/services";
import { ChatModel, Message } from "@/types";
import { lazySchema, parseWithSchema } from "@/utils";
import z from "zod/v4";

const MAX_CONVERSATION_TEXT = 1000;

const clientService = new ClientService();

/**
 * 将消息数组展平为一个文本字符串
 * 跳过元信息/非人类消息。仅保留最后1000个字符
 * 当对话较长时，最近的上下文更为重要
 */
export function extractConversationText(messages: Message[]) {
  const parts: string[] = [];
  for (const msg of messages) {
    if (msg.type !== "user" && msg.type !== "assistant") continue;
    if ("isMeta" in msg && msg.isMeta) continue;
    if ("origin" in msg && msg.origin && msg.origin.kind !== "human") continue;
    const content = msg.message.content;
    if (typeof content === "string") {
      parts.push(content);
    } else if (Array.isArray(content)) {
      for (const block of content) {
        if ("type" in block && block.type === "text" && "text" in block) {
          parts.push(block.text as string);
        }
      }
    }
  }
  const text = parts.join("\n");
  return text.length > MAX_CONVERSATION_TEXT
    ? text.slice(-MAX_CONVERSATION_TEXT)
    : text;
}

const titleSchema = lazySchema(() => z.object({ title: z.string() }));

const SESSION_TITLE_PROMPT = `生成一个简洁的、句子首字母大写(英语时)的标题（英语时3-7个单词，中文时5-20个字符），以概括本次工作会议的主要主题或目标。标题应足够清晰，以便用户在列表中识别该会议。使用句子首字母大写：仅首词和专有名词首字母大写。

返回一个包含单个“title”字段的JSON。

好的例子：
{"title": "修复图片资源缺失问题"}
{"title": "添加课程大纲"}
{"title": "替换成错误的图片资源"}
{"title": "为课程生成新的教案"}

坏的(过于模糊):{"title": "步骤更改"}
坏的(过长):{"title": "检查并替换所有步骤中静态资源无法显示的步骤问题"}
坏的(大小写错误):{"title": "Update Cover"}`;

/**
 * 生成会话标题
 */
export async function generateSessionTitle(
  model: ChatModel,
  messages: Message[],
): Promise<string | null> {
  const result = await clientService.chat(model, {
    messages: [
      {
        type: "system",
        message: SESSION_TITLE_PROMPT,
      },
      {
        type: "user",
        message: {
          role: "user",
          content: extractConversationText(messages),
        }
      }
    ],
    jsonSchema: titleSchema(),
  });
  return parseWithSchema(titleSchema(), result.message.content)?.title || null;
}
