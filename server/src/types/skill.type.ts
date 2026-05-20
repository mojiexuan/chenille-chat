import { SystemPrompt } from "./prompt.type";
import { Tools } from "./tool.type";

export interface Skill {
  name: string;
  description: string;
  tools: Tools;
  // 可选的系统提示词
  systemPrompt?: SystemPrompt;
  // 初始化逻辑
  init?: () => Promise<void>;
}
