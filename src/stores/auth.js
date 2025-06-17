import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);
  const returnUrl = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    try {
      // Aquí iría la llamada a la API de autenticación
      // const response = await api.post('/auth/login', { email, password });
      
      // Simulamos una respuesta exitosa
      const response = {
        data: {
          user: { id: 1, email, name: email.split('@')[0] },
          token: 'fake-jwt-token'
        }
      };

      user.value = response.data.user;
      token.value = response.data.token;

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('token', token.value);

      // Redirigir a la página de origen o a la página principal
      router.push(returnUrl.value || '/');
      return { success: true };
    } catch (error) {
      console.error('Error en el login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
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
    login,
    logout,
    setReturnUrl
  };
});
