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
      // Intentamos crear el usuario directamente
      // Si ya existe, Strapi retornará un error que manejaremos
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
      
      const response = await axios.post('/usuarios', newUserData);
      return response.data.data;
    } catch (error) {
      // Si el error es por email duplicado (constraint violation)
      if (error.response?.status === 400 && 
          error.response?.data?.error?.message?.includes('email')) {
        
        // El usuario ya existe, intentamos buscarlo por email
        // Nota: Esto requiere permisos de 'find' en Strapi
        try {
          const existingUserResponse = await axios.get(`/usuarios?filters[email][$eq]=${userData.email}`);
          
          if (existingUserResponse.data.data && existingUserResponse.data.data.length > 0) {
            return existingUserResponse.data.data[0];
          }
        } catch (findError) {
          console.error('Error finding existing user:', findError);
          // Si no podemos buscar, retornamos un error más descriptivo
          throw new Error('Usuario ya existe pero no se puede acceder. Verifica los permisos en Strapi.');
        }
      }
      
      console.error('Error creating guest user:', error);
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
