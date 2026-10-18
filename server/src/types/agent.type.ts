import { Session } from "@/session";
import { ChatModel, ChatRequest, ChatUsage } from "./model.type";
import { ToolCallRecord, Tools } from "./tool.type";
import { SystemPrompt } from "./prompt.type";
import { AiRole, ToolCallStatus } from "@/enumeration";

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
  onTool?: (event: AgentToolEvent) => void;
  options?: Omit<ChatRequest, "systemPrompt" | "messages">;
}

/**
 * 智能体工具调用事件
 */
export interface AgentToolEvent {
  // 工具调用ID
  id: string;
  // 工具名称
  name: string;
  // 工具调用状态
  status: ToolCallStatus;
  // 执行耗时(ms)
  duration?: number;
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

/**
 * 智能体落库消息
 */
export interface AgentTurn {
  // 消息角色
  role: AiRole;
  // 消息内容
  content: string;
  // 推理内容
  reasoning?: string | null;
  // 调用统计
  usage?: ChatUsage;
  // 工具调用记录（工具消息携带）
  tool?: ToolCallRecord;
}
