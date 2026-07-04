<template>
  <main class="page">
    <header class="page-header">
      <div class="page-title">
        <h1>Projects</h1>
        <p>Manage project ownership, teams, timelines, and open the Kanban board.</p>
      </div>
      <div class="toolbar-actions">
        <el-button type="primary" :icon="Plus" v-permission="'ADMIN'" @click="openCreate">Create Project</el-button>
      </div>
    </header>

    <section class="panel table-panel">
      <el-table v-loading="projectStore.loading" :data="projectStore.projects" row-key="id">
        <el-table-column prop="name" label="Name" min-width="210">
          <template #default="{ row }">
            <div class="project-name">
              <strong>{{ row.name }}</strong>
              <span>{{ row.description || 'No description' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Manager" min-width="170">
          <template #default="{ row }">{{ row.manager?.fullName }}</template>
        </el-table-column>
        <el-table-column label="Members" width="110" align="center">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.members.length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="130">
          <template #default="{ row }">
            <el-tag :type="row.status === 'DONE' ? 'success' : 'primary'" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Tasks" width="110" align="center">
          <template #default="{ row }">{{ row._count?.tasks ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="300" fixed="right">
          <template #default="{ row }">
            <el-button :icon="Grid" @click="router.push(`/projects/${row.id}/kanban`)">Kanban</el-button>
            <el-button :icon="Edit" v-permission="['ADMIN', 'MANAGER']" @click="openEdit(row)">Edit</el-button>
            <el-button :icon="Delete" v-permission="'ADMIN'" type="danger" plain @click="remove(row.id)">Delete</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="No projects yet" />
        </template>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="editingId ? 'Edit project' : 'Create project'" width="580px">
      <el-form label-position="top">
        <el-form-item label="Name">
          <el-input v-model="form.name" placeholder="Sprint delivery platform" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Project goal, scope, or notes" />
        </el-form-item>
        <el-form-item label="Dates">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="Start"
            end-placeholder="End"
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status">
            <el-option label="Active" value="ACTIVE" />
            <el-option label="Done" value="DONE" />
          </el-select>
        </el-form-item>
        <el-form-item label="Manager">
          <el-select v-model="form.managerId" filterable>
            <el-option v-for="manager in usersStore.managers" :key="manager.id" :label="manager.fullName" :value="manager.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Members">
          <el-select v-model="form.memberIds" multiple filterable collapse-tags collapse-tags-tooltip>
            <el-option v-for="member in usersStore.members" :key="member.id" :label="member.fullName" :value="member.id" />
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
import { Delete, Edit, Grid, Plus } from '@element-plus/icons-vue';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore, type ProjectPayload, type ProjectSummary } from '@/stores/project';
import { useUsersStore } from '@/stores/users';

const router = useRouter();
const projectStore = useProjectStore();
const usersStore = useUsersStore();
const dialogVisible = ref(false);
const editingId = ref<string | null>(null);
const dateRange = ref<[string, string] | null>(null);
const form = reactive<ProjectPayload>({
  name: '',
  description: '',
  startDate: '',
  endDate: null,
  status: 'ACTIVE',
  managerId: '',
  memberIds: [],
});

function resetForm() {
  editingId.value = null;
  dateRange.value = null;
  Object.assign(form, {
    name: '',
    description: '',
    startDate: '',
    endDate: null,
    status: 'ACTIVE',
    managerId: '',
    memberIds: [],
  });
}

async function openCreate() {
  resetForm();
  await Promise.all([usersStore.fetchManagers(), usersStore.fetchMembers()]);
  dialogVisible.value = true;
}

async function openEdit(project: ProjectSummary) {
  resetForm();
  await Promise.all([usersStore.fetchManagers(), usersStore.fetchMembers()]);
  editingId.value = project.id;
  dateRange.value = [project.startDate.slice(0, 10), project.endDate?.slice(0, 10) ?? project.startDate.slice(0, 10)];
  Object.assign(form, {
    name: project.name,
    description: project.description ?? '',
    status: project.status,
    managerId: project.managerId,
    memberIds: project.members.map((member) => member.userId),
  });
  dialogVisible.value = true;
}

async function save() {
  form.startDate = dateRange.value?.[0] ?? new Date().toISOString().slice(0, 10);
  form.endDate = dateRange.value?.[1] ?? null;

  if (editingId.value) {
    await projectStore.updateProject(editingId.value, form);
    ElMessage({ message: 'Project updated', type: 'success', customClass: 'app-toast' });
  } else {
    await projectStore.createProject(form);
    ElMessage({ message: 'Project created', type: 'success', customClass: 'app-toast' });
  }

  dialogVisible.value = false;
}

async function remove(id: string) {
  await ElMessageBox.confirm('Delete this project?', 'Confirm', {
    confirmButtonText: 'Delete',
    confirmButtonClass: 'el-button--danger',
    type: 'warning',
  });
  await projectStore.deleteProject(id);
  ElMessage({ message: 'Project deleted', type: 'success', customClass: 'app-toast' });
}

onMounted(projectStore.fetchProjects);
</script>

<style scoped>
.table-panel {
  overflow-x: auto;
  overflow-y: hidden;
}

.table-panel :deep(.el-table) {
  min-width: 920px;
}

.project-name {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }

  span {
    font-size: 13px;
    color: #909399;
    line-height: 1.4;
  }
}

.el-date-editor,
.el-select {
  width: 100%;
}

@media (max-width: 720px) {
  .table-panel {
    margin-right: -14px;
    margin-left: -14px;
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  .table-panel :deep(.el-table) {
    border-radius: 0;
  }

  .table-panel :deep(.el-button) {
    padding-right: 10px;
    padding-left: 10px;
  }
}
</style>
