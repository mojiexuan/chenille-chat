import { NO_CONTENT_MESSAGE } from "@/constants";
import type { MessageBase, UserMessage } from "@/types";
import { randomUUID } from "@/utils";
import { UUID } from "crypto";

/**
 * 创建用户消息
 */
export function createUserMessage(msg: MessageBase & { content: string }) {
  const { content, ...rest } = msg;
  const userMessage: UserMessage = {
    ...rest,
    type: "user",
    message: {
      role: "user",
      content: content || NO_CONTENT_MESSAGE,
    },
    uuid: (rest.uuid as UUID | undefined) || randomUUID(),
    timestamp: rest.timestamp ?? new Date().toISOString(),
  };
  return userMessage;
}
