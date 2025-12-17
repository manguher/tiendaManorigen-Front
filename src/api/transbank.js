import axios from 'axios';

/**
 * Módulo de integración con Transbank Webpay Plus
 * Para usar en producción, necesitas configurar el SDK de Transbank en tu backend
 */

const TRANSBANK_API_URL = import.meta.env.VITE_APP_TRANSBANK_API_URL || 'http://localhost:1337/api';

/**
 * Crea una transacción en Transbank
 * @param {Object} transactionData - Datos de la transacción
 * @returns {Promise<Object>} - Respuesta con token y URL de pago
 */
export const createTransaction = async (transactionData) => {
  try {
    const response = await axios.post(`${TRANSBANK_API_URL}/transbank/create`, {
      buyOrder: transactionData.buyOrder,
      sessionId: transactionData.sessionId,
      amount: transactionData.amount,
      returnUrl: transactionData.returnUrl
    });

    return {
      success: true,
      token: response.data.token,
      url: response.data.url
    };
  } catch (error) {
    console.error('Error al crear transacción Transbank:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al crear la transacción'
    };
  }
};

/**
 * Confirma una transacción de Transbank
 * @param {string} token - Token de la transacción
 * @returns {Promise<Object>} - Resultado de la confirmación
 */
export const confirmTransaction = async (token) => {
  try {
    const response = await axios.post(`${TRANSBANK_API_URL}/transbank/confirm`, {
      token
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al confirmar transacción Transbank:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al confirmar la transacción'
    };
  }
};

/**
 * Obtiene el estado de una transacción
 * @param {string} token - Token de la transacción
 * @returns {Promise<Object>} - Estado de la transacción
 */
export const getTransactionStatus = async (token) => {
  try {
    const response = await axios.get(`${TRANSBANK_API_URL}/transbank/status/${token}`);

    return {
      success: true,
      status: response.data.status,
      data: response.data
    };
  } catch (error) {
    console.error('Error al obtener estado de transacción:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener el estado'
    };
  }
};

/**
 * Genera un número de orden único
 * @returns {string} - Número de orden
 */
export const generateBuyOrder = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

/**
 * Genera un ID de sesión único
 * @returns {string} - ID de sesión
 */
export const generateSessionId = () => {
  return `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  createTransaction,
  confirmTransaction,
  getTransactionStatus,
  generateBuyOrder,
  generateSessionId
};
