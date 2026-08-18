import backendClient from './backendClient';

/**
 * Integración con Transbank Webpay Plus vía API Nest.
 * Flujo: POST /transbank/init { numeroOrden } → redirect a Webpay →
 * Webpay retorna a la API (returnUrl) → la API confirma y redirige a /pago/resultado.
 */

/**
 * Inicia una transacción Webpay para un pedido existente
 * @param {string} numeroOrden - Número de orden generado por la API
 * @returns {Promise<{success: boolean, token?: string, url?: string, error?: string}>}
 */
export const initTransaction = async (numeroOrden) => {
  try {
    const response = await backendClient.post('/transbank/init', { numeroOrden });
    return {
      success: true,
      token: response.data.token,
      url: response.data.url
    };
  } catch (error) {
    console.error('Error al iniciar transacción Transbank:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al iniciar la transacción'
    };
  }
};

/**
 * Redirige el browser a Webpay con un form POST (token_ws),
 * tal como requiere el flujo Webpay Plus.
 * @param {string} url - URL de Webpay entregada por init
 * @param {string} token - token_ws entregado por init
 */
export const redirectToWebpay = (url, token) => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'token_ws';
  input.value = token;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
};

export default {
  initTransaction,
  redirectToWebpay
};
