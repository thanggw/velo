import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Role } from '@/types/auth';
import DashboardView from '@/views/DashboardView.vue';
import ForbiddenView from '@/views/ForbiddenView.vue';
import KanbanView from '@/views/KanbanView.vue';
import LoginView from '@/views/LoginView.vue';
import ProjectsView from '@/views/ProjectsView.vue';
import ProfileView from '@/views/ProfileView.vue';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: Role[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    redirect: '/projects',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['ADMIN'] },
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
  },
  {
    path: '/projects/:projectId/kanban',
    name: 'kanban',
    component: KanbanView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: ForbiddenView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (!authStore.hasRole(to.meta.roles)) {
    return { name: 'forbidden' };
  }

  return true;
});
