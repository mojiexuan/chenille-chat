<script setup lang="ts" name="Provider">
import type { Model, ModelProvider } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { AiApi } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { Button, Modal, Tag } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addOrUpdateModelApi, deleteModelApi, getModelListApi, getModelProviderApi } from '#/api';

// 模型列表
const modelProviderList = ref<ModelProvider[]>([]);

/**
 * 模型表格配置
 */
const gridOptions: VxeGridProps<Model> = {
    columns: [
        { title: '序号', type: 'seq', width: 50 },
        { field: 'providerId', title: '供应商', formatter: ({ cellValue }) => modelProviderList.value.find((p) => p.id === cellValue)?.name ?? "未知供应商" },
        { field: 'name', title: '名称' },
        { field: 'modelName', title: '模型ID' },
        { field: 'description', title: '描述' },
        { field: 'reasoningEffort', title: '推理' },
        { field: 'isActive', title: '状态', slots: { default: 'is-active' } },
        { field: 'isDefault', title: '默认', slots: { default: 'is-default' } },
        { field: 'sortOrder', title: '排序' },
        {
            field: 'action',
            slots: { default: 'action' },
            fixed: 'right',
            title: '操作',
            width: 200,
        },
    ],
    exportConfig: {},
    // height: 'auto', // 如果设置为 auto，则必须确保存在父节点且不允许存在相邻元素，否则会出现高度闪动问题
    keepSource: true,
    proxyConfig: {
        ajax: {
            query: async () => {
                const items = await getModelListApi();
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
 * 模型表格实例
 */
const [Grid, gridApi] = useVbenVxeGrid({
    gridOptions,
});
/**
 * 模型抽屉实例
 */
const [Drawer, drawerApi] = useVbenDrawer({
    closeOnClickModal: false,
    closeOnPressEscape: false,
    onConfirm: onSubmit,
});
/**
 * 模型抽屉表单实例
 */
const [Form, formApi] = useVbenForm({
    // 所有表单项共用，可单独在表单内覆盖
    commonConfig: {
        // 所有表单项
        componentProps: {
            class: 'w-full',
        },
    },
    showDefaultActions: false,
    // 垂直布局，label和input在不同行，值为vertical
    // 水平布局，label和input在同一行
    layout: 'horizontal',
    schema: [
        {
            component: 'Select',
            componentProps: {
                allowClear: true,
                filterOption: true,
                options: computed(() => modelProviderList.value.map((item) => ({
                    label: item.name,
                    value: item.id,
                }))),
                placeholder: '请选择',
                showSearch: true,
            },
            fieldName: 'providerId',
            label: '供应商',
            rules: 'selectRequired',
        },
        {
            component: 'Input',
            componentProps: {
                placeholder: 'Deepseek-V4-Pro',
            },
            fieldName: 'name',
            label: '名称',
            rules: z.string().min(1, { message: '最少输入1个字符' }).max(30, { message: '最多输入50个字符' }),
        },
        {
            component: 'Input',
            componentProps: {
                placeholder: 'deepseek-v4-pro',
            },
            fieldName: 'modelName',
            label: '模型ID',
            help: '发起请求时使用的模型ID',
            rules: z.string().min(1, { message: '最少输入1个字符' }).max(100, { message: '最多输入100个字符' }),
        },
        {
            component: 'Input',
            componentProps: {
                placeholder: '请输入描述',
            },
            fieldName: 'description',
            label: '描述',
            rules: z.string().min(1, { message: '最少输入1个字符' }).max(260, { message: '最多输入260个字符' }),
        },
        {
            component: 'Select',
            componentProps: {
                allowClear: true,
                filterOption: true,
                options: [
                    { label: '高', value: 'high' },
                    { label: '低', value: 'low' },
                    { label: '中', value: 'medium' },
                    { label: '最小', value: 'minimal' },
                    { label: '无', value: 'none' },
                    { label: '超高', value: 'xhigh' },
                ],
                placeholder: '请选择',
                showSearch: true,
            },
            defaultValue: 'high',
            fieldName: 'reasoningEffort',
            label: '推理',
            rules: 'selectRequired',
        },
        {
            component: 'Switch',
            defaultValue: true,
            fieldName: 'canInputText',
            label: '输入文本',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: true,
            fieldName: 'canOutputText',
            label: '输出文本',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'canInputImage',
            label: '输入图片',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'canOutputImage',
            label: '输出图片',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'canInputAudio',
            label: '输入音频',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'canOutputAudio',
            label: '输出音频',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'canInputVideo',
            label: '输入视频',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'canOutputVideo',
            label: '输出视频',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: true,
            fieldName: 'isActive',
            label: '是否启用',
            wrapperClass: 'w-12'
        },
        {
            component: 'Switch',
            defaultValue: false,
            fieldName: 'isDefault',
            label: '是否默认',
            wrapperClass: 'w-12'
        },
        {
            component: 'InputNumber',
            componentProps: {
                min: 0,
                max: 100,
            },
            defaultValue: 0,
            fieldName: 'sortOrder',
            label: '排序',
        },
    ],
    wrapperClass: 'grid-cols-1',
});

/**
 * 添加模型
 */
const handleAddClick = () => {
    drawerApi.setState({ title: "添加模型" });
    drawerApi.open();
}

/**
 * 提交表单
 */
function onSubmit() {
    formApi.validateAndSubmitForm()
        .then((values) => {
            if (values) {
                drawerApi.lock();
                addOrUpdateModelApi(values as AiApi.AddOrUpdateModelParams)
                    .then(() => {
                        gridApi.reload();
                    })
                    .finally(() => {
                        drawerApi.unlock();
                        drawerApi.close();
                        formApi.resetForm();
                    })
            }
        })
}

/**
 * 编辑模型
 */
const handleEditClick = (row: Model) => {
    drawerApi.setState({ title: "编辑模型" });
    formApi.setValues(row, false);
    drawerApi.open();
}

/**
 * 删除模型
 */
const handleDeleteClick = (row: Model) => {
    Modal.confirm({
        title: '确认删除吗？',
        okText: '确认',
        okType: 'danger',
        onOk: () => {
            gridApi.setLoading(true);
            deleteModelApi(row.id)
                .then(() => {
                    gridApi.setLoading(false);
                    gridApi.reload();
                })
                .catch(() => {
                    gridApi.setLoading(false);
                })
        }
    })
}

onMounted(() => {
    // 初始化模型列表
    getModelProviderApi().then((res) => {
        modelProviderList.value = res || [];
    })
})
</script>

<template>
    <div class="vp-raw w-full">
        <!-- 抽屉 -->
        <Drawer>
            <!-- 表单 -->
            <Form />
        </Drawer>
        <!-- 表格 -->
        <Grid>
            <template #toolbar-tools>
                <VbenButton @click="handleAddClick">
                    添加模型
                </VbenButton>
            </template>
            <template #is-active="{ row }">
                <Tag :color="row.isActive ? 'success' : 'default'">{{ row.isActive ? '已启用' : '已禁用' }}</Tag>
            </template>
            <template #is-default="{ row }">
                <Tag :bordered="false" :color="row.isDefault ? 'success' : 'default'">
                    {{ row.isDefault ? '默认' : '-' }}
                </Tag>
            </template>
            <template #action="{ row }">
                <Button type="link" @click="handleEditClick(row)">编辑</Button>
                <Button danger type="link" @click="handleDeleteClick(row)">删除</Button>
            </template>
        </Grid>
    </div>
</template>

<style scoped></style>