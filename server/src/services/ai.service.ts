import { UserMessage, ChatCallback, Message, AssistantMessage } from "@/types";
import { AIProvider } from "@/enumeration";
import { createAiModel } from "@/models";
import { BizCode, Role } from "@/enumeration";
import { ChatSseDto } from "@/dto";
import { getSystemPrompt, asSystemPrompt } from "@/utils";
import { SessionService } from "./session.service";

export class AiService {

    private sessionService: SessionService;

    constructor() {
        this.sessionService = new SessionService();
    }

    /**
     * 聊天服务
     * @param params 聊天参数
     */
    async chat(params: { userId: number, data: ChatSseDto, callback?: ChatCallback }) {
        // 获取或创建会话
        const session = await this.sessionService.getOrCreateSession(
            params.data.sessionId ? Number(params.data.sessionId) : undefined,
            params.userId,
        );

        // 构建用户消息
        const userMsg = this.buildUserMessage(params.data.message);

        // 添加用户消息到会话
        await this.sessionService.addMessage(session.id, Role.User, userMsg.message);

        // 获取会话历史消息
        const history = await this.sessionService.getMessages(session.id);

        // 构建上下文消息
        const contextMessages = this.buildContextMessages(history);

        // 调用AI模型
        const aiModel = createAiModel({
            provider: AIProvider.OpenAI,
            apiKey: process.env.OPENAI_API_KEY || "",
            model: "deepseek-v4-pro",
            baseURL: "https://api.deepseek.com",
        });
        try {
            await aiModel.generate({
                stream: true,
                systemPrompt: asSystemPrompt(getSystemPrompt([])),
                messages: contextMessages,
                onAbort: params.callback?.onAbort,
                onChunk: (chunk) => {
                    if (params.callback && params.callback.onMessage) {
                        params.callback.onMessage({
                            sessionId: session.id,
                            reasoning: chunk.reasoning,
                            content: chunk.message.content,
                            finished: chunk.finished,
                        });
                    }
                }
            })
        } catch (err) {
            // throw new BizException(BizCode.AI_CHAT_ERROR);
            if (params.callback && params.callback.onMessage) {
                params.callback.onMessage({
                    sessionId: session.id,
                    error: BizCode.AI_CHAT_ERROR.message,
                    finished: true,
                    content: "",
                });
            }
        }
    }

    /**
     * 构建用户消息
     */
    private buildUserMessage(message: string): UserMessage {
        return {
            type: "user",
            message: { role: "user", content: message },
        };
    }

    /**
     * 构建上下文消息
     */
    private buildContextMessages(dbMessages: { role: string; content: unknown }[]): Message[] {
        return dbMessages.filter((msg) => msg.role === Role.User || msg.role === Role.Assistant)
            .map((msg) => {
                if (msg.role === Role.User) {
                    return {
                        type: "user",
                        message: { role: "user", content: msg.content },
                    } as UserMessage
                }
                return {
                    type: "assistant",
                    message: { role: "assistant", content: msg.content }
                } as AssistantMessage
            });
    }

}
