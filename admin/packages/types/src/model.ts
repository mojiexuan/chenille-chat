type ReasoningEffort = "high" | "low" | "medium" | "minimal" | "none" | "xhigh";

/**
 * 模型接口
 */
interface Model {
    id: string;
    providerId: string;
    name: string;
    modelName: string;
    description: string;
    reasoningEffort: ReasoningEffort;
    canInputText: boolean;
    canOutputText: boolean;
    canInputImage: boolean;
    canOutputImage: boolean;
    canInputVideo: boolean;
    canOutputVideo: boolean;
    canInputAudio: boolean;
    canOutputAudio: boolean;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
}

/**
 * 模型供应商接口
 */
interface ModelProvider {
    id: string;
    name: string;
    apiKey: string;
    baseUrl: string;
    isActive: boolean;
}

/**
 * 代理接口
 */
interface Agent {
    id: string;
    name: string;
    key: string;
    description: string;
    modelId: string;
}

export type { Agent, Model, ModelProvider, ReasoningEffort }
