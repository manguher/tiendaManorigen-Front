// src/api/usuario.js
import axios from './index';

export default {
  /**
   * Crear o encontrar un usuario invitado por email
   * @param {Object} userData - Datos del usuario invitado
   * @returns {Promise} - Usuario creado o encontrado
   */
  async createOrFindGuestUser(userData) {
    try {
      console.log('🔍 Buscando usuario con email:', userData.email);
      
      // Primero intentamos buscar si el usuario ya existe
      const existingUserResponse = await axios.get(`/usuarios?filters[email][$eq]=${userData.email}`);
      
      console.log('📊 Respuesta de búsqueda:', existingUserResponse.data);
      
      // Si el usuario existe, lo retornamos
      if (existingUserResponse.data.data && existingUserResponse.data.data.length > 0) {
        console.log('✅ Usuario encontrado:', existingUserResponse.data.data[0]);
        return existingUserResponse.data.data[0];
      }
      
      console.log('➕ Usuario no encontrado, creando nuevo usuario invitado...');
      
      // Si no existe, creamos un nuevo usuario
      const newUserData = {
        data: {
          email: userData.email,
          nombre: userData.nombre,
          telefono: userData.telefono || null,
          tipo: 'invitado', // Marcamos como usuario invitado
          fechaRegistro: new Date().toISOString(),
          activo: true
        }
      };
      
      console.log('📝 Datos del nuevo usuario:', newUserData);
      
      const response = await axios.post('/usuarios', newUserData);
      console.log('✅ Usuario creado exitosamente:', response.data.data);
      return response.data.data;
      
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
      const response = await axios.get(`/usuarios/${userId}`);
      return response.data.data;
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
      const response = await axios.get(`/usuarios?filters[email][$eq]=${email}`);
      return response.data.data[0] || null;
    } catch (error) {
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
      const response = await axios.put(`/usuarios/${userId}`, {
        data: userData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};
