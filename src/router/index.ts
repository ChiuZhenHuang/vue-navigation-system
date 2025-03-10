import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/registerView.vue';
import LayoutView from '@/views/layoutView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/layout',
      name: 'layout',
      component: LayoutView,
      children: [
        {
          path: 'home',
          component: () => import('@/components/layout/Home.vue'),
        },
        {
          path: 'task',
          component: () => import('@/components/layout/Task.vue'),
        },
        {
          path: 'rank',
          component: () => import('@/components/layout/Rank.vue'),
        },
        {
          path: 'user-info',
          component: () => import('@/components/layout/UserInfo.vue'),
        },
        {
          path: 'car-setting',
          component: () => import('@/components/layout/CarSetting.vue'),
        },
      ],
    },
  ],
});

export default router;
