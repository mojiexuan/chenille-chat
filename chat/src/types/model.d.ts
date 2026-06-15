/**
 * 模型项类型
 */
/**
 * 模型
 */
export interface Model {
    id: string;
    providerId: string;
    name: string;
    description: string;
    canThinking: boolean;
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