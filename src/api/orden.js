// src/api/orden.js
import backendClient from './backendClient';

export default {
  /**
   * Crear una nueva orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise} - Orden creada
   */
  async createOrder(orderData) {
    try {
      const direccion = orderData.direccionEnvio || orderData.shippingInfo || {};

      const ordenData = {
        usuarioId: orderData.usuarioId,
        emailContacto: orderData.emailContacto || orderData.email || null,
        subtotal: parseFloat(orderData.subtotal),
        iva: parseFloat(orderData.iva),
        costoEnvio: parseFloat(orderData.costoEnvio),
        total: parseFloat(orderData.total),
        metodoPago: orderData.metodoPago,
        notas: orderData.notas || '',
        items: orderData.items.map(item => ({
          productoIdStrapi: item.id,
          productoNombre: item.nombre,
          productoDescripcion: item.descripcion || '',
          productoImagenUrl: item.images && item.images.length > 0 
            ? item.images[0].url 
            : '',
          precioUnitario: parseFloat(item.precio),
          cantidad: item.quantity,
          subtotal: parseFloat(item.precio) * item.quantity
        })),
        direccionEnvio: {
          nombreCompleto: direccion.nombreCompleto || direccion.fullName || '',
          calle: direccion.calle || direccion.address || '',
          ciudad: direccion.ciudad || '',
          comuna: direccion.comuna || '',
          region: direccion.region || '',
          codigoPostal: direccion.codigoPostal || direccion.postalCode || '',
          telefono: direccion.telefono || direccion.phone || '',
          referencia: direccion.referencia || ''
        }
      };

      console.log('📦 Creando orden en backend:', ordenData);
      const response = await backendClient.post('/pedidos', ordenData);
      console.log('✅ Orden creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Obtener orden por ID
   * @param {number} orderId - ID de la orden
   * @returns {Promise} - Datos de la orden
   */
  async getOrderById(orderId) {
    try {
      const response = await backendClient.get(`/pedidos/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Obtener órdenes por usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Lista de órdenes
   */
  async getOrdersByUser(userId) {
    try {
      const response = await backendClient.get(`/pedidos/usuario/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Obtener orden por número de orden
   * @param {string} orderNumber - Número de orden
   * @returns {Promise} - Datos de la orden
   */
  async getOrderByNumber(orderNumber) {
    try {
      const response = await backendClient.get(`/pedidos/numero/${orderNumber}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching order by number:', error);
      throw error;
    }
  },

  /**
   * Tracking de pedido guest: requiere número de orden + email de contacto
   * @param {string} orderNumber - Número de orden
   * @param {string} email - Email de contacto del pedido
   * @returns {Promise} - Datos de la orden
   */
  async trackGuestOrder(orderNumber, email) {
    try {
      const response = await backendClient.get('/pedidos/guest/tracking', {
        params: { numeroOrden: orderNumber, emailContacto: email }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      console.error('Error tracking guest order:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de la orden (transiciones admin validadas en la API)
   * @param {number} orderId - ID de la orden
   * @param {string} estado - Nuevo estado
   * @returns {Promise} - Orden actualizada
   */
  async updateOrderStatus(orderId, estado) {
    try {
      const response = await backendClient.patch(`/pedidos/${orderId}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Obtener órdenes por email (para usuarios invitados)
   * @param {string} email - Email del usuario
   * @returns {Promise} - Lista de órdenes
   */
  async getOrdersByEmail(email) {
    try {
      const response = await backendClient.get(`/pedidos/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      throw error;
    }
  }
};
