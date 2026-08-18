// src/api/usuario.js
import backendClient from './backendClient';

export default {
  /**
   * Crear o encontrar un usuario invitado por email
   * @param {Object} userData - Datos del usuario invitado
   * @returns {Promise} - Usuario creado o encontrado
   */
  async createOrFindGuestUser(userData) {
    try {
      console.log('🔍 Buscando usuario con email:', userData.email);
      
      const existingUser = await this.getUserByEmail(userData.email);
      
      if (existingUser) {
        console.log('✅ Usuario encontrado:', existingUser);
        return existingUser;
      }
      
      console.log('➕ Usuario no encontrado, creando nuevo usuario invitado...');
      
      const newUserData = {
        email: userData.email,
        nombre: userData.nombre,
        telefono: userData.telefono || null,
        password: null
      };
      
      console.log('📝 Datos del nuevo usuario:', newUserData);
      
      const response = await backendClient.post('/usuarios', newUserData);
      console.log('✅ Usuario creado exitosamente:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en createOrFindGuestUser:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  },

  /**
   * Obtener usuario por ID
   * @param {number} userId - ID del usuario
   * @returns {Promise} - Datos del usuario
   */
  async getUserById(userId) {
    try {
      const response = await backendClient.get(`/usuarios/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Obtener usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise} - Datos del usuario
   */
  async getUserByEmail(email) {
    try {
      const response = await backendClient.get(`/usuarios/email/${email}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  /**
   * Actualizar datos del usuario
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Nuevos datos del usuario
   * @returns {Promise} - Usuario actualizado
   */
  async updateUser(userId, userData) {
    try {
      const response = await backendClient.put(`/usuarios/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};
