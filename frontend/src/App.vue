<template>
  <router-view v-if="isPublicRoute" />
  <el-container v-else class="app-shell">
    <el-aside width="248px" class="sidebar">
      <div class="brand">
        <span class="brand-mark">V</span>
        <div>
          <h1>Velo</h1>
          <small>Scrum workspace</small>
        </div>
      </div>

      <el-menu router :default-active="$route.path" class="side-menu">
        <el-menu-item index="/dashboard" v-permission="'ADMIN'">
          <el-icon><DataBoard /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/projects">
          <el-icon><Folder /></el-icon>
          <span>Projects</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>Profile</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div class="topbar-title">
          <strong>{{ routeTitle }}</strong>
          <span>{{ routeSubtitle }}</span>
        </div>
        <div class="account">
          <el-avatar :size="34">{{ initials }}</el-avatar>
          <div>
            <strong>{{ authStore.user?.fullName }}</strong>
            <span>{{ authStore.role }}</span>
          </div>
          <el-button :icon="SwitchButton" @click="handleLogout">Logout</el-button>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DataBoard, Folder, SwitchButton, User } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isPublicRoute = computed(() => ['login', 'forbidden'].includes(String(route.name)));
const routeMeta = computed(() => {
  const map = {
    dashboard: ['Dashboard', 'Overview of delivery health and team activity'],
    projects: ['Projects', 'Plan, staff, and open each project board'],
    kanban: ['Kanban', 'Track the work moving through the sprint'],
    profile: ['Profile', 'Manage your account information'],
  } as Record<string, [string, string]>;

  return map[String(route.name)] ?? ['Workspace', 'Agile project management'];
});
const routeTitle = computed(() => routeMeta.value[0]);
const routeSubtitle = computed(() => routeMeta.value[1]);
const initials = computed(() => {
  const source = authStore.user?.fullName || authStore.user?.email || 'V';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

async function handleLogout() {
  await authStore.logout();
  await router.push('/login');
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.08), transparent 30%),
    var(--velo-bg);
}

.sidebar {
  border-right: 1px solid var(--velo-border);
  background: rgba(255, 255, 255, 0.92);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px 18px;
}

.brand-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 8px;
  color: #ffffff;
  background: #2563eb;
  font-weight: 800;
}

.brand h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.1;
}

.brand small {
  color: var(--velo-muted);
}

.side-menu {
  border-right: 0;
  padding: 6px 12px;
  background: transparent;
}

.side-menu :deep(.el-menu-item) {
  height: 42px;
  margin: 4px 0;
  border-radius: 8px;
  color: #405066;
}

.side-menu :deep(.el-menu-item.is-active) {
  color: #1d4ed8;
  background: var(--velo-primary-soft);
  font-weight: 700;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 20px;
  border-bottom: 1px solid var(--velo-border);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
}

.topbar-title {
  display: grid;
  gap: 3px;
}

.topbar-title strong,
.account strong {
  color: #172033;
}

.topbar-title span,
.account span {
  color: var(--velo-muted);
  font-size: 13px;
}

.account {
  display: flex;
  align-items: center;
  gap: 10px;
}

.account > div {
  display: grid;
  min-width: 130px;
}

.main-content {
  padding: 24px;
  min-width: 0;
}

@media (max-width: 900px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    width: 100% !important;
    border-right: 0;
    border-bottom: 1px solid var(--velo-border);
  }

  .brand {
    padding: 14px 16px 10px;
  }

  .brand-mark {
    width: 36px;
    height: 36px;
  }

  .brand h1 {
    font-size: 20px;
  }

  .side-menu {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 0 12px 12px;
    white-space: nowrap;
  }

  .side-menu :deep(.el-menu-item) {
    flex: 0 0 auto;
    margin: 0;
    padding: 0 14px;
  }

  .topbar {
    height: auto;
    min-height: 64px;
    align-items: flex-start;
    padding: 14px 16px;
  }

  .main-content {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
  }

  .topbar-title span {
    display: none;
  }

  .account {
    width: 100%;
    justify-content: space-between;
  }

  .account > div {
    min-width: 0;
    flex: 1;
  }

  .account strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account .el-button {
    flex: 0 0 auto;
  }

  .main-content {
    padding: 14px;
  }
}
</style>
