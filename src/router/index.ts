import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CarritoView from '../views/CarritoView.vue'
import CheckoutView from '../views/Checkout.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import { authGuard, guestGuard } from './guards'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/carrito',
    name: 'carrito',
    component: CarritoView
  },
  {
    path: '/producto/:id',
    name: 'productoDetalle',
    component: ProductDetailView
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  // Ruta de ejemplo protegida
  // {
  //   path: '/perfil',
  //   name: 'perfil',
  //   component: () => import('../views/PerfilView.vue'),
  //   meta: { requiresAuth: true }
  // },
  // Ruta de ejemplo solo para invitados
  // {
  //   path: '/registro',
  //   name: 'registro',
  //   component: () => import('../views/RegistroView.vue'),
  //   meta: { guestOnly: true }
  // }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Aplicar guards de navegación
router.beforeEach((to, from, next) => {
  // Aplicar guard de autenticación
  authGuard(to, from, (result) => {
    if (result !== undefined) {
      return next(result);
    }
    
    // Aplicar guard de invitado
    guestGuard(to, from, (result) => {
      if (result !== undefined) {
        return next(result);
      }
      
      next();
    });
  });
});

export default router
