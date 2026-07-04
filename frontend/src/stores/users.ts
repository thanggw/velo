import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '@/api/http';
import type { AuthUser } from '@/types/auth';

export const useUsersStore = defineStore('users', () => {
  const users = ref<AuthUser[]>([]);
  const managers = ref<AuthUser[]>([]);
  const members = ref<AuthUser[]>([]);

  async function fetchUsers() {
    const { data } = await http.get<AuthUser[]>('/users');
    users.value = data;
  }

  async function fetchManagers() {
    const { data } = await http.get<AuthUser[]>('/users/managers');
    managers.value = data;
  }

  async function fetchMembers() {
    const { data } = await http.get<AuthUser[]>('/users/members');
    members.value = data;
  }

  return {
    users,
    managers,
    members,
    fetchUsers,
    fetchManagers,
    fetchMembers,
  };
});
