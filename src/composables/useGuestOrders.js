// src/composables/useGuestOrders.js
import { ref, computed } from 'vue';
import checkoutApi from '@/api/checkout';

export function useGuestOrders() {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref('');

  // Obtener órdenes por email
  const getOrdersByEmail = async (email) => {
    loading.value = true;
    error.value = '';
    
    try {
      const result = await checkoutApi.getGuestOrders(email);
      
      if (result.success) {
        orders.value = result.orders;
      } else {
        error.value = result.error || 'Error al obtener las órdenes';
      }
    } catch (err) {
      error.value = err.message || 'Error al obtener las órdenes';
    } finally {
      loading.value = false;
    }
  };

  // Obtener detalles de una orden específica
  const getOrderDetails = async (orderNumber, email) => {
    loading.value = true;
    error.value = '';
    
    try {
      const result = await checkoutApi.getOrderDetails(orderNumber, email);
      
      if (result.success) {
        return result.orden;
      } else {
        error.value = result.error || 'Error al obtener los detalles de la orden';
        return null;
      }
    } catch (err) {
      error.value = err.message || 'Error al obtener los detalles de la orden';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Obtener la última orden guardada en localStorage
  const getLastOrder = () => {
    try {
      const lastOrder = localStorage.getItem('lastGuestOrder');
      return lastOrder ? JSON.parse(lastOrder) : null;
    } catch (error) {
      console.error('Error al obtener la última orden:', error);
      return null;
    }
  };

  // Computed para verificar si hay órdenes
  const hasOrders = computed(() => orders.value.length > 0);

  // Computed para obtener órdenes ordenadas por fecha
  const sortedOrders = computed(() => {
    return [...orders.value].sort((a, b) => {
      const dateA = new Date(a.attributes.fechaOrden);
      const dateB = new Date(b.attributes.fechaOrden);
      return dateB - dateA; // Más recientes primero
    });
  });

  return {
    orders,
    loading,
    error,
    hasOrders,
    sortedOrders,
    getOrdersByEmail,
    getOrderDetails,
    getLastOrder
  };
}
