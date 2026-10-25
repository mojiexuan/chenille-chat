import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'
import { useAuth } from '@/composables'

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'default' | 'blank'; // 布局类型
    requiresAuth?: boolean; // 是否需要登录
    title?: string; // 页面标题
    needBack?: boolean; // 是否需要返回按钮
    redirectName?: string; // 返回按钮的路由名称
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  // 使用默认布局的路由
  {
    path: '/',
    component: DefaultLayout,
    meta: { layout: 'default' },
    children: [
      {
        path: 'home/:sessionId?',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页', requiresAuth: true },
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('@/views/settings/SettingView.vue'),
        meta: { title: '设置', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/settings/user/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true, needBack: true, redirectName: 'Setting' },
      },
      {
        path: 'team',
        name: 'TeamIndex',
        component: () => import('@/views/settings/team/IndexView.vue'),
        meta: { title: '团队管理', requiresAuth: true, needBack: true, redirectName: 'Setting' },
      },
      {
        path: 'agent/profile',
        name: 'AgentProfile',
        component: () => import('@/views/settings/agent/ProfileView.vue'),
        meta: { title: '个性化', requiresAuth: true, needBack: true, redirectName: 'Setting' },
      },
    ],
  },
  // 使用空白布局的路由（如登录页）
  // {
  //   path: '/',
  //   component: BlankLayout,
  //   meta: { layout: 'default' },
  //   children: [
  //     {
  //       path: 'home',
  //       name: 'Home',
  //       component: () => import('@/views/HomeView.vue'),
  //       meta: { title: '首页', requiresAuth: true },
  //     },
  //   ],
  // },
  // 404兜底
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/**
 * 全局前置守卫：需要权限的路由在未登录时跳转登录页
 */
router.beforeEach(async (to) => {
  // 设置页面标题
  // if (to.meta.title) {
  //   document.title = `${to.meta.title}`;
  // }

  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (!userStore.isLogin) {
      await userStore.checkLogin();
    }
    if (!userStore.isLogin) {
      useAuth().show();
    }
  }
});

export default router
