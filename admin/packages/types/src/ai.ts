/**
 * 模型
 */
export interface Model {
    id: number,
    providerId: number,
    name: string,
    description: string,
    canThinking: boolean,
    canInputImage: boolean,
    canOutputImage: boolean,
    canInputVideo: boolean,
    canOutputVideo: boolean,
    canInputAudio: boolean,
    canOutputAudio: boolean,
    isActive: boolean,
    isDefault: boolean,
    sortOrder: number,
};

/**
 * 模型提供方
 */
export interface ModelProvider {
    id: number,
    provider: string,
    name: string,
    apiKey: string,
    baseUrl: string,
    isActive: boolean,
};

/**
 * 智能体
 */
export interface Agent {
    id: number,
    name: string,
    key: string,
    description: string,
    modelId: number,
    model: {
        name: string,
    }
}