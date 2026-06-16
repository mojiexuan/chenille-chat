import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
    {
        component: BasicLayout,
        meta: {
            // badgeType: 'dot',
            icon: 'lucide:bot',
            order: 1,
            title: $t('page.ai.title'),
        },
        name: 'Ai',
        path: '/',
        children: [
            {
                name: 'Provider',
                path: '/ai/provider',
                component: () => import('#/views/ai/provider/index.vue'),
                meta: {
                    icon: 'lucide:server',
                    order: 3,
                    title: $t('page.ai.provider.title'),
                },
            },
            {
                name: 'Model',
                path: '/ai/model',
                component: () => import('#/views/ai/model/index.vue'),
                meta: {
                    icon: 'lucide:cpu',
                    order: 2,
                    title: $t('page.ai.model.title'),
                },
            },
            {
                name: 'Agent',
                path: '/ai/agent',
                component: () => import('#/views/ai/agent/index.vue'),
                meta: {
                    icon: 'lucide:sparkles',
                    order: 1,
                    title: $t('page.ai.agent.title'),
                },
            },
        ],
    },
];

export default routes;
