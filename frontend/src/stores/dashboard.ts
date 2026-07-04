import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '@/api/http';

export interface DashboardSummary {
  projectCount: number;
  activeUsers: number;
  totalTasks: number;
  doneTasks: number;
  completionRate: number;
  taskCounts: Record<'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE', number>;
}

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null);

  async function fetchSummary() {
    const { data } = await http.get<DashboardSummary>('/dashboard/summary');
    summary.value = data;
  }

  return {
    summary,
    fetchSummary,
  };
});
