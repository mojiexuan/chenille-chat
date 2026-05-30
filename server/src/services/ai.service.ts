import { UserMessage, ChatCallback } from "@/types";
import { AIProvider } from "@/enumeration";
import { createAiModel } from "@/models";
import { BizCode } from "@/enumeration";
import { ChatSseDto } from "@/dto";

export class AiService {

    /**
     * 聊天服务
     * @param params 聊天参数
     */
    async chat(params: { data: ChatSseDto, callback?: ChatCallback }) {
        const userMsg = this.buildUserMessage(params.data.message);
        const aiModel = createAiModel({
            provider: AIProvider.OpenAI,
            apiKey: process.env.OPENAI_API_KEY || "",
            model: "deepseek-v4-pro",
            baseURL: "https://api.deepseek.com",
        });
        try {
            await aiModel.generate({
                stream: true,
                messages: [userMsg],
                onAbort: params.callback?.onAbort,
                onChunk: (chunk) => {
                    if (params.callback && params.callback.onMessage) {
                        params.callback.onMessage({
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
                    error: BizCode.AI_CHAT_ERROR.message,
                    finished: true,
                    content: "",
                });
            }
        }
    }

    /**
     * 构建用户消息
     * @param params 聊天参数
     */
    private buildUserMessage(message: string): UserMessage {
        return {
            type: "user",
            message: { role: "user", content: message },
        };
    }

}
