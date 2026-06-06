import { AiAbort } from "./ai.type";
import { ChatUsage } from "./model.type";

/**
 * 消息回调
 */
export type MessageCallback = {
  sessionId?: number;
  reasoning?: string;
  content?: string;
  usage?: ChatUsage;
  finished: boolean;
  error?: string;
};

/**
 * 聊天回调
 */
export type ChatCallback = {
  onAbort?: AiAbort;
  onMessage?: (message: MessageCallback) => void;
};
