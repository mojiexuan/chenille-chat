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
}

/**
 * 获取模型提供方列表
 */
export async function getModelProviderApi() {
    return requestClient.get<AiApi.ModelProviderResult>('/admin/chat/model/provider/list');
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
