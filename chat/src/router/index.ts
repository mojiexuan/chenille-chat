import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'

import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';

declare module 'vue-router' {
  interface RouteMeta {
    layout?: 'default' | 'blank';
    requiresAuth?: boolean;
    title?: string;
    needBack?: boolean;
    redirectName?: string;
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
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '首页', requiresAuth: true },
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('@/views/SettingView.vue'),
        meta: { title: '设置', requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true, needBack: true, redirectName: 'Setting' },
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
router.beforeEach((to) => {
  // 设置页面标题
  // if (to.meta.title) {
  //   document.title = `${to.meta.title}`;
  // }

  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (!userStore.isLogin) {
      userStore.logout();
    }
  }
});

export default router
