import { Session } from "@/session";
import { ChatModel, ChatRequest, ChatUsage } from "./model.type";
import { Tools } from "./tool.type";
import { SystemPrompt } from "./prompt.type";
import { Message } from "./message.type";

/**
 * 智能体选项
 */
export interface AgentOption {
  name: string;
  description: string;
  model: ChatModel;
  session?: Session;
  tools?: Tools;
  systemPrompt?: SystemPrompt;
  maxToolRounds?: number; // 不传默认无限次
  options?: Omit<ChatRequest, "systemPrompt" | "messages">;
}

/**
 * 智能体响应
 */
export interface AgentResult {
  finished: boolean;
  reasoning?: string;
  message: string;
  usage?: ChatUsage;
  rounds: number;
  error?: string;
}
