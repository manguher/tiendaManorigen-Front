// src/api/direccion.js
import backendClient from './backendClient';

export default {
  /**
   * Crear una nueva dirección o encontrar una existente idéntica
   * @param {Object} direccionData - Datos de la dirección
   * @returns {Promise} - Dirección creada o encontrada
   */
  async createOrFindDireccion(direccionData) {
    try {
      const data = {
        usuarioId: direccionData.usuarioId,
        calle: direccionData.calle,
        ciudad: direccionData.ciudad,
        comuna: direccionData.comuna || null,
        region: direccionData.region || null,
        referencia: direccionData.referencia || null,
        codigoPostal: direccionData.codigoPostal,
        nombreDestinatario: direccionData.nombreDestinatario || direccionData.nombreCompleto || null,
        telefonoContacto: direccionData.telefonoContacto || direccionData.telefono || null,
        esPrincipal: direccionData.esPrincipal || false
      };

      console.log('📍 Buscando direcciones existentes para el usuario:', data.usuarioId);
      
      // 1. Buscar direcciones existentes del usuario
      try {
        const direccionesExistentes = await this.getDireccionesByUsuario(data.usuarioId);
        
        if (direccionesExistentes && direccionesExistentes.length > 0) {
          // 2. Buscar una dirección que coincida exactamente en los campos clave
          const direccionCoincidente = direccionesExistentes.find(dir => 
            dir.calle.toLowerCase().trim() === data.calle.toLowerCase().trim() &&
            dir.ciudad.toLowerCase().trim() === data.ciudad.toLowerCase().trim() &&
            (dir.comuna || '').toLowerCase().trim() === (data.comuna || '').toLowerCase().trim() &&
            dir.codigoPostal === data.codigoPostal
          );
          
          if (direccionCoincidente) {
            console.log('✅ Dirección idéntica encontrada, reutilizando:', direccionCoincidente.id);
            return direccionCoincidente;
          }
        }
      } catch (searchError) {
        console.warn('⚠️ No se pudieron obtener las direcciones previas, procediendo a crear nueva:', searchError.message);
      }

      // 3. Si no existe, crearla
      console.log('📍 No se encontró dirección idéntica. Creando nueva dirección:', data);
      const response = await backendClient.post('/direcciones', data);
      console.log('✅ Dirección creada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear/buscar dirección:', error);
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
      const response = await backendClient.get(`/direcciones/usuario/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      throw error;
    }
  },

  /** TODO 
   * Obtener dirección por ID
   * @param {number} direccionId - ID de la dirección
   * @returns {Promise} - Datos de la dirección
   */
  async getDireccionById(direccionId) {
    try {
      const response = await backendClient.get(`/direcciones/${direccionId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      throw error;
    }
  },

  /** TODO 
   * Actualizar dirección
   * @param {number} direccionId - ID de la dirección
   * @param {Object} direccionData - Nuevos datos
   * @returns {Promise} - Dirección actualizada
   */
  async updateDireccion(direccionId, direccionData) {
    try {
      const response = await backendClient.put(`/direcciones/${direccionId}`, direccionData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  },

  /** TODO 
   * Eliminar dirección
   * @param {number} direccionId - ID de la dirección
   * @returns {Promise}
   */
  async deleteDireccion(direccionId) {
    try {
      const response = await backendClient.delete(`/direcciones/${direccionId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      throw error;
    }
  }
};
