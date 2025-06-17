// src/api/checkout.js
import usuarioApi from './usuario';
import ordenApi from './orden';

export default {
  /**
   * Procesar checkout completo para usuario invitado
   * @param {Object} checkoutData - Datos del checkout
   * @returns {Promise} - Resultado del checkout
   */
  async processGuestCheckout(checkoutData) {
    try {
      // 1. Crear o encontrar el usuario invitado
      const userData = {
        email: checkoutData.email,
        nombre: checkoutData.shippingInfo.fullName,
        telefono: checkoutData.shippingInfo.phone
      };
      
      const usuario = await usuarioApi.createOrFindGuestUser(userData);
      
      // 2. Crear la orden asociada al usuario
      const orderData = {
        numeroOrden: checkoutData.orderNumber,
        usuarioId: usuario.id,
        metodoPago: checkoutData.paymentMethod,
        subtotal: checkoutData.subtotal,
        iva: checkoutData.iva,
        costoEnvio: checkoutData.shippingCost,
        total: checkoutData.total,
        shippingInfo: checkoutData.shippingInfo,
        items: checkoutData.items,
        userType: 'invitado',
        ip: checkoutData.ip,
        userAgent: checkoutData.userAgent
      };
      
      const orden = await ordenApi.createOrder(orderData);
      
      return {
        success: true,
        usuario,
        orden,
        message: 'Orden creada exitosamente'
      };
      
    } catch (error) {
      console.error('Error processing guest checkout:', error);
      return {
        success: false,
        error: error.message || 'Error al procesar la orden',
        details: error
      };
    }
  },

  /**
   * Confirmar pago y actualizar orden
   * @param {string} orderNumber - Número de orden
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise} - Resultado de la confirmación
   */
  async confirmOrderPayment(orderNumber, paymentData) {
    try {
      // Buscar la orden por número
      const orden = await ordenApi.getOrderByNumber(orderNumber);
      
      if (!orden) {
        throw new Error('Orden no encontrada');
      }
      
      // Confirmar el pago
      const updatedOrder = await ordenApi.confirmPayment(orden.id, paymentData);
      
      return {
        success: true,
        orden: updatedOrder,
        message: 'Pago confirmado exitosamente'
      };
      
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error.message || 'Error al confirmar el pago',
        details: error
      };
    }
  },

  /**
   * Buscar órdenes de un usuario invitado por email
   * @param {string} email - Email del usuario
   * @returns {Promise} - Lista de órdenes
   */
  async getGuestOrders(email) {
    try {
      const orders = await ordenApi.getOrdersByEmail(email);
      return {
        success: true,
        orders,
        message: 'Órdenes obtenidas exitosamente'
      };
    } catch (error) {
      console.error('Error fetching guest orders:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener las órdenes',
        details: error
      };
    }
  },

  /**
   * Obtener detalles de una orden específica
   * @param {string} orderNumber - Número de orden
   * @param {string} email - Email del usuario (para validación)
   * @returns {Promise} - Detalles de la orden
   */
  async getOrderDetails(orderNumber, email) {
    try {
      const orden = await ordenApi.getOrderByNumber(orderNumber);
      
      if (!orden) {
        throw new Error('Orden no encontrada');
      }
      
      // Verificar que el email coincida (seguridad básica)
      if (orden.attributes.usuario?.data?.attributes?.email !== email) {
        throw new Error('No tienes permisos para ver esta orden');
      }
      
      return {
        success: true,
        orden,
        message: 'Orden obtenida exitosamente'
      };
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener los detalles de la orden',
        details: error
      };
    }
  }
};
