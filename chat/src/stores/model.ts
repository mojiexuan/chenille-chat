import type { Model } from '@/types'
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getModelListRequest } from '@/request'

/**
 * 用户store
 * @author 陈佳宝
 * @date 2026-01-12
 */
export const useModelStore = defineStore('model', () => {
    const models = ref<Model[]>([
        {
            id: 0,
            providerId: 0,
            name: "Auto",
            description: "自动选择模型",
            canThinking: true,
            canInputImage: true,
            canOutputImage: true,
            canInputVideo: true,
            canOutputVideo: true,
            canInputAudio: true,
            canOutputAudio: true,
            isActive: true,
            isDefault: true,
            sortOrder: 0,
        }
    ]);

    /**
     * 刷新 AI 模型列表
     */
    function refreshModelList() {
        getModelListRequest()
            .then((res) => {
                models.value = [{
                    id: 0,
                    providerId: 0,
                    name: "Auto",
                    description: "自动选择模型",
                    canThinking: true,
                    canInputImage: true,
                    canOutputImage: true,
                    canInputVideo: true,
                    canOutputVideo: true,
                    canInputAudio: true,
                    canOutputAudio: true,
                    isActive: true,
                    isDefault: true,
                    sortOrder: 0,
                }, ...res];
            })
    }

    return {
        models,
        refreshModelList,
    }
})