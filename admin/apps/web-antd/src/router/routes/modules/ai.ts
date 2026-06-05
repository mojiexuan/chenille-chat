import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
    {
        component: BasicLayout,
        meta: {
            // badgeType: 'dot',
            hideChildrenInMenu: true,
            icon: 'lucide:bot',
            order: 9999,
            title: $t('page.ai.title'),
        },
        name: 'Ai',
        path: '/',
        redirect: '/ai',
        children: [
            {
                path: '/ai',
                component: () => import('#/views/ai/index.vue'),
            }
        ],
    },
];

export default routes;
