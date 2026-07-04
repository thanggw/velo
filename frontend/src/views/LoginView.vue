<template>
  <main class="auth-page">
    <section class="auth-panel">
      <div class="auth-copy">
        <span class="brand-mark">V</span>
        <h1>Velo</h1>
        <p>Agile planning, task flow, and delivery visibility for focused teams.</p>
      </div>

      <el-tabs v-model="mode" stretch>
        <el-tab-pane label="Login" name="login">
          <el-form label-position="top" @submit.prevent>
            <el-form-item label="Email">
              <el-input v-model="loginForm.email" placeholder="admin@velo.local" size="large" />
            </el-form-item>
            <el-form-item label="Password">
              <el-input v-model="loginForm.password" type="password" show-password size="large" />
            </el-form-item>
            <el-button type="primary" size="large" :loading="loading" @click="submitLogin">Login</el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Register" name="register">
          <el-form label-position="top" @submit.prevent>
            <el-form-item label="Full name">
              <el-input v-model="registerForm.fullName" size="large" />
            </el-form-item>
            <el-form-item label="Email">
              <el-input v-model="registerForm.email" size="large" />
            </el-form-item>
            <el-form-item label="Password">
              <el-input v-model="registerForm.password" type="password" show-password size="large" />
            </el-form-item>
            <el-form-item label="Role">
              <el-select v-model="registerForm.role" size="large">
                <el-option label="Admin" value="ADMIN" />
                <el-option label="Manager" value="MANAGER" />
                <el-option label="Member" value="MEMBER" />
              </el-select>
            </el-form-item>
            <el-button type="primary" size="large" :loading="loading" @click="submitRegister">Create account</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Role } from '@/types/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const mode = ref<'login' | 'register'>('login');
const loading = ref(false);
const loginForm = reactive({
  email: '',
  password: '',
});
const registerForm = reactive({
  fullName: '',
  email: '',
  password: '',
  role: 'ADMIN' as Role,
});

async function submitLogin() {
  loading.value = true;

  try {
    await authStore.login(loginForm);
    ElMessage({ message: 'Welcome back', type: 'success', customClass: 'app-toast' });
    await router.push(String(route.query.redirect ?? '/projects'));
  } finally {
    loading.value = false;
  }
}

async function submitRegister() {
  loading.value = true;

  try {
    await authStore.register(registerForm);
    ElMessage({ message: 'Account created', type: 'success', customClass: 'app-toast' });
    await router.push(registerForm.role === 'ADMIN' ? '/dashboard' : '/projects');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.12), transparent 38%),
    linear-gradient(315deg, rgba(16, 185, 129, 0.11), transparent 36%),
    #f4f7fb;
}

.auth-panel {
  width: min(460px, 100%);
  padding: 30px;
  border: 1px solid var(--velo-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 70px rgba(23, 32, 51, 0.12);
}

.auth-copy {
  display: grid;
  gap: 8px;
  margin-bottom: 22px;
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
  color: #ffffff;
  background: #2563eb;
  font-weight: 800;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1;
}

p {
  margin: 0;
  color: var(--velo-muted);
  line-height: 1.55;
}

.el-button,
.el-select {
  width: 100%;
}
</style>
