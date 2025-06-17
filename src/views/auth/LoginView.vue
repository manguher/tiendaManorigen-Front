<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

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
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Iniciar Sesión</h2>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            required
            autocomplete="email"
            autofocus
          >
        </div>
        
        <div class="form-group">
          <div class="d-flex justify-content-between">
            <label for="password">Contraseña</label>
            <router-link to="/forgot-password" class="forgot-password">
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            required
            autocomplete="current-password"
          >
        </div>
        
        <div class="form-group form-check">
          <input
            id="remember"
            v-model="form.remember"
            type="checkbox"
            class="form-check-input"
          >
          <label class="form-check-label" for="remember">
            Recordarme
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
        
        <div v-if="error" class="alert alert-danger mt-3">
          <span v-text="error"></span>
        </div>
      </form>
      
      <div class="auth-footer mt-3 text-center">
        ¿No tienes una cuenta? 
        <router-link to="/register" class="auth-link">Regístrate</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './login.css';
</style>
