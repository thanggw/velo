import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { http } from '@/api/http';
import type { AuthUser } from '@/types/auth';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface KanbanTask {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  position: number;
  assigneeId?: string | null;
  assignee?: AuthUser | null;
  description?: string | null;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string | null;
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<KanbanTask[]>([]);
  const loading = ref(false);
  const columns = computed(() => ({
    TODO: sortedTasks('TODO'),
    IN_PROGRESS: sortedTasks('IN_PROGRESS'),
    REVIEW: sortedTasks('REVIEW'),
    DONE: sortedTasks('DONE'),
  }));

  async function fetchTasks(projectId: string) {
    loading.value = true;

    try {
      const { data } = await http.get<KanbanTask[]>(`/projects/${projectId}/tasks`);
      tasks.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function createTask(projectId: string, payload: TaskPayload) {
    const { data } = await http.post<KanbanTask>(`/projects/${projectId}/tasks`, payload);
    tasks.value.push(data);
  }

  async function updateTask(taskId: string, payload: Partial<TaskPayload>) {
    const { data } = await http.patch<KanbanTask>(`/tasks/${taskId}`, payload);
    replaceTask(data);
  }

  async function persistMove(taskId: string, status: TaskStatus, position: number) {
    const { data } = await http.patch<KanbanTask>(`/tasks/${taskId}/move`, { status, position });
    replaceTask(data);
  }

  async function deleteTask(taskId: string) {
    await http.delete(`/tasks/${taskId}`);
    tasks.value = tasks.value.filter((task) => task.id !== taskId);
  }

  function setTasks(nextTasks: KanbanTask[]) {
    tasks.value = nextTasks;
  }

  function moveTask(taskId: string, status: TaskStatus, position: number) {
    const task = tasks.value.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    task.status = status;
    task.position = position;
  }

  function replaceTask(task: KanbanTask) {
    const index = tasks.value.findIndex((item) => item.id === task.id);

    if (index >= 0) {
      tasks.value[index] = task;
    }
  }

  function sortedTasks(status: TaskStatus) {
    return tasks.value
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position);
  }

  return {
    tasks,
    columns,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    persistMove,
    deleteTask,
    setTasks,
    moveTask,
  };
});
