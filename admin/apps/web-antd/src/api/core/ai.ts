import type { Agent, Model, ModelProvider } from '@vben/types';

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
        provider: string,
        name: string,
        apiKey: string,
        baseUrl: string,
        isActive: boolean,
    }
}

/**
 * 获取模型提供方列表
 */
export async function getModelProviderApi() {
    return requestClient.get<AiApi.ModelProviderResult>('/admin/chat/model/provider/list');
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
export async function getModelListByProviderIdApi(params: AiApi.ModelListParams) {
    return requestClient.get<AiApi.ModelListResult>(`/admin/chat/model/${params.providerId}/list`);
}

/**
 * 获取智能体列表
 */
export async function getAgentListApi() {
    return requestClient.get<AiApi.AgentResult>('/admin/agent/list');
}
