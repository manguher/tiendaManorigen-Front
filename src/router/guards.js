import { useAuthStore } from '@/stores/auth';

export function authGuard(to, from, next) {
  const authStore = useAuthStore();
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Guardar la URL a la que intentaban acceder
      authStore.setReturnUrl(to.fullPath);
      return next('/login');
    }
  }
  
  next();
}

export function guestGuard(to, from, next) {
  const authStore = useAuthStore();
  
  if (to.matched.some(record => record.meta.guestOnly) && authStore.isAuthenticated) {
    return next('/');
  }
  
  next();
}
