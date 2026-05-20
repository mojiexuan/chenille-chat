import { ChatModel, ChatRequest, ChatResult } from "@/types";

export abstract class AiModel {
    constructor(protected model: ChatModel) { }
    abstract generate(options: ChatRequest): Promise<ChatResult>;
}