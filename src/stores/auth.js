import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);
  const returnUrl = ref(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.tipo === 'admin');

  async function login(email, password) {
    try {
      const data = await authApi.login(email, password);

      user.value = data.usuario;
      token.value = data.access_token;

      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('token', token.value);

      if (user.value.tipo === 'admin') {
        router.push(returnUrl.value || '/admin/pedidos');
      } else {
        router.push(returnUrl.value || '/');
      }

      returnUrl.value = null;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  }

  async function register(data) {
    try {
      const response = await authApi.register(data);

      user.value = response.usuario;
      token.value = response.access_token;

      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('token', token.value);

      router.push('/');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario'
      };
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  }

  function setReturnUrl(url) {
    returnUrl.value = url;
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    setReturnUrl
  };
});
