import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { Role } from '@/types/auth';

export const permission: Directive<HTMLElement, Role | Role[]> = {
  mounted(element, binding) {
    applyPermission(element, binding.value);
  },
  updated(element, binding) {
    applyPermission(element, binding.value);
  },
};

function applyPermission(element: HTMLElement, value: Role | Role[]) {
  const authStore = useAuthStore();
  const allowedRoles = Array.isArray(value) ? value : [value];

  element.style.display = authStore.hasRole(allowedRoles) ? '' : 'none';
}
