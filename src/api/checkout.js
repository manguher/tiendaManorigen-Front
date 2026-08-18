// src/api/checkout.js
import ordenApi from './orden';

export default {
  /**
   * Procesar checkout completo para usuario invitado
   * @param {Object} checkoutData - Datos del checkout
   * @returns {Promise} - Resultado del checkout
   */
  async processGuestCheckout(checkoutData) {
    try {
      const metodoPagoMap = {
        'tarjeta': 'Transbank',
        'transbank': 'Transbank',
        'transferencia': 'Transferencia',
        'efectivo': 'Efectivo'
      };
      
      const metodoPago = metodoPagoMap[checkoutData.paymentMethod] || 'Transbank';
      
      const orderData = {
        usuarioId: null, // null para invitados
        emailContacto: checkoutData.email, // Crucial enviar el email si no hay usuarioId
        subtotal: checkoutData.subtotal,
        iva: checkoutData.iva,
        costoEnvio: checkoutData.shippingCost,
        total: checkoutData.total,
        metodoPago: metodoPago,
        notas: checkoutData.notas || '',
        items: checkoutData.items, // ordenApi.createOrder ya mapea esto internamente
        direccionEnvio: {
          nombreCompleto: checkoutData.shippingInfo.fullName,
          calle: checkoutData.shippingInfo.address,
          ciudad: checkoutData.shippingInfo.city,
          comuna: checkoutData.shippingInfo.comuna,
          region: checkoutData.shippingInfo.region,
          codigoPostal: checkoutData.shippingInfo.postalCode,
          telefono: checkoutData.shippingInfo.phone,
          referencia: checkoutData.shippingInfo.referencia || ''
        }
      };
      
      console.log('📦 Creando orden autocontenida de invitado:', orderData);
      
      // Una sola llamada HTTP para crear todo
      const orden = await ordenApi.createOrder(orderData);
      
      return {
        success: true,
        orden,
        message: 'Orden creada exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error processing guest checkout:', error);
      
      return {
        success: false,
        error: error.message || 'Error al procesar la orden',
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
      const orden = await ordenApi.trackGuestOrder(orderNumber, email);
      
      if (!orden) {
        throw new Error('No se encontró un pedido con ese número de orden y correo');
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
