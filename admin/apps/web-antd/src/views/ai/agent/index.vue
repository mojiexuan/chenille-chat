<script setup lang="ts" name="Agent">
import type { SelectValue } from 'ant-design-vue/es/select';

import type { Agent, Model } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Select, SelectOption } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addOrUpdateAgentApi, getAgentListApi, getModelListApi } from '#/api';

// 模型列表
const modelList = ref<Model[]>([]);

/**
 * 智能体表格配置
 */
const gridOptions: VxeGridProps<Agent> = {
    columns: [
        { title: '序号', type: 'seq', width: 50 },
        { field: 'name', title: '名称' },
        { field: 'description', title: '描述' },
        { field: 'modelId', title: '模型', slots: { default: 'model' }, width: 500 },
    ],
    exportConfig: {},
    // height: 'auto', // 如果设置为 auto，则必须确保存在父节点且不允许存在相邻元素，否则会出现高度闪动问题
    keepSource: true,
    proxyConfig: {
        ajax: {
            query: async () => {
                const items = await getAgentListApi();
                return {
                    total: items.length,
                    items,
                }
            },
        },
    },
    toolbarConfig: {
        custom: false,
        export: false,
        // import: true,
        refresh: true,
        zoom: false,
    },
};

/**
 * 智能体表格实例
 */
const [Grid, gridApi] = useVbenVxeGrid({
    gridOptions,
});

/**
 * 模型选择改变时触发
 */
function handleModelChange(row: Agent, val: string) {
    gridApi.setLoading(true);
    addOrUpdateAgentApi({
        id: row.id,
        modelId: val,
    }).then(() => {
        gridApi.setLoading(false);
        gridApi.reload();
    }).catch(() => {
        gridApi.setLoading(false);
    })
}

onMounted(() => {
    getModelListApi().then((res) => {
        modelList.value = res || [];
    })
})
</script>

<template>
    <div class="vp-raw w-full">
        <!-- 表格 -->
        <Grid>
            <template #model="{ row }">
                <Select :value="row.modelId" :style="{ width: '100%' }" placeholder="请配置模型"
                    @change="(val: SelectValue) => handleModelChange(row, val as string)">
                    <SelectOption v-for="model in modelList" :key="model.id" :value="model.id">
                        {{ model.name }}
                    </SelectOption>
                </Select>
            </template>
        </Grid>
    </div>
</template>

<style scoped></style>