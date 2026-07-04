<template>
  <main class="page profile-page">
    <header class="page-header">
      <div class="page-title">
        <h1>Profile</h1>
        <p>Keep your account details current for project assignment and team visibility.</p>
      </div>
    </header>

    <section class="panel profile-shell">
      <div class="profile-summary">
        <el-avatar :size="88" :src="avatarPreview || undefined">
          {{ initials }}
        </el-avatar>
        <div>
          <h2>{{ form.fullName || 'Profile' }}</h2>
          <p>{{ authStore.user?.email }}</p>
          <el-tag type="info" effect="plain">{{ authStore.user?.role }}</el-tag>
        </div>
      </div>

      <el-form class="profile-form" label-position="top" @submit.prevent>
        <el-form-item label="Full name">
          <el-input v-model="form.fullName" placeholder="Your full name" />
        </el-form-item>

        <el-form-item label="Email">
          <el-input :model-value="authStore.user?.email" disabled />
        </el-form-item>

        <el-form-item label="Avatar URL">
          <el-input v-model="form.avatarUrl" placeholder="https://example.com/avatar.png" clearable />
        </el-form-item>

        <div class="actions">
          <el-button :disabled="loading" @click="resetForm">Reset</el-button>
          <el-button type="primary" :loading="loading" @click="saveProfile">Save profile</el-button>
        </div>
      </el-form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const form = reactive({
  fullName: '',
  avatarUrl: '',
});

const avatarPreview = computed(() => form.avatarUrl.trim());
const initials = computed(() => {
  const source = form.fullName || authStore.user?.email || 'V';
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
});

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchMe();
  }

  resetForm();
});

function resetForm() {
  form.fullName = authStore.user?.fullName ?? '';
  form.avatarUrl = authStore.user?.avatarUrl ?? '';
}

async function saveProfile() {
  loading.value = true;

  try {
    await authStore.updateProfile({
      fullName: form.fullName.trim(),
      avatarUrl: form.avatarUrl.trim() || null,
    });
    resetForm();
    ElMessage({ message: 'Profile updated', type: 'success', customClass: 'app-toast' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.profile-shell {
  width: min(760px, 100%);
  padding: 24px;
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--velo-border-soft);
}

h2 {
  margin: 0;
  font-size: 26px;
  line-height: 1.2;
}

p {
  margin: 6px 0 10px;
  color: var(--velo-muted);
}

.profile-form {
  margin-top: 22px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 560px) {
  .profile-shell {
    padding: 18px;
  }

  .profile-summary {
    align-items: flex-start;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions .el-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
