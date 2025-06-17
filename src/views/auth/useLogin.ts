import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();

  const loading = ref(false);
  const error = ref('');

  const form = ref({
    email: '',
    password: '',
    remember: false
  });

  async function handleLogin() {
    if (loading.value) return;
    
    error.value = '';
    loading.value = true;
    
    try {
      const result = await authStore.login(form.value.email, form.value.password);
      
      if (result.success) {
        // Redirigir a la página anterior o a la página principal
        router.push('/');
      } else {
        error.value = result.message || 'Error al iniciar sesión';
      }
    } catch (err) {
      console.error('Error en el login:', err);
      error.value = 'Ocurrió un error al intentar iniciar sesión';
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    form,
    handleLogin
  };
}
