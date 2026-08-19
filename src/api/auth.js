import backendClient from './backendClient';

export default {
  async login(email, password) {
    const response = await backendClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(data) {
    const response = await backendClient.post('/auth/register', data);
    return response.data;
  },
};
