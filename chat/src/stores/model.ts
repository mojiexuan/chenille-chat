import type { Model } from '@/types'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getModelListRequest } from '@/request'
import { get, set } from 'idb-keyval'
import { IndexedKeyEnum } from '@/enumeration'

/**
 * 用户store
 * @author 陈佳宝
 * @date 2026-01-12
 */
export const useModelStore = defineStore('model', () => {
    const models = ref<Model[]>([
        {
            id: "0",
            providerId: "0",
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
     * 当前选中的模型
     */
    const currentModel = computed(() => {
        return models.value.find((item) => item.isDefault) || models.value[0];
    })

    /**
     * 切换模型
     * @param modelId 模型id
     */
    function switchModel(modelId: string) {
        models.value.forEach((item) => {
            item.isDefault = item.id === modelId;
        });
        set(IndexedKeyEnum.USER_SELECTED_MODEL, modelId);
    }

    /**
     * 刷新 AI 模型列表
     */
    function refreshModelList() {
        getModelListRequest()
            .then((res) => {
                models.value = [{
                    id: "0",
                    providerId: "0",
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
                get(IndexedKeyEnum.USER_SELECTED_MODEL)
                    .then((data) => {
                        switchModel(data || "0");
                    })
                    .catch(() => {
                        switchModel("0");
                    })
            })
    }

    return {
        models,
        currentModel,
        switchModel,
        refreshModelList,
    }
})