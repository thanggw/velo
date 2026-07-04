<template>
  <main class="page">
    <header class="page-header">
      <div class="page-title">
        <div class="title-row">
          <el-button :icon="ArrowLeft" @click="router.push('/projects')">Back</el-button>
          <h1>{{ currentProject?.name ?? 'Kanban Board' }}</h1>
        </div>
        <p>{{ currentProject?.description || 'Move work across the sprint from todo to done.' }}</p>
      </div>
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" v-permission="['ADMIN', 'MANAGER']" @click="openCreate">Create Task</el-button>
      </div>
    </header>

    <section class="board" v-loading="taskStore.loading">
      <article
        v-for="column in columns"
        :key="column.status"
        class="column"
        :class="column.status.toLowerCase()"
        @dragover.prevent
        @drop="handleDrop(column.status)"
      >
        <div class="column-header">
          <h2>{{ column.label }}</h2>
          <el-tag effect="plain">{{ taskStore.columns[column.status].length }}</el-tag>
        </div>

        <div class="task-list">
          <div
            v-for="(task, index) in taskStore.columns[column.status]"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="draggedTaskId = task.id"
            @drop.stop="handleDrop(column.status, index)"
            @dragover.prevent
          >
            <div class="task-title">
              <strong>{{ task.title }}</strong>
              <el-tag size="small" :type="priorityTag(task.priority)" effect="light">{{ task.priority }}</el-tag>
            </div>
            <p v-if="task.description">{{ task.description }}</p>
            <div class="task-meta">
              <span>{{ task.assignee?.fullName ?? 'Unassigned' }}</span>
              <span>#{{ task.position + 1 }}</span>
            </div>
            <div class="task-actions" v-permission="['ADMIN', 'MANAGER']">
              <el-button text :icon="Edit" @click="openEdit(task)">Edit</el-button>
              <el-button text :icon="Delete" type="danger" @click="remove(task.id)">Delete</el-button>
            </div>
          </div>

          <el-empty
            v-if="!taskStore.loading && taskStore.columns[column.status].length === 0"
            class="column-empty"
            description="No tasks"
            :image-size="54"
          />
        </div>
      </article>
    </section>

    <el-dialog v-model="dialogVisible" :title="editingTaskId ? 'Edit task' : 'Create task'" width="540px">
      <el-form label-position="top">
        <el-form-item label="Title">
          <el-input v-model="form.title" placeholder="Design sprint backlog" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Acceptance criteria or notes" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status">
            <el-option v-for="column in columns" :key="column.status" :label="column.label" :value="column.status" />
          </el-select>
        </el-form-item>
        <el-form-item label="Priority">
          <el-select v-model="form.priority">
            <el-option label="Low" value="LOW" />
            <el-option label="Medium" value="MEDIUM" />
            <el-option label="High" value="HIGH" />
          </el-select>
        </el-form-item>
        <el-form-item label="Assignee">
          <el-select v-model="form.assigneeId" clearable filterable>
            <el-option v-for="member in projectMembers" :key="member.id" :label="member.fullName" :value="member.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="save">Save</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, Delete, Edit, Plus } from '@element-plus/icons-vue';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import { useTaskStore, type KanbanTask, type TaskPayload, type TaskStatus } from '@/stores/task';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const taskStore = useTaskStore();
const projectId = computed(() => String(route.params.projectId));
const draggedTaskId = ref<string | null>(null);
const dialogVisible = ref(false);
const editingTaskId = ref<string | null>(null);
const columns: Array<{ status: TaskStatus; label: string }> = [
  { status: 'TODO', label: 'Todo' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'DONE', label: 'Done' },
];
const form = reactive<TaskPayload>({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  assigneeId: null,
});
const currentProject = computed(() => projectStore.projects.find((project) => project.id === projectId.value));
const projectMembers = computed(() => {
  const project = currentProject.value;

  if (!project) {
    return [];
  }

  const memberUsers = project.members.map((member) => member.user);
  return [project.manager, ...memberUsers].filter(Boolean);
});

function resetForm() {
  editingTaskId.value = null;
  Object.assign(form, {
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    assigneeId: null,
  });
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function openEdit(task: KanbanTask) {
  editingTaskId.value = task.id;
  Object.assign(form, {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId ?? null,
  });
  dialogVisible.value = true;
}

async function save() {
  if (editingTaskId.value) {
    await taskStore.updateTask(editingTaskId.value, form);
    ElMessage({ message: 'Task updated', type: 'success', customClass: 'app-toast' });
  } else {
    await taskStore.createTask(projectId.value, form);
    ElMessage({ message: 'Task created', type: 'success', customClass: 'app-toast' });
  }

  dialogVisible.value = false;
}

async function remove(taskId: string) {
  await ElMessageBox.confirm('Delete this task?', 'Confirm', {
    confirmButtonText: 'Delete',
    confirmButtonClass: 'el-button--danger',
    type: 'warning',
  });
  await taskStore.deleteTask(taskId);
  ElMessage({ message: 'Task deleted', type: 'success', customClass: 'app-toast' });
}

async function handleDrop(status: TaskStatus, index?: number) {
  if (!draggedTaskId.value) {
    return;
  }

  const position = index ?? taskStore.columns[status].length;
  taskStore.moveTask(draggedTaskId.value, status, position);
  await taskStore.persistMove(draggedTaskId.value, status, position);
  draggedTaskId.value = null;
}

function priorityTag(priority: KanbanTask['priority']) {
  return priority === 'HIGH' ? 'danger' : priority === 'MEDIUM' ? 'warning' : 'info';
}

async function loadBoard() {
  await Promise.all([projectStore.fetchProjects(), taskStore.fetchTasks(projectId.value)]);
}

onMounted(loadBoard);
watch(projectId, loadBoard);
</script>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-row h1 {
  margin: 0;
}

.board {
  display: grid;
  grid-template-columns: repeat(4, minmax(230px, 1fr));
  gap: 16px;
  min-height: 560px;
}

.column {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  min-height: 560px;
  padding: 14px;
  border: 1px solid var(--velo-border);
  border-top: 4px solid #64748b;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 32px rgba(23, 32, 51, 0.05);
}

.column.in_progress {
  border-top-color: #f59e0b;
}

.column.review {
  border-top-color: #8b5cf6;
}

.column.done {
  border-top-color: #10b981;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.column h2 {
  margin: 0;
  font-size: 16px;
}

.task-list {
  display: grid;
  align-content: start;
  gap: 12px;
}

.task-card {
  display: grid;
  gap: 10px;
  padding: 13px;
  border: 1px solid var(--velo-border-soft);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(23, 32, 51, 0.06);
  cursor: grab;
}

.task-card:hover {
  border-color: #bfdbfe;
}

.task-title,
.task-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-title strong {
  color: #172033;
}

.task-card p,
.task-meta {
  margin: 0;
  color: var(--velo-muted);
  font-size: 13px;
  line-height: 1.45;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--velo-border-soft);
  padding-top: 6px;
}

.column-empty {
  padding: 28px 0;
}

.el-select {
  width: 100%;
}

@media (max-width: 1100px) {
  .board {
    grid-template-columns: repeat(2, minmax(230px, 1fr));
    min-height: 0;
  }

  .column {
    min-height: 420px;
  }
}

@media (max-width: 640px) {
  .board {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .column {
    min-height: 320px;
  }

  .task-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .task-actions {
    justify-content: stretch;
  }

  .task-actions .el-button {
    flex: 1;
  }
}
</style>
