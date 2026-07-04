import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '@/api/http';
import type { AuthUser } from '@/types/auth';

export interface ProjectMember {
  id: string;
  userId: string;
  user: AuthUser;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'DONE';
  managerId: string;
  manager: AuthUser;
  members: ProjectMember[];
  _count?: { tasks: number };
}

export interface ProjectPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'DONE';
  managerId: string;
  memberIds: string[];
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<ProjectSummary[]>([]);
  const selectedProjectId = ref<string | null>(null);
  const loading = ref(false);

  async function fetchProjects() {
    loading.value = true;

    try {
      const { data } = await http.get<ProjectSummary[]>('/projects');
      projects.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function createProject(payload: ProjectPayload) {
    const { data } = await http.post<ProjectSummary>('/projects', payload);
    projects.value = [data, ...projects.value];
  }

  async function updateProject(id: string, payload: Partial<ProjectPayload>) {
    const { data } = await http.patch<ProjectSummary>(`/projects/${id}`, payload);
    const index = projects.value.findIndex((project) => project.id === id);

    if (index >= 0) {
      projects.value[index] = data;
    }
  }

  async function deleteProject(id: string) {
    await http.delete(`/projects/${id}`);
    projects.value = projects.value.filter((project) => project.id !== id);
  }

  function setProjects(nextProjects: ProjectSummary[]) {
    projects.value = nextProjects;
  }

  function selectProject(projectId: string) {
    selectedProjectId.value = projectId;
  }

  return {
    projects,
    selectedProjectId,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setProjects,
    selectProject,
  };
});
