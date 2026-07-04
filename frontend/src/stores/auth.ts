import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { http } from '@/api/http';
import type { AuthUser, Role } from '@/types/auth';

const TOKEN_KEY = 'velo.accessToken';
const USER_KEY = 'velo.user';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<AuthUser | null>(readStoredUser());

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const role = computed<Role | null>(() => user.value?.role ?? null);

  function setSession(token: string, authUser: AuthUser) {
    accessToken.value = token;
    user.value = authUser;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }

  function clearSession() {
    accessToken.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function hasRole(allowedRoles?: Role[]) {
    return !allowedRoles?.length || Boolean(role.value && allowedRoles.includes(role.value));
  }

  async function login(payload: { email: string; password: string }) {
    const { data } = await http.post<{ accessToken: string; user: AuthUser }>('/auth/login', payload);
    setSession(data.accessToken, data.user);
  }

  async function register(payload: { email: string; password: string; fullName: string; role: Role }) {
    const { data } = await http.post<{ accessToken: string; user: AuthUser }>('/auth/register', payload);
    setSession(data.accessToken, data.user);
  }

  async function refresh() {
    const { data } = await http.post<{ accessToken: string; user: AuthUser }>('/auth/refresh');
    setSession(data.accessToken, data.user);
  }

  async function fetchMe() {
    if (!accessToken.value) {
      return;
    }

    const { data } = await http.get<{ user: AuthUser }>('/auth/me');
    user.value = data.user;
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  async function updateProfile(payload: { fullName?: string; avatarUrl?: string | null }) {
    const { data } = await http.patch<AuthUser>('/users/me', payload);
    user.value = data;
    localStorage.setItem(USER_KEY, JSON.stringify(data));
  }

  async function logout() {
    try {
      await http.post('/auth/logout');
    } finally {
      clearSession();
    }
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    role,
    login,
    register,
    refresh,
    fetchMe,
    updateProfile,
    logout,
    setSession,
    clearSession,
    hasRole,
  };
});

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}
