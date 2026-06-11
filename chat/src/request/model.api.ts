import type { Model } from '@/types';
import { get } from './fetch';

/**
 * 获取 AI 模型列表
 */
export const getModelListRequest = () => {
    return get<Model[]>("/chat/model/list");
}