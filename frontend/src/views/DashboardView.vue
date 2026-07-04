<template>
  <main class="page">
    <header class="page-header">
      <div class="page-title">
        <h1>Admin Dashboard</h1>
        <p>Track project volume, active users, and task progress across the workspace.</p>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Refresh" :loading="loading" @click="load">Refresh</el-button>
      </div>
    </header>

    <section class="metrics" v-if="dashboard.summary">
      <article class="metric-card">
        <span>Projects</span>
        <strong>{{ dashboard.summary.projectCount }}</strong>
      </article>
      <article class="metric-card">
        <span>Active users</span>
        <strong>{{ dashboard.summary.activeUsers }}</strong>
      </article>
      <article class="metric-card">
        <span>Tasks done</span>
        <strong>{{ dashboard.summary.doneTasks }}/{{ dashboard.summary.totalTasks }}</strong>
      </article>
      <article class="metric-card">
        <span>Completion</span>
        <strong>{{ dashboard.summary.completionRate }}%</strong>
      </article>
    </section>

    <section class="panel chart" v-if="dashboard.summary">
      <div class="chart-header">
        <h2>Task status</h2>
        <span>{{ dashboard.summary.totalTasks }} total tasks</span>
      </div>
      <div v-for="item in statusBars" :key="item.status" class="bar-row">
        <span>{{ item.label }}</span>
        <div class="bar-track">
          <div class="bar-fill" :class="item.status.toLowerCase()" :style="{ width: item.width }" />
        </div>
        <b>{{ item.count }}</b>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useDashboardStore } from '@/stores/dashboard';

const dashboard = useDashboardStore();
const loading = ref(false);
const labels = {
  TODO: 'Todo',
  IN_PROGRESS: 'In progress',
  REVIEW: 'Review',
  DONE: 'Done',
};
const statusBars = computed(() => {
  const counts = dashboard.summary?.taskCounts;
  const max = Math.max(...Object.values(counts ?? { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 }), 1);

  return Object.entries(counts ?? {}).map(([status, count]) => ({
    status,
    label: labels[status as keyof typeof labels],
    count,
    width: `${Math.max((count / max) * 100, count ? 8 : 0)}%`,
  }));
});

async function load() {
  loading.value = true;

  try {
    await dashboard.fetchSummary();
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid var(--velo-border);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(23, 32, 51, 0.05);
}

.metric-card span,
.chart-header span {
  color: var(--velo-muted);
}

.metric-card strong {
  font-size: 30px;
  line-height: 1;
}

.chart {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chart h2 {
  margin: 0;
  font-size: 18px;
}

.bar-row {
  display: grid;
  grid-template-columns: 120px 1fr 44px;
  align-items: center;
  gap: 12px;
}

.bar-track {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #edf2f7;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: #2563eb;
}

.bar-fill.todo {
  background: #64748b;
}

.bar-fill.in_progress {
  background: #f59e0b;
}

.bar-fill.review {
  background: #8b5cf6;
}

.bar-fill.done {
  background: #10b981;
}

@media (max-width: 860px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .metrics,
  .bar-row {
    grid-template-columns: 1fr;
  }
}
</style>
