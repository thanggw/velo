import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const authStore = useAuthStore();

  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh') &&
      authStore.accessToken
    ) {
      originalRequest._retry = true;

      try {
        await authStore.refresh();
        originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
        return http(originalRequest);
      } catch {
        authStore.clearSession();
      }
    }

    ElMessage({
      message: getErrorMessage(error.response?.data?.message),
      type: 'error',
      customClass: 'app-toast',
      duration: 4200,
      showClose: true,
    });
    return Promise.reject(error);
  },
);

function getErrorMessage(message: unknown) {
  if (Array.isArray(message)) {
    return message.join('\n');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return 'Request failed';
}
