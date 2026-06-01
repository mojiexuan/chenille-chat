import { ChatCallback } from "@/types";
import { AIProvider } from "@/enumeration";
import { createAiModel } from "@/models";
import { BizCode, Role } from "@/enumeration";
import { ChatSseDto } from "@/dto";
import { getSystemPrompt, asSystemPrompt } from "@/utils";
import { SessionService } from "./session.service";
import { logger } from "@/utils";

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
            params.data.sessionId,
            params.userId,
        );

        // 添加用户消息到会话
        await this.sessionService.addMessage(session.id, Role.User, params.data.message);

        // 获取会话历史消息
        const history = await this.sessionService.getMessages(session.id);

        // 构建上下文消息
        const contextMessages = this.sessionService.buildContextMessages(history);

        // 调用AI模型
        // !TODO 后续配置从数据库获取
        const aiModel = createAiModel({
            provider: AIProvider.DeepSeek,
            apiKey: process.env.OPENAI_API_KEY || "",
            model: "deepseek-v4-pro",
            baseURL: "https://api.deepseek.com",
        });

        // 生成会话标题
        let titlePromise: Promise<string | null> | null = null;
        if (!session.title || session.title.length === 0 || session.title === "新会话") {
            titlePromise = this.sessionService.generateUserSessionTitle(params.userId, session.id);
        }

        try {
            const result = await aiModel.generate({
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
            });

            // 添加AI消息到会话
            this.sessionService.addMessage(session.id, Role.Assistant, result.message.content);
        } catch (err) {
            logger.error(err);
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

        if (titlePromise) {
            try {
                const title = await Promise.race([
                    titlePromise,
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
                ]);
                if (title) {
                    session.title = title;
                    params.callback?.onTitle?.(session.id, title);
                }
            } catch (err) {
                logger.error(err);
            }
        }
    }

}
