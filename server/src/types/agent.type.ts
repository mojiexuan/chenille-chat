import { Session } from "@/session";
import { ChatModel, ChatRequest } from "./model.type";
import { Tools } from "./tool.type";
import { SystemPrompt } from "./prompt.type";

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
  maxToolRounds?: number;
  options?: Omit<ChatRequest, "systemPrompt" | "messages">;
}

/**
 * 智能体响应
 */
export interface AgentResult {
  finished: boolean;
  message: string;
  rounds: number;
  error?: string;
}
