// src/api/orden.js
import axios from './index';

export default {
  /**
   * Crear una nueva orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise} - Orden creada
   */
  async createOrder(orderData) {
    try {
      const ordenData = {
        data: {
          numeroOrden: orderData.numeroOrden,
          usuario: orderData.usuarioId, // Relación con el usuario
          estado: 'pendiente',
          metodoPago: orderData.metodoPago,
          subtotal: parseFloat(orderData.subtotal),
          iva: parseFloat(orderData.iva),
          costoEnvio: parseFloat(orderData.costoEnvio),
          total: parseFloat(orderData.total),
          fechaOrden: new Date().toISOString(),
          
          // Información de envío
          direccionEnvio: {
            nombreCompleto: orderData.shippingInfo.fullName,
            direccion: orderData.shippingInfo.address,
            ciudad: orderData.shippingInfo.city,
            codigoPostal: orderData.shippingInfo.postalCode,
            telefono: orderData.shippingInfo.phone
          },
          
          // TODO : agregar item a strapi 
          // Items de la orden
          items: orderData.items.map(item => ({
            producto: item.id,
            cantidad: item.quantity,
            precioUnitario: item.precio,
            subtotal: item.precio * item.quantity
          })),
          
                
          // TODO : agregar item a strapi 
          // Metadatos adicionales
          metadata: {
            tipoUsuario: orderData.userType || 'invitado',
            ip: orderData.ip || null,
            userAgent: orderData.userAgent || null
          }
        }
      };

      const response = await axios.post('/pedidos', ordenData);
      return response.data.data;
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
      const response = await axios.get(`/pedidos/${orderId}?populate=*`);
      return response.data.data;
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
      const response = await axios.get(`/pedidos?filters[usuario][id][$eq]=${userId}&populate=*`);
      return response.data.data;
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
      const response = await axios.get(`/pedidos?filters[numeroOrden][$eq]=${orderNumber}&populate=*`);
      return response.data.data[0] || null;
    } catch (error) {
      console.error('Error fetching order by number:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de la orden
   * @param {number} orderId - ID de la orden
   * @param {string} estado - Nuevo estado
   * @returns {Promise} - Orden actualizada
   */
  async updateOrderStatus(orderId, estado) {
    try {
      const response = await axios.put(`/pedidos/${orderId}`, {
        data: { estado }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  /**
   * Confirmar pago de la orden
   * @param {number} orderId - ID de la orden
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise} - Orden actualizada
   */
  async confirmPayment(orderId, paymentData) {
    try {
      const response = await axios.put(`/pedidos/${orderId}`, {
        data: {
          estado: 'pagado',
          fechaPago: new Date().toISOString(),
          datosPago: {
            transactionId: paymentData.transactionId,
            paymentMethod: paymentData.paymentMethod,
            amount: paymentData.amount,
            currency: paymentData.currency || 'CLP'
          }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
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
      const response = await axios.get(`/pedidos?filters[usuario][email][$eq]=${email}&populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      throw error;
    }
  }
};
