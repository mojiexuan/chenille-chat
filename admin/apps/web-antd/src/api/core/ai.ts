import type { Agent, Model, ModelProvider, ReasoningEffort } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace AiApi {
    /** AI接口参数 */
    export interface ModelListParams {
        providerId: string;
    }

    /** AI接口返回值 */
    export type ModelListResult = Model[];

    export type ModelProviderResult = ModelProvider[];

    export type AgentResult = Agent[];

    /**
     * 添加或更新模型提供方参数
     */
    export interface AddOrUpdateModelProviderParams {
        id?: string,
        provider: string,
        name: string,
        apiKey: string,
        baseUrl: string,
        isActive: boolean,
    }

    /**
     * 添加或更新模型参数
     */
    export interface AddOrUpdateModelParams {
        id?: string,
        providerId: string,
        name: string,
        modelName: string,
        description: string,
        reasoningEffort: ReasoningEffort,
        canInputText: boolean,
        canOutputText: boolean,
        canInputImage: boolean,
        canOutputImage: boolean,
        canInputVideo: boolean,
        canOutputVideo: boolean,
        canInputAudio: boolean,
        canOutputAudio: boolean,
        isActive: boolean,
        isDefault: boolean,
        sortOrder: number,
    }
}

/**
 * 获取模型提供方列表
 */
export async function getModelProviderApi() {
    return requestClient.get<AiApi.ModelProviderResult>('/admin/providers');
}

/**
 * 添加或更新模型提供方
 * @param data 参数
 */
export async function addOrUpdateModelProviderApi(data: AiApi.AddOrUpdateModelProviderParams) {
    return requestClient.put("/admin/provider", data);
}

/**
 * 删除模型提供方
 * @param id 模型提供方ID
 */
export async function deleteModelProviderApi(id: string) {
    return requestClient.delete(`/admin/provider/${id}`);
}

/**
 * 获取模型列表
 */
export async function getModelListApi() {
    return requestClient.get<AiApi.ModelListResult>(`/admin/models`);
}

/**
 * 添加或更新模型
 * @param data 参数
 */
export async function addOrUpdateModelApi(data: AiApi.AddOrUpdateModelParams) {
    return requestClient.put("/admin/model", data);
}

/**
 * 删除模型
 * @param id 模型ID
 */
export async function deleteModelApi(id: string) {
    return requestClient.delete(`/admin/model/${id}`);
}

/**
 * 获取智能体列表
 */
export async function getAgentListApi() {
    return requestClient.get<AiApi.AgentResult>('/admin/agent/list');
}
