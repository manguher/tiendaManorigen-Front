<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Crear Cuenta</h2>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-control"
            required
            autocomplete="name"
            autofocus
          >
        </div>
        
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            required
            autocomplete="email"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            required
            autocomplete="new-password"
            minlength="8"
          >
          <small class="form-text text-muted">Mínimo 8 caracteres</small>
        </div>
        
        <div class="form-group">
          <label for="password_confirmation">Confirmar Contraseña</label>
          <input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            class="form-control"
            required
            autocomplete="new-password"
          >
        </div>
        
        <div class="form-group form-check">
          <input
            id="terms"
            v-model="form.terms"
            type="checkbox"
            class="form-check-input"
            required
          >
          <label class="form-check-label" for="terms">
            Acepto los <a href="/terminos" target="_blank" class="terms-link">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" class="terms-link">Política de Privacidad</a>
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>
        
        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>
      </form>
      
      <div class="auth-footer mt-3 text-center">
        ¿Ya tienes una cuenta? 
        <router-link to="/login" class="auth-link">Inicia Sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms: false
});

async function handleRegister() {
  if (loading.value) return;
  
  // Validar que las contraseñas coincidan
  if (form.value.password !== form.value.password_confirmation) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  // Validar términos y condiciones
  if (!form.value.terms) {
    error.value = 'Debes aceptar los términos y condiciones';
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  try {
    // Aquí iría la llamada a la API de registro
    // Simulamos un registro exitoso
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Después de registrar, hacemos login automáticamente
    const loginResult = await authStore.login(form.value.email, form.value.password);
    
    if (loginResult.success) {
      // Redirigir a la página principal
      router.push('/');
    } else {
      error.value = 'Registro exitoso, pero no se pudo iniciar sesión automáticamente. Por favor inicia sesión manualmente.';
    }
  } catch (err) {
    console.error('Error en el registro:', err);
    error.value = 'Ocurrió un error al intentar registrar la cuenta';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Estilos específicos para el registro */
@import './register.css';

.terms-link {
  color: #1976d2;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #6c757d;
}
</style>
