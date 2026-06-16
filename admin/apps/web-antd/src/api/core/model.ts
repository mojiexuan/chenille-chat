import { requestClient } from '#/api/request';

export namespace ModelApi {
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
 * 添加或更新模型提供方
 * @param data 参数
 */
export async function addOrUpdateModelProvider(data: ModelApi.AddOrUpdateModelProviderParams, providerId?: string) {
    return requestClient.post("/admin/provider", {
        ...data,
        ...(providerId ? { providerId } : {}),
    });
}
