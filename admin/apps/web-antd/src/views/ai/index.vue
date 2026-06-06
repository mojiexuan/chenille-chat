<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { getAgentListApi, getModelProviderApi, getModelListApi } from '#/api';
import type { AiApi } from '#/api';

import {
    AnalysisChartCard,
} from '@vben/common-ui';

// AI智能体列表
const agentList = ref<AiApi.AgentResult>([]);
// AI模型供应商列表
const modelProviderList = ref<AiApi.ModelProviderResult>([]);

onMounted(async () => {
    Promise.all([
        getModelProviderApi(),
        getAgentListApi(),
    ]).then((data) => {
        modelProviderList.value = data[0] || [];
        agentList.value = data[1] || [];
    })
})
</script>

<template>
    <div class="p-5">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            <AnalysisChartCard v-for="item in agentList" :key="item.id" :title="item.name">
                <div>{{ item.description }}</div>
                <div>{{ item.model.name }}</div>
            </AnalysisChartCard>
        </div>
        <RouterView />
    </div>
</template>
