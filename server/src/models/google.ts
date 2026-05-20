import { ChatModel, ChatRequest, ChatResult, ChatToolCall, Message, SystemPrompt, Tool } from "@/types";
import { Content, GoogleGenAI, FunctionDeclaration } from "@google/genai";
import { AiModel } from "./base.model";

/**
 * Google模型
 */
class GoogleModel extends AiModel {
    private client: GoogleGenAI;
    private config: ChatModel & { model: string; baseURL: string };

    constructor(model: ChatModel) {
        super(model);
        this.config = {
            baseURL: "https://generativelanguage.googleapis.com/v1beta",
            model: "gemini-3.1-pro-preview",
            ...model,
        };
        this.client = new GoogleGenAI({
            apiKey: this.config.apiKey,
            httpOptions: {
                baseUrl: this.config.baseURL,
            }
        });
    }

    async generate(options: ChatRequest): Promise<ChatResult> {
        const controller = new AbortController();
        let aborted = false;

        const abortSignal = () => {
            aborted = true;
            controller.abort();
        };
        const result: ChatResult = {
            type: "assistant",
            message: {
                role: "assistant",
                content: "",
            },
            finished: false,
        };
        // 立即把 abort 暴露给外层
        options.onAbort?.(abortSignal);
        return this.client.models.generateContent({
            model: this.config.model,
            contents: this.buildContents(options.messages, options.systemPrompt),
            config: {
                ...(options.tools ? {
                    tools: [
                        {
                            functionDeclarations: await Promise.all(
                                options.tools.map(
                                    async (tool) => await this.toolToGoogleClientSchema(tool),
                                ),
                            ),
                        }
                    ]
                } : {}),
                abortSignal: controller.signal,
            }
        }).then((res) => {
            const text = res.text || "";
            result.message.content = text || "";
            result.finished = true;
            const toolCalls = res.functionCalls || [];

            if (toolCalls.length > 0) {
                result.message.toolCalls = toolCalls.flatMap((call) => {
                    return {
                        id: call.id || "",
                        name: call.name || "",
                        arguments: JSON.stringify(call.args || {}),
                    } as ChatToolCall
                });
            }
            return result;
        })
    }

    /**
     * TODO 构建Google GenAI客户端消息参数
     * @returns Google GenAI客户端消息参数
     */
    private buildContents(messages: Message[], systemPrompt?: SystemPrompt) {
        return [
            ...(systemPrompt
                ? [
                    {
                        role: "system",
                        parts: [
                            {
                                text: systemPrompt.join("\n"),
                            }
                        ],
                    } as Content,
                ]
                : []),
            ...messages.map((msg) => {
                if (msg.type === "system") {
                    return {
                        role: msg.type,
                        parts: [
                            {
                                text: msg.message,
                            }
                        ],
                    } as Content;
                }
                if (msg.type === "assistant") {
                    return {
                        role: msg.message.role,
                        content: msg.message.content,
                        ...(msg.message.toolCalls
                            ? {
                                tool_calls: msg.message.toolCalls.map((c) => ({
                                    id: c.id,
                                    type: "function",
                                    function: {
                                        name: c.name,
                                        arguments: c.arguments || "",
                                    },
                                })),
                            }
                            : {}),
                    } as Content;
                }
                if (msg.type === "user") {
                    return {
                        role: msg.message.role,
                        parts: [
                            {
                                text: msg.message.content,
                            }
                        ],
                    } as Content;
                }
                if (msg.type === "tool") {
                    return {
                        role: msg.message.role,
                        content: msg.message.content,
                        tool_call_id: msg.message.toolCallId,
                    } as Content;
                }
                throw new Error(`未知的消息类型: ${msg.type}`);
            }),
        ] as Content[];
    }

    /**
     * 将工具转换为Google GenAI客户端工具模式
     * @returns Google GenAI客户端工具模式
     */
    private async toolToGoogleClientSchema(
        tool: Tool,
    ): Promise<FunctionDeclaration> {
        const description = (await tool.prompt({ tools: [] })) || "";
        const schema: FunctionDeclaration = {
            name: tool.name,
            description,
            parametersJsonSchema: tool.inputSchema.toJSONSchema(),
            responseJsonSchema: tool.outputSchema.toJSONSchema(),
        };
        return schema;
    }
}

export { GoogleModel };
