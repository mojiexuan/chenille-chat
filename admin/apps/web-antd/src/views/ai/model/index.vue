<script setup lang="ts" name="Provider">
import type { ModelProvider } from '@vben/types';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { AiApi } from '#/api';

import { useVbenDrawer, VbenButton } from '@vben/common-ui';

import { Button, Modal, Tag } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { addOrUpdateModelProviderApi, deleteModelProviderApi, getModelProviderApi } from '#/api';

/**
 * 模型供应商表格配置
 */
const gridOptions: VxeGridProps<ModelProvider> = {
    columns: [
        { title: '序号', type: 'seq', width: 50 },
        { field: 'provider', title: '品牌' },
        { field: 'name', title: '名称' },
        { field: 'apiKey', title: 'API Key' },
        { field: 'baseUrl', title: 'Base URL' },
        { field: 'isActive', title: '状态', slots: { default: 'is-active' } },
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
                const items = await getModelProviderApi();
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
 * 模型供应商表格实例
 */
const [Grid, gridApi] = useVbenVxeGrid({
    gridOptions,
});
/**
 * 模型供应商抽屉实例
 */
const [Drawer, drawerApi] = useVbenDrawer({
    closeOnClickModal: false,
    closeOnPressEscape: false,
    onConfirm: onSubmit,
});
/**
 * 模型供应商抽屉表单实例
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
                options: [
                    {
                        label: 'Deepseek',
                        value: 'deepseek',
                    },
                    {
                        label: 'OpenAI',
                        value: 'openai',
                    },
                    {
                        label: 'Google',
                        value: 'google',
                    },
                    {
                        label: 'Anthropic',
                        value: 'anthropic',
                    },
                ],
                placeholder: '请选择',
                showSearch: true,
            },
            defaultValue: "deepseek",
            fieldName: 'provider',
            label: '品牌',
            rules: 'selectRequired',
        },
        {
            component: 'Input',
            componentProps: {
                placeholder: '请输入供应商名称',
            },
            defaultValue: 'Deepseek',
            fieldName: 'name',
            label: '名称',
            rules: z.string().min(1, { message: '最少输入1个字符' }).max(30, { message: '最多输入50个字符' }),
        },
        {
            component: 'Input',
            componentProps: {
                placeholder: '请输入API Key',
            },
            fieldName: 'apiKey',
            label: 'API Key',
            rules: z.string().min(1, { message: '最少输入1个字符' }).max(260, { message: '最多输入260个字符' }),
        },
        {
            component: 'Input',
            componentProps: {
                placeholder: '请输入Base URL',
            },
            defaultValue: 'https://api.deepseek.com',
            fieldName: 'baseUrl',
            label: 'Base URL',
            rules: z.string().min(1, { message: '最少输入1个字符' }).max(260, { message: '最多输入260个字符' }),
        },
        {
            component: 'Switch',
            defaultValue: true,
            fieldName: 'isActive',
            label: '是否启用',
            wrapperClass: 'w-12'
        },
    ],
    wrapperClass: 'grid-cols-1',
});

/**
 * 添加模型供应商
 */
const handleAddClick = () => {
    drawerApi.setState({ title: "添加模型供应商" });
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
                addOrUpdateModelProviderApi(values as AiApi.AddOrUpdateModelProviderParams)
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
 * 编辑模型供应商
 */
const handleEditClick = (row: ModelProvider) => {
    drawerApi.setState({ title: "编辑模型供应商" });
    formApi.setValues(row, false);
    drawerApi.open();
}

/**
 * 删除模型供应商
 */
const handleDeleteClick = (row: ModelProvider) => {
    Modal.confirm({
        title: '确认删除吗？',
        okText: '确认',
        okType: 'danger',
        onOk: () => {
            gridApi.setLoading(true);
            deleteModelProviderApi(row.id)
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
                    添加模型供应商
                </VbenButton>
            </template>
            <template #is-active="{ row }">
                <Tag :color="row.isActive ? 'success' : 'default'">{{ row.isActive ? '已启用' : '已禁用' }}</Tag>
            </template>
            <template #action="{ row }">
                <Button type="link" @click="handleEditClick(row)">编辑</Button>
                <Button danger type="link" @click="handleDeleteClick(row)">删除</Button>
            </template>
        </Grid>
    </div>
</template>

<style scoped></style>