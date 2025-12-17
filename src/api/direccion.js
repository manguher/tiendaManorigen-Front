// src/api/direccion.js
import axios from './index';

export default {
  /**
   * Crear una nueva dirección
   * @param {Object} direccionData - Datos de la dirección
   * @returns {Promise} - Dirección creada
   */
  async createDireccion(direccionData) {
    try {
      const data = {
        data: {
          calle: direccionData.calle,
          ciudad: direccionData.ciudad,
          comuna: direccionData.comuna || null,
          region: direccionData.region || null,
          referencia: direccionData.referencia || null,
          codigoPostal: direccionData.codigoPostal,
          usuario: direccionData.usuarioId // Relación con el usuario
        }
      };

      console.log('📍 Creando dirección:', data);
      const response = await axios.post('/direccions', data);
      console.log('✅ Dirección creada:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error al crear dirección:', error);
      console.error('📋 Detalles:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  /**
   * Obtener direcciones de un usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise} - Lista de direcciones
   */
  async getDireccionesByUsuario(usuarioId) {
    try {
      const response = await axios.get(`/direccions?filters[usuario][id][$eq]=${usuarioId}&populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      throw error;
    }
  },

  /**
   * Obtener dirección por ID
   * @param {number} direccionId - ID de la dirección
   * @returns {Promise} - Datos de la dirección
   */
  async getDireccionById(direccionId) {
    try {
      const response = await axios.get(`/direccions/${direccionId}?populate=usuario`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      throw error;
    }
  },

  /**
   * Actualizar dirección
   * @param {number} direccionId - ID de la dirección
   * @param {Object} direccionData - Nuevos datos
   * @returns {Promise} - Dirección actualizada
   */
  async updateDireccion(direccionId, direccionData) {
    try {
      const response = await axios.put(`/direccions/${direccionId}`, {
        data: direccionData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  },

  /**
   * Eliminar dirección
   * @param {number} direccionId - ID de la dirección
   * @returns {Promise}
   */
  async deleteDireccion(direccionId) {
    try {
      const response = await axios.delete(`/direccions/${direccionId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      throw error;
    }
  }
};
